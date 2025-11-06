import Stripe from "stripe";

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, customerId, currency = "usd" } = body || {};

        if (!process.env.STRIPE_SECRET_KEY) {
            return new Response(
                JSON.stringify({ status: "0", message: "Missing STRIPE_SECRET_KEY" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!amount) {
            return new Response(
                JSON.stringify({ status: "0", message: "Missing amount" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Accept amount as cents or dollars; normalize to integer cents
        let normalizedAmount = amount;
        if (typeof normalizedAmount === "string") {
            const cleaned = normalizedAmount.replace(/[^0-9.]/g, "");
            const asNumber = Number.parseFloat(cleaned);
            normalizedAmount = Number.isFinite(asNumber) ? Math.round(asNumber * 100) : NaN;
        }
        if (typeof normalizedAmount === "number" && !Number.isInteger(normalizedAmount)) {
            // If a float was passed, assume dollars and convert to cents
            normalizedAmount = Math.round(normalizedAmount * 100);
        }
        if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
            return new Response(
                JSON.stringify({ status: "0", message: "Invalid amount" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2024-06-20",
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: normalizedAmount,
            currency,
            customer: customerId || undefined,
            payment_method_types: ['card'],
            //automatic_payment_methods: { enabled: true },
            // capture_method: "auto", // authorize first; capture later upon booking
        });

        return new Response(
            JSON.stringify({
                status: "1",
                data: {
                    clientSecret: paymentIntent.client_secret,
                    amount: normalizedAmount,
                    currency,
                    paymentIntentId: paymentIntent.id,
                },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ status: "0", message: error?.message || "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}


