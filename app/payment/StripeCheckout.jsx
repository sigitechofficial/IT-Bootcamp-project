"use client";

import React, { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";


function formatUsdCents(amountCents) {
    const dollars = (amountCents || 0) / 100;
    return dollars.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function CheckoutForm({ onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setProcessing] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (paymentIntent?.status === "requires_capture") {
            onSuccess?.({
                paymentIntentId: paymentIntent.id,
                paymentMethodId: paymentIntent.payment_method,
            });
            setProcessing(false);
            setMessage("");
            return;
        }

        if (error) {
            setMessage(error.message || "Payment failed");
        } else if (paymentIntent) {
            setMessage(`Payment status: ${paymentIntent.status}`);
        }
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`mt-4 w-full flex justify-center items-center ${isProcessing ? "bg-primary/50" : "bg-primary"
                    } text-white px-4 py-3 rounded-lg font-semibold`}
            >
                {isProcessing ? "Processing..." : "Pay Now"}
            </button>
            {message && <div className="text-red-500 mt-2">{message}</div>}
        </form>
    );
}

export default function StripeCheckout({ totalAmountCents, customerId, onSuccess }) {
    const [clientSecret, setClientSecret] = useState("");
    const [displayAmount, setDisplayAmount] = useState(0);
    const publishableKey =
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_2;
    const stripePromise = useMemo(() => {
        if (!publishableKey) return null;
        return loadStripe(publishableKey);
    }, [publishableKey]);

    useEffect(() => {
        if (!publishableKey) return;
        async function createIntent() {
            const res = await fetch("/api/stripe/create-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: totalAmountCents, customerId }),
            });
            const data = await res.json();
            if (data?.status === "1") {
                setClientSecret(data.data.clientSecret);
                setDisplayAmount(data.data.amount);
            } else {
                throw new Error(data?.message || "Failed to create intent");
            }
        }
        createIntent();
    }, [totalAmountCents, customerId, publishableKey]);

    const options = useMemo(
        () => ({
            clientSecret,
            appearance: { theme: "stripe" },
        }),
        [clientSecret]
    );

    if (!publishableKey) {
        return (
            <div className="max-w-xl mx-auto w-full text-center text-red-500">
                Stripe publishable key is not configured.
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto w-full">
            {clientSecret && stripePromise ? (
                <>
                    <div className="mb-4 text-center font-semibold">
                        Total: {formatUsdCents(displayAmount)}
                    </div>
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm onSuccess={onSuccess} />
                    </Elements>
                </>
            ) : (
                <div className="text-center">Preparing secure payment...</div>
            )}
        </div>
    );
}


