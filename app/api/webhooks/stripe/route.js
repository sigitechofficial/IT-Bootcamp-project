// app/api/webhooks/stripe/route.js
import Stripe from "stripe";
import { Resend } from "resend";

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

export async function POST(req) {
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

  // Get the signature from headers first (before consuming body)
  const sig = req.headers.get("stripe-signature");
  console.log("Stripe signature present:", !!sig);

  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  // Read the raw request body for signature verification
  // This must be the raw body as a string, not parsed JSON
  const rawBody = await req.text();
  console.log("Raw body preview:", rawBody.substring(0, 200) + (rawBody.length > 200 ? "..." : ""));
  console.log("Raw body length:", rawBody.length);

  // Parse the body for additional logging (without signature verification yet)
  try {
    const parsedBody = JSON.parse(rawBody);
    console.log("Parsed event type:", parsedBody.type);
    console.log("Parsed event ID:", parsedBody.id);
  } catch {
    console.log("Could not parse body as JSON for logging");
  }

  // IMPORTANT: use the raw body for Stripe signature verification
  console.log("Attempting to verify webhook signature...");
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified successfully");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Webhook signature verification failed:", errorMessage);
    console.error("Error details:", err);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  try {
    console.log(
      `Received Stripe webhook event: ${event.type} (ID: ${event.id})`
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(
          `Processing checkout.session.completed for session: ${session.id}`
        );

        // Try to get the customer's email
        const email =
          session.customer_details?.email ||
          (typeof session.customer === "object" &&
            session.customer !== null &&
            "email" in session.customer
            ? session.customer.email
            : null) ||
          null;

        const customerName = session.customer_details?.name ?? "there";
        const amountTotal = session.amount_total
          ? (session.amount_total / 100).toFixed(2)
          : null;
        const currency = session.currency?.toUpperCase();

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

            // Use Resend's test domain for development if custom domain not verified
            // For production, verify your domain at https://resend.com/domains
            let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

            const emailText =
              `Hi ${customerName},\n\n` +
              `We've received your payment${amountTotal ? ` of ${amountTotal} ${currency}` : ""
              }. ` +
              `Your order is now being processed.\n\n` +
              `If you have any questions, just reply to this email.\n\n` +
              `— Team`;

            let emailResponse = await resend.emails.send({
              from: fromEmail,
              to: email,
              subject: "Thanks for your purchase!",
              text: emailText,
            });

            // If domain verification error, retry with test domain
            if (emailResponse.error &&
              emailResponse.error.statusCode === 403 &&
              emailResponse.error.message?.includes("domain is not verified")) {
              console.warn(
                `⚠️ Custom domain not verified, falling back to test domain. Error: ${emailResponse.error.message}`
              );
              fromEmail = "onboarding@resend.dev";
              emailResponse = await resend.emails.send({
                from: fromEmail,
                to: email,
                subject: "Thanks for your purchase!",
                text: emailText,
              });
            }

            if (emailResponse.data) {
              console.log(
                `✅ Email sent successfully to ${email} from ${fromEmail}. Email ID: ${emailResponse.data.id}`
              );
            } else if (emailResponse.error) {
              console.error(
                `❌ Email send failed for ${email}. Response:`,
                emailResponse
              );
            }
          } catch (emailError) {
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

        break;
      }

      default:
        // ignore other events
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.error("Handler Error:", errorMessage, e);
    return new Response(`Handler Error: ${errorMessage}`, { status: 500 });
  }
}
