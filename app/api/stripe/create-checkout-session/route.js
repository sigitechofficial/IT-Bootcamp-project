import Stripe from "stripe";

export async function POST(req) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return new Response(
                JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2024-06-20",
        });

        const body = await req.json();
        const { amount, currency = "usd", productName = "Payment" } = body || {};

        if (!amount || !Number.isFinite(Number(amount))) {
            return new Response(
                JSON.stringify({ error: "Invalid or missing amount (in cents)" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const origin = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "";
        const successUrl = `${origin}/`;
        const cancelUrl = `${origin}/`;

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: { name: productName },
                        unit_amount: Number(amount),
                    },
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return new Response(JSON.stringify({ url: session.url, id: session.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err?.message || "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}


