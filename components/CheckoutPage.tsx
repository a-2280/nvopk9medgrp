"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";

/**
 * CheckoutPage Component - Handles Stripe Payment Processing
 *
 * This component is the core of our donation/payment system. It manages the entire
 * payment flow from creating a payment intent to confirming the payment.
 *
 * HOW STRIPE PAYMENTS WORK (Step-by-step):
 *
 * 1. PAYMENT INTENT CREATION (Server-side)
 *    - When this component mounts, we call our API to create a "Payment Intent"
 *    - A Payment Intent is Stripe's way of tracking a payment from start to finish
 *    - It's created on the server (for security) and returns a "client secret"
 *    - The client secret is like a secure token that allows the browser to complete the payment
 *
 * 2. PAYMENT ELEMENT DISPLAY (Client-side)
 *    - Once we have the client secret, Stripe's <PaymentElement /> renders
 *    - This is a pre-built, secure form that handles card details, Apple Pay, Google Pay, etc.
 *    - Stripe handles all PCI compliance - we never touch raw card data
 *
 * 3. PAYMENT SUBMISSION (Client-side)
 *    - User fills out payment details and clicks "Pay"
 *    - We call elements.submit() to validate the form
 *    - Then stripe.confirmPayment() securely sends data to Stripe
 *    - Stripe processes the payment and redirects user to success/failure page
 *
 * @param {number} amount - The donation amount in dollars (e.g., 49.99)
 */
const CheckoutPage = ({ amount }: { amount: number }) => {
  // STRIPE HOOKS - These connect us to the Stripe SDK
  // useStripe() gives us access to the Stripe object for confirming payments
  // useElements() gives us access to the payment form elements
  const stripe = useStripe();
  const elements = useElements();

  // STATE MANAGEMENT
  // We track three key pieces of state throughout the payment flow:

  // 1. errorMessage: Stores any error messages to display to the user
  //    (e.g., "Your card was declined", "Invalid card number")
  const [errorMessage, setErrorMessage] = useState<string>();

  // 2. clientSecret: The secure token from Stripe that identifies this specific payment
  //    This is returned from our API after creating the Payment Intent
  const [clientSecret, setClientSecret] = useState("");

  // 3. loading: Tracks whether a payment is being processed
  //    Used to disable the button and show "Processing..." to prevent double-charges
  const [loading, setLoading] = useState(false);

  /**
   * EFFECT: CREATE PAYMENT INTENT ON MOUNT
   *
   * This runs once when the component first loads (or when amount changes).
   *
   * WHY WE DO THIS:
   * - Stripe requires a Payment Intent to be created BEFORE the user enters card details
   * - This must happen on the server (our API route) for security reasons
   * - We can't create Payment Intents directly in the browser because that would
   *   expose our secret API key
   *
   * FLOW:
   * 1. Convert amount from dollars to cents (Stripe uses smallest currency unit)
   * 2. Make POST request to our API endpoint
   * 3. API creates Payment Intent with Stripe
   * 4. API returns the client_secret
   * 5. We store client_secret in state, which triggers PaymentElement to render
   */
  useEffect(() => {
    // Call our API route to create a Payment Intent
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Send the amount in cents (e.g., $49.99 becomes 4999)
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Store the client secret, which allows PaymentElement to render
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        // If Payment Intent creation fails, show error to user
        console.error("Error creating payment intent:", error);
        setErrorMessage("Failed to initialize payment. Please try again.");
      });
  }, [amount]); // Re-run if amount changes

  /**
   * FORM SUBMISSION HANDLER
   *
   * This is the core payment processing logic. When the user clicks "Pay",
   * this function handles the entire payment confirmation flow.
   *
   * STEP-BY-STEP BREAKDOWN:
   *
   * 1. PREVENT DEFAULT & VALIDATION
   *    - Stop normal form submission (we handle everything via JavaScript)
   *    - Check if Stripe.js has loaded (stripe/elements will be null if not ready)
   *
   * 2. SUBMIT THE ELEMENTS
   *    - elements.submit() validates all payment fields
   *    - Returns errors for things like empty fields, invalid card format
   *    - Must be called BEFORE confirmPayment
   *
   * 3. CONFIRM THE PAYMENT
   *    - stripe.confirmPayment() sends payment details to Stripe securely
   *    - Stripe processes the payment with the bank
   *    - On success: redirects to return_url
   *    - On failure: returns error object (card declined, insufficient funds, etc.)
   *
   * WHY WE DON'T HANDLE SUCCESS HERE:
   * - confirmPayment redirects the user away from this page on success
   * - The return_url handles the success state
   * - We only handle errors that prevent the redirect
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // STEP 1: Prevent the default form submission behavior
    // Without this, the browser would try to submit the form traditionally
    // (reloading the page), which would interrupt our Stripe flow
    event.preventDefault();

    // Set loading state to true
    // This disables the submit button to prevent double-clicking/double-charging
    setLoading(true);

    // CRITICAL CHECK: Ensure Stripe.js has loaded
    // If stripe or elements is null, Stripe.js hasn't finished loading yet
    // This can happen on slow connections or if there's a network issue
    if (!stripe || !elements) {
      // Re-enable the button since we're not processing
      setLoading(false);
      return;
    }

    // STEP 2: Submit and validate the payment form
    // This checks that all required fields are filled and valid
    // (e.g., card number is complete, expiry date is valid, etc.)
    const { error: submitError } = await elements.submit();

    if (submitError) {
      // If validation fails, show the error message to the user
      // Examples: "Your card number is incomplete", "Your card's expiration date is invalid"
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    // STEP 3: Confirm the payment with Stripe
    // This is where the actual payment processing happens
    const { error } = await stripe.confirmPayment({
      // Pass the form elements (contains card details)
      elements,

      // The client secret that identifies this specific payment
      clientSecret,

      // Configuration for what happens after payment
      confirmParams: {
        // return_url: Where to redirect the user after successful payment
        // We send them to a success page on our site
        // ${window.location.origin} ensures it works in dev and production
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    // IMPORTANT: We only reach this code if there's an ERROR
    // On SUCCESS, Stripe automatically redirects to return_url
    // So if we're still here, something went wrong

    if (error) {
      // Display the error message from Stripe
      // Common errors:
      // - "Your card was declined"
      // - "Your card has insufficient funds"
      // - "Your card's security code is incorrect"
      setErrorMessage(error.message);
    } else {
      // This case is rare - it means confirmPayment completed but didn't redirect
      // Could happen if return_url is invalid
      setErrorMessage("An unexpected error occurred.");
    }

    // Re-enable the submit button so user can try again
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/*
        PAYMENT ELEMENT

        This is Stripe's pre-built payment form. It only renders when we have
        a clientSecret (meaning the Payment Intent was created successfully).

        WHY USE PaymentElement:
        - Handles multiple payment methods (cards, Apple Pay, Google Pay, etc.)
        - Automatically validates input
        - Mobile-responsive
        - Accessible (screen readers, keyboard navigation)
        - PCI compliant (we never see raw card data)
        - Supports 40+ languages
        - Automatically styled but customizable
      */}
      {clientSecret && (
        <PaymentElement
          options={{
            // COLLECT EMAIL FOR RECEIPT
            // This adds an email field to the payment form
            // Stripe will automatically send a receipt to this email
            fields: {
              billingDetails: {
                email: "auto", // Shows email field, required for payment
              },
            },

            // LAYOUT CONFIGURATION
            // Controls how payment methods are displayed
            layout: {
              type: "accordion", // Shows methods in expandable accordion
              defaultCollapsed: false, // Card section open by default
              radios: true, // Show radio buttons for method selection
              spacedAccordionItems: false, // Compact spacing
            },
          }}
        />
      )}

      {/*
        ERROR MESSAGE DISPLAY

        Show any error messages to the user in a clear, visible way.
        This appears above the submit button so users see it before trying again.
      */}
      {errorMessage && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
          {errorMessage}
        </div>
      )}

      {/*
        SUBMIT BUTTON

        DISABLED CONDITIONS:
        1. !stripe: Stripe.js hasn't loaded yet
        2. loading: Payment is currently being processed
        3. !clientSecret: Payment Intent hasn't been created yet

        WHY DISABLE:
        - Prevents double-charging if user clicks multiple times
        - Prevents submission before Stripe is ready
        - Provides clear feedback with loading text
      */}
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        {/*
          BUTTON TEXT LOGIC:
          - Show "Processing..." while payment is being confirmed
          - Show "Pay $XX.XX" with the amount otherwise
          - Helps user know something is happening
        */}
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>

      {/*
        LOADING INDICATOR (Optional Enhancement)

        You could add a spinner here for better UX:
        {loading && <div>Processing payment...</div>}
      */}

      {/*
        SECURITY NOTE

        This form is PCI DSS compliant because:
        1. Card data never touches our server
        2. PaymentElement is hosted by Stripe in an iframe
        3. Communication with Stripe uses HTTPS
        4. We only store the Payment Intent ID, not card details
      */}
    </form>
  );
};

export default CheckoutPage;
