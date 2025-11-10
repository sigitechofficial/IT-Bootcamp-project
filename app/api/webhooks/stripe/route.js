// app/api/webhooks/stripe/route.js
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// init Stripe & Resend
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  })
  : null;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const COMPANY_NAME = "IT Job Now";
const SUPPORT_EMAIL = "support@itjobnow.com.au";

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "Webhook endpoint is accessible",
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
  if (!stripe) {
    console.error("❌ STRIPE_SECRET_KEY is not configured!");
    return new Response("Stripe secret key not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

  // raw body for verification
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified:", event.type, event.id);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(
          `Processing checkout.session.completed for session: ${session.id}`
        );

        // basic info
        const customerEmail = session.customer_details?.email ?? null;
        const customerName = session.customer_details?.name ?? "there";
        const amountTotal = session.amount_total
          ? (session.amount_total / 100).toFixed(2)
          : null;
        const currency = session.currency
          ? session.currency.toUpperCase()
          : "AUD";

        // get line items to infer bootcamp name
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 1 }
        );
        const firstItem = lineItems.data[0];

        const bootcampName =
          (session.metadata && session.metadata.bootcamp_name) ||
          firstItem?.description ||
          (firstItem?.price?.nickname ?? "IT Job Now Bootcamp");

        // date of payment
        const paidAt = new Date(session.created * 1000).toLocaleString(
          "en-AU",
          { timeZone: "Australia/Sydney" }
        );

        if (!customerEmail) {
          console.warn(
            `⚠️ No email address found on session ${session.id}, skipping email`
          );
          break;
        }

        if (!resend) {
          console.error("❌ RESEND_API_KEY not configured, cannot send email.");
          break;
        }

        const html = buildEnrollmentEmail({
          customerName,
          customerEmail,
          amountPaid: amountTotal ? `${currency} ${amountTotal}` : "Paid",
          bootcampName,
          paidAt,
          stripeSessionId: session.id,
          companyName: COMPANY_NAME,
          supportEmail: SUPPORT_EMAIL,
        });

        const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

        // try send
        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: customerEmail,
          subject: `Enrolment confirmed – ${bootcampName}`,
          html,
        });

        if (emailResponse.data) {
          console.log(
            `✅ Email sent to ${customerEmail}. Resend id: ${emailResponse.data.id}`
          );
        } else if (emailResponse.error) {
          console.error("❌ Error sending email:", emailResponse.error);
        }

        break;
      }

      default:
        // not interested in other events now
        console.log(`Ignoring event type ${event.type}`);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Handler error:", err);
    return new Response(`Handler Error: ${err.message}`, { status: 500 });
  }
}

// helper to build HTML email
function buildEnrollmentEmail({
  customerName,
  customerEmail,
  amountPaid,
  bootcampName,
  paidAt,
  stripeSessionId,
  companyName,
  supportEmail,
}) {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Bootcamp enrolment confirmed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="background-color:#f4f4f5;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
      <div style="background:#0f172a;color:#ffffff;padding:24px 32px;">
        <h1 style="margin:0;font-size:20px;">Your enrolment is confirmed 🎉</h1>
        <p style="margin-top:6px;opacity:0.8;">${bootcampName}</p>
      </div>
      <div style="padding:28px 32px 32px 32px;">
        <p>Hi ${customerName},</p>
        <p>Thanks for your payment. This email confirms your successful enrolment in <strong>${bootcampName}</strong>.</p>
        <p style="font-size:13px;color:#4b5563;">
          We’ve received <strong>${amountPaid}</strong> via Stripe on
          <strong>${paidAt}</strong>.
        </p>

        <div style="background:#f4f4f5;border-radius:10px;padding:16px 18px;margin-top:20px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">
            <span>Bootcamp</span>
            <span><strong>${bootcampName}</strong></span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">
            <span>Student email</span>
            <span>${customerEmail}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">
            <span>Amount</span>
            <span>${amountPaid}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:14px;">
            <span>Stripe reference</span>
            <span>${stripeSessionId}</span>
          </div>
        </div>

        <p style="margin-top:20px;">What’s next?</p>
        <ul style="color:#4b5563;padding-left:18px;">
          <li>You’ll receive access / onboarding details shortly.</li>
          <li>Keep this email as your receipt.</li>
          <li>If something looks wrong, just reply to this email.</li>
        </ul>

        <p style="margin-top:22px;margin-bottom:8px;">
          Cheers,<br />
          The ${companyName} Team
        </p>

        <p style="font-size:13px;color:#4b5563;margin-top:12px;">
          Need help? Contact us at ${supportEmail}.
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#6b7280;font-size:12px;margin-top:18px;">
      © ${year} ${companyName}. All rights reserved.
    </p>
  </body>
</html>`;
}
