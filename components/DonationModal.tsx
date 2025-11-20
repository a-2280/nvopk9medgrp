"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function DonationModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const createSession = async (amountInCents: number) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ amount: amountInCents }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetAmount = (cents: number) => {
    setSelectedAmount(cents);
    setAmount("");
    createSession(cents);
  };

  const handleCustomAmount = () => {
    const dollars = parseFloat(amount);
    if (!dollars || dollars < 1) {
      setError("Enter at least $1");
      return;
    }
    const amountInCents = Math.round(dollars * 100);
    setSelectedAmount(amountInCents);
    createSession(amountInCents);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedAmount(null);
      setAmount("");
      setError("");
      setClientSecret("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full min-h-[250px] max-h-[100dvh] lg:max-w-[600px] lg:max-h-[92dvh] overflow-scroll no-scrollbar">
        <DialogHeader>
          <DialogTitle>Support K9 Medical Care</DialogTitle>
          <DialogDescription>
            Your donation helps provide life-saving medical training and
            equipment for working dogs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset Amounts */}
          <div className="grid grid-cols-4 gap-2">
            <Button onClick={() => handlePresetAmount(2500)} disabled={loading}>
              $25
            </Button>
            <Button onClick={() => handlePresetAmount(5000)} disabled={loading}>
              $50
            </Button>
            <Button
              onClick={() => handlePresetAmount(10000)}
              disabled={loading}
            >
              $100
            </Button>
            <Button
              onClick={() => handlePresetAmount(25000)}
              disabled={loading}
            >
              $250
            </Button>
          </div>

          {/* Custom Amount */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleCustomAmount} disabled={loading || !amount}>
              Set Amount
            </Button>
          </div>

          {/* Loading */}
          {loading && <p className="text-center">Loading...</p>}

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Checkout Form */}
          {clientSecret && selectedAmount && (
            <CheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm selectedAmount={selectedAmount} />
            </CheckoutProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
