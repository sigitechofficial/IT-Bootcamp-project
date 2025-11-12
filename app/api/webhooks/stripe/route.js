// app/api/webhooks/stripe/route.js
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      ok: true,
      env: {
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
        RESEND_API_KEY: !!process.env.RESEND_API_KEY,
        EMAIL_FROM: !!process.env.EMAIL_FROM,
      },
    }),
    { status: 200 }
  );
}

export async function POST(req) {
  if (!stripe) {
    return new Response("Stripe not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ webhook verified", event.type, event.id);
  } catch (err) {
    console.error("❌ webhook verify fail:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // 1) Checkout session: just note what was bought (we could store, but we can also re-fetch later)
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("➡ checkout.session.completed for", session.id);
        // we don’t send the email here because the charge/receipt may not exist yet
        break;
      }

      // 2) Payment intent succeeded: now we are SURE the charge exists → get receipt → find checkout session → send email
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        console.log("➡ payment_intent.succeeded for", pi.id);

        // get the charge so we can pull receipt + card details
        const charge =
          pi.charges && pi.charges.data && pi.charges.data[0]
            ? pi.charges.data[0]
            : null;

        if (!charge) {
          console.warn(
            "⚠ payment_intent.succeeded but no charge yet — cannot build receipt"
          );
          break;
        }

        const receiptUrl = charge.receipt_url || null;
        const card = charge.payment_method_details?.card;
        const cardBrand = card?.brand ?? null;
        const cardLast4 = card?.last4 ?? null;

        // now we need to know WHAT the user bought → pull the checkout session by payment_intent
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: pi.id,
          limit: 1,
        });

        const session = sessions.data[0];
        if (!session) {
          console.warn(
            "⚠ payment_intent.succeeded but no Checkout Session found for PI",
            pi.id
          );
          break;
        }

        // basic info from session
        const customerEmail = session.customer_details?.email ?? null;
        const customerName = session.customer_details?.name ?? "there";
        const amountTotal = session.amount_total
          ? (session.amount_total / 100).toFixed(2)
          : null;
        const currency = (session.currency || "aud").toUpperCase();

        // get line item to infer bootcamp name
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 1 }
        );
        const firstItem = lineItems.data[0];

        const bootcampName =
          (session.metadata && session.metadata.bootcamp_name) ||
          firstItem?.description ||
          (firstItem?.price?.nickname ?? "IT Job Now Bootcamp");

        const paidAt = new Date(session.created * 1000).toLocaleString(
          "en-AU",
          { timeZone: "Australia/Sydney" }
        );

        if (!customerEmail) {
          console.warn(
            "⚠ payment_intent.succeeded but session has no email, skipping"
          );
          break;
        }
        if (!resend) {
          console.error("❌ RESEND_API_KEY missing");
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
          receiptUrl,
          cardBrand,
          cardLast4,
        });

        const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

        const sendPayload = {
          from: fromEmail,
          to: customerEmail,
          subject: `Enrolment confirmed – ${bootcampName}`,
          html,
        };

        const resp = await resend.emails.send(sendPayload);
        if (resp.error) {
          console.error("❌ Resend error:", resp.error);
        } else {
          console.log("✅ email sent to", customerEmail);
        }

        const adminEmail =
          process.env.ADMIN_ENROLLMENT_EMAIL ||
          process.env.ADMIN_NOTIFICATION_EMAIL ||
          process.env.ADMIN_EMAIL ||
          SUPPORT_EMAIL;

        if (adminEmail) {
          const adminHtml = buildAdminEnrollmentEmail({
            customerName,
            customerEmail,
            amountPaid: amountTotal ? `${currency} ${amountTotal}` : "Paid",
            bootcampName,
            paidAt,
            stripeSessionId: session.id,
            receiptUrl,
            cardBrand,
            cardLast4,
          });

          const adminPayload = {
            from: fromEmail,
            to: adminEmail,
            subject: `New enrolment: ${customerName} – ${bootcampName}`,
            html: adminHtml,
          };

          const adminResp = await resend.emails.send(adminPayload);
          if (adminResp.error) {
            console.error("❌ Resend admin email error:", adminResp.error);
          } else {
            console.log("✅ admin email sent to", adminEmail);
          }
        } else {
          console.warn("⚠ Admin email not configured; skipping admin notification");
        }

        break;
      }

      default:
        console.log("Ignoring event:", event.type);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ handler error:", err);
    return new Response(`Handler Error: ${err.message}`, { status: 500 });
  }
}

// email template
function buildEnrollmentEmail({
  customerName,
  customerEmail,
  amountPaid,
  bootcampName,
  paidAt,
  stripeSessionId,
  companyName,
  supportEmail,
  receiptUrl,
  cardBrand,
  cardLast4,
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
        <p>Thanks for your payment. This email confirms your enrolment in <strong>${bootcampName}</strong>.</p>
        <p style="font-size:13px;color:#4b5563;">
          We’ve received <strong>${amountPaid}</strong> on
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
          ${cardBrand || cardLast4
      ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;">
                  <span>Payment method</span>
                  <span>${cardBrand ? cardBrand.toUpperCase() : ""}${cardLast4 ? " •••• " + cardLast4 : ""
      }</span>
                </div>`
      : ""
    }
          <div style="display:flex;justify-content:space-between;font-size:14px;">
            <span>Stripe reference</span>
            <span>${stripeSessionId}</span>
          </div>
        </div>

        ${receiptUrl
      ? `<p style="margin-top:18px;font-size:13px;color:#4b5563;">
                You can view or download your Stripe receipt here:
                <a href="${receiptUrl}" style="color:#0f172a;">View receipt</a>
              </p>`
      : `<p style="margin-top:18px;font-size:13px;color:#4b5563;">
                (We couldn’t attach a receipt link automatically for this payment yet.)
              </p>`
    }

        <p style="margin-top:20px;">What’s next?</p>
        <ul style="color:#4b5563;padding-left:18px;">
          <li>You’ll receive onboarding / access details shortly.</li>
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

function buildAdminEnrollmentEmail({
  customerName,
  customerEmail,
  amountPaid,
  bootcampName,
  paidAt,
  stripeSessionId,
  receiptUrl,
  cardBrand,
  cardLast4,
}) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>New enrolment received</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="background-color:#f4f4f5;margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#111827;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;border:1px solid #e5e7eb;padding:24px 28px;">
      <h2 style="margin-top:0;margin-bottom:12px;">New enrolment received</h2>
      <p style="margin-top:0;margin-bottom:18px;">A student just completed their payment. Details below:</p>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          <tr>
            <td style="padding:6px 0;font-weight:600;width:40%;">Student name</td>
            <td style="padding:6px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">Student email</td>
            <td style="padding:6px 0;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">Bootcamp</td>
            <td style="padding:6px 0;">${bootcampName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">Amount paid</td>
            <td style="padding:6px 0;">${amountPaid}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">Paid at</td>
            <td style="padding:6px 0;">${paidAt}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">Stripe session</td>
            <td style="padding:6px 0;">${stripeSessionId}</td>
          </tr>
          ${
            cardBrand || cardLast4
              ? `<tr>
            <td style="padding:6px 0;font-weight:600;">Payment method</td>
            <td style="padding:6px 0;">${cardBrand ? cardBrand.toUpperCase() : ""}${
                  cardLast4 ? " •••• " + cardLast4 : ""
                }</td>
          </tr>`
              : ""
          }
        </tbody>
      </table>
      ${
        receiptUrl
          ? `<p style="margin-top:18px;">Receipt: <a href="${receiptUrl}" style="color:#0f172a;">View Stripe receipt</a></p>`
          : ""
      }
    </div>
  </body>
</html>`;
}
