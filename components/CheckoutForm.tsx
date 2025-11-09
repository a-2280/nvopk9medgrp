"use client";

import { PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutForm({
  selectedAmount,
}: {
  selectedAmount: number;
}) {
  const checkout = useCheckout();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkout.type !== "success") return;

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await checkout.checkout.confirm({ email });

    if (result.type === "error") {
      setError(result.error.message || "Payment failed");
      setSubmitting(false);
    }
  };

  if (checkout.type === "loading") {
    return <div className="py-8 text-center">Loading payment form...</div>;
  }

  if (checkout.type === "error") {
    return <div className="text-red-500 text-sm">{checkout.error.message}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium block mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <PaymentElement />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting
          ? "Processing..."
          : `Complete Donation ($${(selectedAmount / 100).toFixed(2)})`}
      </Button>
    </form>
  );
}
