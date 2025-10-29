/**
 * STRIPE CONFIGURATION
 *
 * This file centralizes Stripe configuration and provides helpful utilities
 * for working with Stripe in your Next.js application.
 *
 * WHY CENTRALIZE CONFIGURATION?
 * - Single source of truth for Stripe settings
 * - Easier to update and maintain
 * - Type-safe configuration
 * - Better error messages if setup is wrong
 */

/**
 * ENVIRONMENT VARIABLES VALIDATION
 *
 * These checks ensure Stripe keys are configured before the app starts.
 * This prevents runtime errors and provides clear error messages.
 *
 * REQUIRED ENVIRONMENT VARIABLES:
 * 1. NEXT_PUBLIC_STRIPE_PUBLIC_KEY - For client-side (browser) usage
 *    - Format: pk_test_xxx (test mode) or pk_live_xxx (live mode)
 *    - Safe to expose in browser
 *    - Used to load Stripe.js and create Elements
 *
 * 2. STRIPE_SECRET_KEY - For server-side usage only
 *    - Format: sk_test_xxx (test mode) or sk_live_xxx (live mode)
 *    - MUST NEVER be exposed to browser
 *    - Used to create Payment Intents, process refunds, etc.
 */

// Validate PUBLIC key (used in browser)
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_STRIPE_PUBLIC_KEY environment variable.\n\n" +
      "To fix this:\n" +
      "1. Create a .env.local file in your project root\n" +
      "2. Add: NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_key_here\n" +
      "3. Get your key from: https://dashboard.stripe.com/test/apikeys\n\n" +
      "For production, use your live key: pk_live_..."
  );
}

// Validate SECRET key (used on server)
// This check only runs on the server since SECRET_KEY is not prefixed with NEXT_PUBLIC_
if (
  typeof window === "undefined" && // Only check on server
  !process.env.STRIPE_SECRET_KEY
) {
  throw new Error(
    "Missing STRIPE_SECRET_KEY environment variable.\n\n" +
      "To fix this:\n" +
      "1. Add to your .env.local file: STRIPE_SECRET_KEY=sk_test_your_key_here\n" +
      "2. Get your key from: https://dashboard.stripe.com/test/apikeys\n" +
      "3. NEVER commit this key to version control!\n\n" +
      "For production, use your live key: sk_live_..."
  );
}

/**
 * KEY MODE VALIDATION
 *
 * Ensures that public and secret keys match (both test or both live).
 * Mixing test and live keys will cause payment failures.
 */
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const secretKey = process.env.STRIPE_SECRET_KEY;

// Extract key mode (test or live) from the key prefix
// Test keys: pk_test_... or sk_test_...
// Live keys: pk_live_... or sk_live_...
const publicKeyMode = publicKey?.startsWith("pk_test_") ? "test" : "live";
const secretKeyMode = secretKey?.startsWith("sk_test_") ? "test" : "live";

// Warn if keys don't match
if (publicKeyMode !== secretKeyMode) {
  console.warn(
    "⚠️  WARNING: Your Stripe public key and secret key are in different modes!\n" +
      `   Public key: ${publicKeyMode} mode\n` +
      `   Secret key: ${secretKeyMode} mode\n` +
      "   This will cause payment failures. Make sure both keys are from the same environment."
  );
}

/**
 * STRIPE CONFIGURATION OBJECT
 *
 * Export a configuration object that can be imported throughout your app.
 * This provides type-safe access to Stripe settings.
 */
export const stripeConfig = {
  // Public key for client-side usage
  publicKey: publicKey!,

  // Secret key for server-side usage (only accessible on server)
  secretKey: secretKey,

  // Current mode (test or live)
  mode: publicKeyMode as "test" | "live",

  // Is this production or development?
  isProduction: process.env.NODE_ENV === "production",

  // Is test mode enabled?
  isTestMode: publicKeyMode === "test",

  // Currency settings
  currency: {
    code: "usd" as const,
    symbol: "$",
    decimals: 2,
  },

  // Payment settings
  payment: {
    // Minimum donation amount in dollars
    minAmount: 1.0,

    // Maximum donation amount in dollars
    maxAmount: 10000.0,

    // Default donation amount in dollars
    defaultAmount: 49.99,
  },
} as const;

/**
 * UTILITY FUNCTIONS
 */

/**
 * Checks if we're currently using test mode
 * Useful for showing test mode indicators in the UI
 */
export function isTestMode(): boolean {
  return stripeConfig.isTestMode;
}

/**
 * Gets a user-friendly name for the current Stripe mode
 */
export function getModeName(): string {
  return stripeConfig.isTestMode ? "Test Mode" : "Live Mode";
}

/**
 * Validates that environment is properly configured
 * Throws descriptive errors if something is wrong
 */
export function validateStripeConfig(): void {
  if (!stripeConfig.publicKey) {
    throw new Error("Stripe public key is not configured");
  }

  if (typeof window === "undefined" && !stripeConfig.secretKey) {
    throw new Error("Stripe secret key is not configured");
  }

  // Additional validation
  if (stripeConfig.publicKey.length < 20) {
    throw new Error("Stripe public key appears to be invalid (too short)");
  }

  if (
    !stripeConfig.publicKey.startsWith("pk_test_") &&
    !stripeConfig.publicKey.startsWith("pk_live_")
  ) {
    throw new Error(
      'Stripe public key must start with "pk_test_" or "pk_live_"'
    );
  }
}

/**
 * USAGE EXAMPLES
 *
 * // In a React component (client-side):
 * import { stripeConfig, isTestMode } from '@/lib/stripe.config';
 *
 * export default function PaymentForm() {
 *   return (
 *     <div>
 *       {isTestMode() && (
 *         <div className="bg-yellow-100 p-2">
 *           ⚠️ Test Mode - Use card 4242 4242 4242 4242
 *         </div>
 *       )}
 *       <Elements stripe={loadStripe(stripeConfig.publicKey)}>
 *         <CheckoutForm />
 *       </Elements>
 *     </div>
 *   );
 * }
 *
 * // In an API route (server-side):
 * import Stripe from 'stripe';
 * import { stripeConfig } from '@/lib/stripe.config';
 *
 * const stripe = new Stripe(stripeConfig.secretKey!, {
 *   apiVersion: '2025-09-30.clover',
 * });
 */

/**
 * TEST VS LIVE MODES
 *
 * DEVELOPMENT (.env.local):
 * NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51abcdefg...
 * STRIPE_SECRET_KEY=sk_test_51abcdefg...
 *
 * PRODUCTION (Environment Variables in hosting platform):
 * NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_51abcdefg...
 * STRIPE_SECRET_KEY=sk_live_51abcdefg...
 *
 * TEST CARD NUMBERS (only work in test mode):
 * - Success: 4242 4242 4242 4242
 * - Declined: 4000 0000 0000 0002
 * - Requires 3DS: 4000 0027 6000 3184
 * - Insufficient funds: 4000 0000 0000 9995
 * - More: https://stripe.com/docs/testing
 *
 * IMPORTANT: Never commit .env.local to git!
 * Add it to .gitignore to keep your keys safe.
 */
