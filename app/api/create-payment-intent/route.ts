import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * CREATE PAYMENT INTENT API ROUTE
 *
 * This is a Next.js API route (server-side code) that creates a Stripe Payment Intent.
 *
 * WHAT IS A PAYMENT INTENT?
 * A Payment Intent is Stripe's object for tracking a payment from creation to completion.
 * Think of it as a "payment session" that exists throughout the entire payment lifecycle.
 *
 * WHY DO WE NEED THIS API ROUTE?
 * - Creating Payment Intents requires your SECRET API key
 * - Secret keys must NEVER be exposed to the browser (client-side)
 * - API routes run on the server, keeping secrets secure
 * - The client only receives the "client_secret" which is safe to use in the browser
 *
 * FLOW:
 * 1. Client (CheckoutPage) sends POST request with payment amount
 * 2. This route creates Payment Intent with Stripe using secret key
 * 3. Stripe returns a Payment Intent with client_secret
 * 4. We send client_secret back to the client
 * 5. Client uses client_secret to display payment form and confirm payment
 *
 * SECURITY:
 * - This runs on the server (Node.js), not in the browser
 * - Environment variables (STRIPE_SECRET_KEY) are only accessible server-side
 * - The client_secret is tied to a specific payment amount and can't be reused
 */

// INITIALIZE STRIPE
// We create a Stripe instance using the secret key from environment variables
// This key has full access to your Stripe account, so it must be kept secret!
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not defined in environment variables. " +
      "Please add it to your .env.local file."
  );
}

// Create Stripe instance with TypeScript support
// The ! tells TypeScript we've already checked this exists above
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // API version ensures consistent behavior even as Stripe updates
  // Using the latest stable version
  apiVersion: "2025-09-30.clover",

  // TypeScript configuration for better type safety
  typescript: true,
});

/**
 * POST HANDLER
 *
 * This function is called when CheckoutPage makes a POST request to
 * /api/create-payment-intent
 *
 * @param request - The incoming HTTP request from the client
 * @returns JSON response with either clientSecret or error
 */
export async function POST(request: NextRequest) {
  try {
    // STEP 1: PARSE THE REQUEST BODY
    // Extract the payment amount from the request
    // The client sends this in cents (e.g., $49.99 = 4999 cents)
    const { amount } = await request.json();

    // STEP 2: VALIDATE THE AMOUNT
    // Make sure we received a valid amount before creating a Payment Intent
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          error: "Invalid amount. Amount must be a positive number in cents.",
        },
        { status: 400 } // 400 = Bad Request
      );
    }

    // OPTIONAL: Set a maximum amount to prevent errors or fraud
    // For example, limit donations to $10,000
    const MAX_AMOUNT = 1000000; // $10,000 in cents
    if (amount > MAX_AMOUNT) {
      return NextResponse.json(
        {
          error: `Amount exceeds maximum allowed ($${MAX_AMOUNT / 100})`,
        },
        { status: 400 }
      );
    }

    // STEP 3: CREATE THE PAYMENT INTENT
    // This is where we actually communicate with Stripe's API
    const paymentIntent = await stripe.paymentIntents.create({
      // Amount in cents (smallest currency unit)
      // $49.99 USD = 4999 cents
      // ¥100 JPY = 100 (yen doesn't have cents)
      amount: amount,

      // Currency code (ISO 4217)
      // "usd" = US Dollars
      // Other examples: "eur", "gbp", "cad", "aud"
      currency: "usd",

      // AUTOMATIC PAYMENT METHODS
      // When using Elements in "payment" mode (client-side), we use automatic
      // The payment methods are controlled in the DonationModal component
      automatic_payment_methods: {
        enabled: true,
      },

      // OPTIONAL: Add metadata to track this payment
      // This appears in your Stripe Dashboard and webhooks
      // Useful for connecting payments to your database records
      metadata: {
        // You could add:
        // donor_id: '123',
        // campaign: 'k9-medical-fund',
        // source: 'website'
      },

      // OPTIONAL: Add a description
      // This appears on the customer's credit card statement
      // Keep it under 22 characters for best visibility
      description: "Donation to NV K9 Medical Group",

      // OPTIONAL: Statement descriptor
      // This is what appears on the customer's bank statement
      // Default is your Stripe account name, but you can customize it
      // statement_descriptor: 'K9 DONATION',

      // OPTIONAL: Receipt email
      // Stripe can automatically send receipts to the customer
      // receipt_email: 'customer@example.com',
    });

    // STEP 4: RETURN THE CLIENT SECRET
    // The client_secret is a special token that allows the client to:
    // 1. Display the payment form (PaymentElement)
    // 2. Confirm the payment when user submits
    //
    // SECURITY NOTE:
    // - client_secret is safe to expose to the browser
    // - It's tied to this specific payment intent
    // - It can't be used to create new charges
    // - It expires after the payment is complete or after 24 hours
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,

      // OPTIONAL: Return additional info
      // You could also return:
      // paymentIntentId: paymentIntent.id,
      // amount: paymentIntent.amount,
      // currency: paymentIntent.currency
    });
  } catch (error: unknown) {
    // ERROR HANDLING
    // Multiple types of errors can occur here:

    // 1. STRIPE API ERRORS
    // Network issues, API key problems, invalid parameters
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe Error:", {
        type: error.type,
        code: error.code,
        message: error.message,
      });

      // Return user-friendly error message
      return NextResponse.json(
        {
          error: "Payment initialization failed. Please try again.",
          // In development, you might want to expose the actual error:
          // details: error.message
        },
        { status: 500 } // 500 = Internal Server Error
      );
    }

    // 2. JSON PARSING ERRORS
    // Happens if request body is malformed
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Invalid request format. Please check your request body.",
        },
        { status: 400 }
      );
    }

    // 3. UNKNOWN ERRORS
    // Catch-all for unexpected errors
    console.error("Unexpected Error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * TESTING THIS API ROUTE
 *
 * You can test this endpoint using curl or Postman:
 *
 * curl -X POST http://localhost:3000/api/create-payment-intent \
 *   -H "Content-Type: application/json" \
 *   -d '{"amount": 4999}'
 *
 * Expected response:
 * {
 *   "clientSecret": "pi_xxx_secret_xxx"
 * }
 *
 * For testing payments, use Stripe's test card numbers:
 * - Success: 4242 4242 4242 4242
 * - Decline: 4000 0000 0000 0002
 * - More test cards: https://stripe.com/docs/testing
 */

/**
 * PRODUCTION CONSIDERATIONS
 *
 * 1. RATE LIMITING
 *    Add rate limiting to prevent abuse:
 *    - npm install @upstash/ratelimit
 *    - Limit to X requests per minute per IP
 *
 * 2. AUTHENTICATION
 *    If donations require login, verify user:
 *    - Check session/JWT token
 *    - Associate payment with user ID
 *
 * 3. IDEMPOTENCY
 *    Stripe supports idempotency keys to prevent duplicate charges:
 *    - Add idempotency_key to request headers
 *    - Prevents duplicate Payment Intents if user refreshes
 *
 * 4. WEBHOOKS
 *    Set up webhooks to handle payment events:
 *    - payment_intent.succeeded
 *    - payment_intent.payment_failed
 *    - More reliable than client-side confirmation
 *
 * 5. LOGGING & MONITORING
 *    Log all payment attempts for debugging:
 *    - Use a service like Sentry or LogRocket
 *    - Track success/failure rates
 *    - Alert on unusual patterns
 *
 * 6. DATABASE INTEGRATION
 *    Store payment records in your database:
 *    - Save Payment Intent ID
 *    - Associate with user/donor
 *    - Track for tax receipts
 */
