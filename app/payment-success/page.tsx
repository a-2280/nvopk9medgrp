"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Payment Success Page
 *
 * This page is shown after a successful Stripe payment. The user is redirected
 * here by Stripe after calling stripe.confirmPayment() in CheckoutPage.
 *
 * HOW THIS PAGE WORKS:
 *
 * 1. STRIPE REDIRECT
 *    - After successful payment, Stripe redirects to the return_url we specified
 *    - The URL includes query parameters with payment information
 *    - Example: /payment-success?payment_intent=pi_xxx&payment_intent_client_secret=pi_xxx_secret_xxx
 *
 * 2. URL PARAMETERS EXPLAINED
 *    - payment_intent: The ID of the Payment Intent (starts with "pi_")
 *    - payment_intent_client_secret: The client secret for verification
 *    - redirect_status: The status of the payment (usually "succeeded")
 *
 * 3. VERIFICATION (Optional but Recommended)
 *    - We can use the payment_intent ID to verify the payment on our server
 *    - This ensures the payment actually went through (prevents URL manipulation)
 *    - For now, we're showing success based on Stripe's redirect
 *
 * SECURITY NOTE:
 * In a production app, you should verify the payment_intent with your backend
 * before showing success. This prevents users from bookmarking this page or
 * manually navigating to it without actually paying.
 */
export default function PaymentSuccessPage() {
  // ACCESS URL PARAMETERS
  // useSearchParams() gives us access to query parameters in the URL
  // These are added by Stripe when they redirect the user here
  const searchParams = useSearchParams();

  // STATE MANAGEMENT
  // We track whether we're still loading/verifying the payment
  const [isLoading, setIsLoading] = useState(true);

  // Extract payment information from URL parameters
  // payment_intent: Unique ID for this payment (e.g., "pi_3AbC123...")
  const paymentIntent = searchParams.get("payment_intent");

  // payment_intent_client_secret: Secret token for this payment
  // This is sensitive and should never be logged or exposed
  const clientSecret = searchParams.get("payment_intent_client_secret");

  // redirect_status: Tells us if payment succeeded, failed, or is processing
  // Possible values: "succeeded", "processing", "requires_payment_method"
  const redirectStatus = searchParams.get("redirect_status");

  /**
   * EFFECT: VERIFY PAYMENT ON MOUNT
   *
   * This runs once when the component loads. Here we could:
   * 1. Verify the payment with our backend
   * 2. Store payment details in our database
   * 3. Send a confirmation email
   * 4. Update user's account/subscription
   *
   * For this educational example, we're keeping it simple and just
   * simulating a loading state.
   */
  useEffect(() => {
    // OPTIONAL: Verify payment with your backend
    // This is a placeholder for where you'd make an API call like:
    //
    // async function verifyPayment() {
    //   try {
    //     const response = await fetch('/api/verify-payment', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ paymentIntentId: paymentIntent })
    //     });
    //     const data = await response.json();
    //     // Check if payment is actually successful
    //     if (data.status === 'succeeded') {
    //       // Payment verified!
    //     }
    //   } catch (error) {
    //     console.error('Error verifying payment:', error);
    //   }
    // }
    //
    // verifyPayment();

    // Simulate loading state (in real app, this would be actual verification)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [paymentIntent]);

  // LOADING STATE
  // Show a loading spinner while we verify the payment
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Simple loading spinner */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <p className="text-muted-foreground">Verifying your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ERROR STATE
  // If we don't have a payment_intent in the URL, something went wrong
  // This could mean:
  // - User navigated here directly without making a payment
  // - URL was tampered with
  // - There was an error in the Stripe redirect
  if (!paymentIntent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Payment</CardTitle>
            <CardDescription>
              No payment information found. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PAYMENT FAILED STATE
  // If redirect_status is not "succeeded", the payment didn't go through
  // This can happen if:
  // - Card was declined
  // - Insufficient funds
  // - Payment is still processing (rare for card payments)
  if (redirectStatus !== "succeeded") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Failed</CardTitle>
            <CardDescription>
              Your payment could not be processed. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Status: {redirectStatus || "Unknown"}
            </p>
            <Button asChild className="w-full">
              <Link href="/">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SUCCESS STATE
  // Payment was successful! Show confirmation and next steps.
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center">
          {/* Success icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Thank you for your donation to Nevada Operational Canine Medical
            Group
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Payment Details</h3>

            {/* Payment Intent ID
                In a real app, you'd also show:
                - Amount paid
                - Payment method (last 4 digits of card)
                - Date/time
                - Receipt download link
            */}
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs">
                  {paymentIntent.slice(0, 20)}...
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                A confirmation email has been sent to your email address with
                the receipt.
              </p>
            </div>
          </div>

          {/* What happens next */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>You'll receive a receipt via email</li>
              <li>Your donation will support K9 medical training</li>
              <li>Tax receipt will be sent within 24 hours</li>
            </ul>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * NEXT STEPS FOR PRODUCTION:
 *
 * 1. SERVER-SIDE VERIFICATION
 *    Create an API route to verify the payment:
 *
 *    // app/api/verify-payment/route.ts
 *    import Stripe from 'stripe';
 *
 *    export async function POST(req: Request) {
 *      const { paymentIntentId } = await req.json();
 *      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *
 *      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
 *
 *      return Response.json({
 *        status: paymentIntent.status,
 *        amount: paymentIntent.amount,
 *        // ... other details
 *      });
 *    }
 *
 * 2. DATABASE STORAGE
 *    Store the payment in your database:
 *    - Payment Intent ID
 *    - Amount
 *    - Donor information
 *    - Timestamp
 *    - Status
 *
 * 3. EMAIL NOTIFICATIONS
 *    Send confirmation emails using a service like:
 *    - SendGrid
 *    - Resend
 *    - AWS SES
 *
 * 4. WEBHOOKS (Recommended)
 *    Set up Stripe webhooks to handle payment events:
 *    - payment_intent.succeeded
 *    - payment_intent.payment_failed
 *    - charge.refunded
 *
 *    This is more reliable than relying on client-side redirects.
 *
 * 5. ANALYTICS
 *    Track successful donations for reporting:
 *    - Google Analytics
 *    - Internal dashboard
 *    - Tax reporting
 */
