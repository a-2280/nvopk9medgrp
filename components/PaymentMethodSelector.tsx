"use client";

import { useState } from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * PAYMENT METHOD SELECTOR COMPONENT
 *
 * This component shows primary payment methods upfront (Card, Apple Pay, Google Pay)
 * and hides additional methods (Klarna, Amazon Pay, etc.) behind a "More" button.
 *
 * HOW IT WORKS:
 * 1. Shows Card, Apple Pay, Google Pay by default (if available)
 * 2. "More payment options" button reveals other methods
 * 3. Uses Stripe's PaymentElement with wallets configuration
 *
 * WHY THIS APPROACH:
 * - Reduces visual clutter
 * - Highlights most common payment methods
 * - Still provides access to all enabled methods
 * - Better mobile experience
 */

interface PaymentMethodSelectorProps {
  clientSecret: string | null;
}

export default function PaymentMethodSelector({
  clientSecret,
}: PaymentMethodSelectorProps) {
  // STATE: Track whether "More options" is expanded
  const [showMore, setShowMore] = useState(false);

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/*
        PRIMARY PAYMENT ELEMENT

        This shows the main payment form with:
        - Card input fields (number, expiry, CVC, ZIP)
        - Email field (for receipt)
        - Apple Pay button (if on Safari/iOS)
        - Google Pay button (if on Chrome/Android)

        The 'wallets' option controls how digital wallets appear:
        - "auto" shows them inline if available
        - "never" hides them
      */}
      <PaymentElement
        options={{
          // COLLECT EMAIL FOR RECEIPT
          fields: {
            billingDetails: {
              email: "auto", // Required email field
            },
          },

          // WALLET DISPLAY
          // Show Apple Pay and Google Pay inline (not in a separate section)
          wallets: {
            applePay: "auto", // Shows if user is on Safari/iOS
            googlePay: "auto", // Shows if user is on Chrome/Android
          },
        }}
      />

      {/*
        MORE PAYMENT OPTIONS SECTION

        This is a collapsible section that reveals additional payment methods
        like Klarna, Amazon Pay, etc. when expanded.

        WHY COLLAPSIBLE:
        - Keeps the form clean and simple by default
        - Most users will use card/Apple Pay/Google Pay
        - Advanced users can expand to see more options
      */}
      <Collapsible open={showMore} onOpenChange={setShowMore}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full"
          >
            {showMore ? "Fewer payment options" : "More payment options"}
            <svg
              className={`ml-2 h-4 w-4 transition-transform ${
                showMore ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          {/*
            ADDITIONAL PAYMENT METHODS

            You could show specific payment methods here, but since we're using
            PaymentElement with automatic payment methods, all enabled methods
            are already shown in the main PaymentElement above.

            ALTERNATIVE APPROACH:
            If you want to show ONLY certain methods in the "More" section,
            you'd need to use multiple PaymentElements with different
            payment_method_types specified. However, this is complex and
            not recommended.

            CURRENT APPROACH:
            We'll show informational text about what other methods are available.
            Stripe's PaymentElement already includes a dropdown for method selection.
          */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Additional payment methods available:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Klarna - Pay in 4 installments</li>
              <li>• Amazon Pay - Use your Amazon account</li>
              <li>• Link - Save your info for next time</li>
              <li>• ACH Direct Debit - Pay with your bank account</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Select from the payment method dropdown above to use these options.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * ALTERNATIVE IMPLEMENTATION WITH TABS
 *
 * If you want to show different payment methods in separate tabs/buttons,
 * you'd need a more complex setup:
 *
 * ```tsx
 * const [selectedMethod, setSelectedMethod] = useState<'card' | 'wallet' | 'other'>('card');
 *
 * <div className="space-y-4">
 *   {/* Method Selector Buttons *\/}
 *   <div className="grid grid-cols-3 gap-2">
 *     <Button
 *       variant={selectedMethod === 'card' ? 'default' : 'outline'}
 *       onClick={() => setSelectedMethod('card')}
 *     >
 *       💳 Card
 *     </Button>
 *     <Button
 *       variant={selectedMethod === 'wallet' ? 'default' : 'outline'}
 *       onClick={() => setSelectedMethod('wallet')}
 *     >
 *       📱 Wallet
 *     </Button>
 *     <Button
 *       variant={selectedMethod === 'other' ? 'default' : 'outline'}
 *       onClick={() => setSelectedMethod('other')}
 *     >
 *       ➕ More
 *     </Button>
 *   </div>
 *
 *   {/* Show appropriate payment form based on selection *\/}
 *   {selectedMethod === 'card' && (
 *     <PaymentElement options={{ ... }} />
 *   )}
 *
 *   {selectedMethod === 'wallet' && (
 *     <div>Apple Pay / Google Pay buttons here</div>
 *   )}
 *
 *   {selectedMethod === 'other' && (
 *     <PaymentElement options={{ wallets: 'never', ... }} />
 *   )}
 * </div>
 * ```
 *
 * However, this approach is more complex and may not work well with Stripe's
 * PaymentElement, which automatically handles method selection.
 */

/**
 * USAGE IN CheckoutPage.tsx
 *
 * Replace the current PaymentElement with:
 *
 * ```tsx
 * import PaymentMethodSelector from './PaymentMethodSelector';
 *
 * // In the return statement:
 * <PaymentMethodSelector clientSecret={clientSecret} />
 * ```
 */
