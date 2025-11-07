import Stripe from "stripe";
import { Resend } from "resend";
import type { NextRequest } from "next/server";

// (Optional) KV for idempotency if you want to guard against duplicates
// import { kv } from "@vercel/kv";

export const runtime = "nodejs"; // Stripe SDK needs Node runtime (not edge)
export const dynamic = "force-dynamic"; // ensures we get the raw body

// Initialize Stripe and Resend only if keys are available (for GET endpoint to work)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// GET endpoint for testing if the webhook route is accessible
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "Webhook endpoint is accessible",
      endpoint: "/api/webhooks/stripe",
      timestamp: new Date().toISOString(),
      envCheck: {
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasResendApiKey: !!process.env.RESEND_API_KEY,
        hasEmailFrom: !!process.env.EMAIL_FROM,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(req: NextRequest) {
  // Check if Stripe is initialized
  if (!stripe) {
    console.error("❌ STRIPE_SECRET_KEY is not configured!");
    return new Response("Stripe secret key not configured", { status: 500 });
  }

  // Log that a request was received
  console.log("=== WEBHOOK REQUEST RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  const sig = req.headers.get("stripe-signature");
  console.log("Stripe signature present:", !!sig);

  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  // IMPORTANT: use the raw body for Stripe signature verification
  const rawBody = await req.text();
  console.log("Raw body length:", rawBody.length);

  // Check if webhook secret is configured
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not configured!");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    console.log("Attempting to verify webhook signature...");
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified successfully");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Webhook signature verification failed:", errorMessage);
    console.error("Error details:", err);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // (Optional) dedupe on event.id since Stripe may retry
  // const processedKey = `stripe_event_${event.id}`;
  // const already = await kv.get(processedKey);
  // if (already) return new Response("OK (deduped)", { status: 200 });

  try {
    console.log(
      `Received Stripe webhook event: ${event.type} (ID: ${event.id})`
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          `Processing checkout.session.completed for session: ${session.id}`
        );

        // Payment Links also create Checkout Sessions.
        // email can be here:
        const email =
          session.customer_details?.email ||
          (typeof session.customer === "object" &&
          session.customer !== null &&
          "email" in session.customer
            ? (session.customer as { email: string }).email
            : null) ||
          null;

        // Useful extras for your email
        const customerName = session.customer_details?.name ?? "there";
        const amountTotal = session.amount_total
          ? (session.amount_total / 100).toFixed(2)
          : null;
        const currency = session.currency?.toUpperCase();

        // Send email with Resend
        if (email) {
          if (!resend) {
            console.error(
              "❌ RESEND_API_KEY is not configured! Cannot send email."
            );
            break;
          }

          try {
            console.log(
              `Attempting to send email to: ${email} for checkout session: ${session.id}`
            );

            const emailResponse = await resend.emails.send({
              from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
              to: email,
              subject: "Thanks for your purchase!",
              text:
                `Hi ${customerName},\n\n` +
                `We've received your payment${
                  amountTotal ? ` of ${amountTotal} ${currency}` : ""
                }. ` +
                `Your order is now being processed.\n\n` +
                `If you have any questions, just reply to this email.\n\n` +
                `— Team`,
              // If you prefer HTML:
              // html: `<p>Hi ${customerName},</p><p>Thanks for your payment...</p>`
            });

            if (emailResponse.data) {
              console.log(
                `✅ Email sent successfully to ${email}. Email ID: ${emailResponse.data.id}`
              );
            } else {
              console.error(
                `❌ Email send failed for ${email}. Response:`,
                emailResponse
              );
            }
          } catch (emailError: unknown) {
            const errorMessage =
              emailError instanceof Error
                ? emailError.message
                : "Unknown error";
            console.error(`❌ Error sending email to ${email}:`, {
              message: errorMessage,
              error: emailError,
              checkoutSessionId: session.id,
              customerName: customerName,
              amountTotal: amountTotal,
            });
          }
        } else {
          console.warn(
            `⚠️ No email address found for checkout session: ${session.id}`
          );
        }

        // (Optional) mark processed to avoid duplicates later
        // await kv.set(processedKey, "1", { ex: 60 * 60 * 24 });

        break;
      }

      // If you prefer payment_intent.succeeded instead:
      // case "payment_intent.succeeded": { ... }

      default:
        // ignore other events
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (e: unknown) {
    // Make sure to return 200 only when you truly handled it
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.error("Handler Error:", errorMessage, e);
    return new Response(`Handler Error: ${errorMessage}`, { status: 500 });
  }
}
