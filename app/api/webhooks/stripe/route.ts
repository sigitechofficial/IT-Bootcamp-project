import Stripe from "stripe";
import { Resend } from "resend";
import type { NextRequest } from "next/server";

// (Optional) KV for idempotency if you want to guard against duplicates
// import { kv } from "@vercel/kv";

export const runtime = "nodejs"; // Stripe SDK needs Node runtime (not edge)
export const dynamic = "force-dynamic"; // ensures we get the raw body

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  // IMPORTANT: use the raw body for Stripe signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
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
