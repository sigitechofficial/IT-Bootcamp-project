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
    console.error("❌ No STRIPE_SECRET_KEY");
    return new Response("Stripe not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ No stripe-signature header");
    return new Response("Missing signature", { status: 400 });
  }

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
    console.error("❌ webhook verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("➡ checkout.session.completed for", session.id);

        const customerEmail = session.customer_details?.email ?? null;
        const customerName = session.customer_details?.name ?? "there";
        const amountTotal = session.amount_total
          ? (session.amount_total / 100).toFixed(2)
          : null;
        const currency = (session.currency || "aud").toUpperCase();

        // get product / bootcamp name
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 1 }
        );
        const firstItem = lineItems.data[0];
        const bootcampName =
          (session.metadata && session.metadata.bootcamp_name) ||
          firstItem?.description ||
          (firstItem?.price?.nickname ?? "IT Job Now Bootcamp");

        const paidAt = new Date(session.created * 1000).toISOString();

        // ---------- 1) Try invoice PDF (your event has invoice: null, so this will just skip) ----------
        let attachment = null;
        if (session.invoice) {
          try {
            const invoice = await stripe.invoices.retrieve(session.invoice);
            if (invoice.invoice_pdf) {
              const pdfRes = await fetch(invoice.invoice_pdf);
              const buff = await pdfRes.arrayBuffer();
              attachment = {
                filename: `invoice-${invoice.number || invoice.id}.pdf`,
                content: Buffer.from(buff).toString("base64"),
              };
              console.log("✅ will attach invoice PDF");
            }
          } catch (err) {
            console.warn("⚠ invoice fetch failed:", err.message);
          }
        }

        // ---------- 2) Get receipt URL ----------
        let receiptUrl = null;
        let cardBrand = null;
        let cardLast4 = null;

        // (a) invoice path (will be skipped for your event)
        if (session.invoice) {
          try {
            const invoice = await stripe.invoices.retrieve(session.invoice);
            if (invoice.charge) {
              const charge =
                typeof invoice.charge === "string"
                  ? await stripe.charges.retrieve(invoice.charge)
                  : invoice.charge;
              receiptUrl = charge.receipt_url || null;
              const card = charge.payment_method_details?.card;
              cardBrand = card?.brand ?? null;
              cardLast4 = card?.last4 ?? null;
              console.log("✅ got receipt from invoice charge:", receiptUrl);
            }
          } catch (err) {
            console.warn("⚠ could not get receipt from invoice charge:", err.message);
          }
        }

        // (b) fallback to payment_intent — THIS is the path for your event
        if (!receiptUrl && session.payment_intent) {
          console.log(
            "ℹ trying to retrieve payment_intent to get receipt:",
            session.payment_intent
          );
          try {
            const pi = await stripe.paymentIntents.retrieve(
              session.payment_intent,
              { expand: ["charges.data.payment_method_details"] }
            );

            if (!pi.charges || pi.charges.data.length === 0) {
              console.warn(
                "⚠ payment_intent has no charges, cannot get receipt_url"
              );
            } else {
              const charge = pi.charges.data[0];
              receiptUrl = charge.receipt_url || null;
              const card = charge.payment_method_details?.card;
              cardBrand = card?.brand ?? null;
              cardLast4 = card?.last4 ?? null;
              console.log("✅ got receipt from payment_intent charge:", receiptUrl);
            }
          } catch (err) {
            // THIS is what happens when you send a "fake" dashboard webhook
            console.error(
              "❌ could not retrieve payment_intent from Stripe. If this is a dashboard 'Send test webhook', the PI does not exist in Stripe:",
              err.message
            );
          }
        }

        if (!customerEmail) {
          console.warn("⚠ no customer email, skipping send");
          break;
        }
        if (!resend) {
          console.error("❌ no RESEND_API_KEY, cannot send email");
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
          receiptUrl, // may be null
          cardBrand,
          cardLast4,
        });

        const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

        const payload = {
          from: fromEmail,
          to: customerEmail,
          subject: `Enrolment confirmed – ${bootcampName}`,
          html,
        };

        if (attachment) {
          payload.attachments = [attachment];
        }

        const resp = await resend.emails.send(payload);
        if (resp.error) {
          console.error("❌ resend error:", resp.error);
        } else {
          console.log("✅ email sent to", customerEmail);
        }

        break;
      }

      default:
        console.log("event ignored:", event.type);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ handler error:", err);
    return new Response(`Handler Error: ${err.message}`, { status: 500 });
  }
}

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
                We couldn't auto-fetch a receipt link from Stripe for this test event.
                If this was from Dashboard “Send test webhook”, run a real test payment and you’ll see it here.
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
