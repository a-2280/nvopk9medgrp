"use client";

import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
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
import { Label } from "@/components/ui/label";
import CheckoutPage from "@/components/CheckoutPage";
import convertToSubcurrency from "@/lib/convertToSubcurrency";

/**
 * DONATION MODAL COMPONENT WITH CUSTOM AMOUNT SELECTION
 *
 * This component creates a modal that allows users to:
 * 1. Choose from preset donation amounts ($25, $50, $100, $250)
 * 2. Enter a custom amount of their choice
 * 3. Complete payment with Stripe
 *
 * HOW CUSTOM AMOUNTS WORK:
 * - User selects preset OR enters custom amount
 * - When amount changes, we need to recreate the Stripe Elements
 * - Elements component needs a unique key to force re-render
 * - Payment Intent is created with the selected amount
 *
 * WHY USE A KEY ON ELEMENTS:
 * - Stripe Elements can't dynamically update the amount once created
 * - Changing the key forces React to unmount and remount Elements
 * - This creates a fresh instance with the new amount
 * - Without this, the old amount would still be used
 */

// STRIPE.JS INITIALIZATION
// Load Stripe.js with your publishable key
// This must be done outside the component to avoid reloading on every render
if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

/**
 * DonationModal Props
 *
 * @param buttonText - Text to display on the trigger button (default: "Donate")
 * @param buttonClassName - Optional Tailwind classes for the button
 * @param children - Optional custom trigger element (if provided, buttonText is ignored)
 * @param defaultAmount - Initial amount to display (default: 50)
 * @param presetAmounts - Array of preset amounts to show as buttons (default: [25, 50, 100, 250])
 */
interface DonationModalProps {
  buttonText?: string;
  buttonClassName?: string;
  children?: React.ReactNode;
  defaultAmount?: number;
  presetAmounts?: number[];
}

export default function DonationModal({
  buttonText = "Donate",
  buttonClassName,
  children,
  defaultAmount = 50,
  presetAmounts = [25, 50, 100, 250],
}: DonationModalProps) {
  // STATE: Track whether the modal is open or closed
  const [open, setOpen] = useState(false);

  // STATE: Track the selected donation amount
  // This starts at defaultAmount and updates when user selects/enters an amount
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);

  // STATE: Track custom amount input value
  // This is the value in the input field (as a string)
  const [customInput, setCustomInput] = useState<string>("");

  // STATE: Track validation errors for custom amount
  const [amountError, setAmountError] = useState<string>("");

  /**
   * HANDLE PRESET AMOUNT SELECTION
   *
   * When user clicks a preset amount button:
   * 1. Set the selected amount
   * 2. Clear the custom input field
   * 3. Clear any validation errors
   */
  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomInput(""); // Clear custom input when preset is selected
    setAmountError(""); // Clear any errors
  };

  /**
   * HANDLE CUSTOM AMOUNT INPUT
   *
   * When user types in the custom amount field:
   * 1. Update the input value
   * 2. Parse and validate the amount
   * 3. Set the selected amount if valid
   * 4. Show error message if invalid
   *
   * VALIDATION RULES:
   * - Must be a valid number
   * - Must be at least $1.00 (Stripe minimum for USD)
   * - Must be at most $10,000 (configurable limit)
   */
  const handleCustomInput = (value: string) => {
    setCustomInput(value);

    // Allow empty input (user is typing)
    if (value === "") {
      setAmountError("");
      return;
    }

    // Parse the input as a float
    const amount = parseFloat(value);

    // Validate the amount
    if (isNaN(amount)) {
      setAmountError("Please enter a valid number");
      return;
    }

    if (amount < 1) {
      setAmountError("Minimum donation is $1.00");
      return;
    }

    if (amount > 10000) {
      setAmountError("Maximum donation is $10,000");
      return;
    }

    // If valid, update selected amount and clear error
    setSelectedAmount(amount);
    setAmountError("");
  };

  /**
   * CHECK IF WE CAN PROCEED TO PAYMENT
   *
   * User can proceed if:
   * - Selected amount is valid (>= $1.00)
   * - No validation errors
   * - Not in the middle of typing an invalid amount
   */
  const canProceed =
    selectedAmount >= 1 &&
    !amountError &&
    (customInput === "" || !isNaN(parseFloat(customInput)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* DIALOG TRIGGER - The button that opens the modal */}
      <DialogTrigger asChild>
        {children || <Button className={buttonClassName}>{buttonText}</Button>}
      </DialogTrigger>

      {/* DIALOG CONTENT - The modal window */}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle>Support Nevada K9 Medical Group</DialogTitle>
          <DialogDescription>
            Your donation helps provide life-saving medical training and
            equipment for police, military, and SAR K9 units.
          </DialogDescription>
        </DialogHeader>

        {/*
          AMOUNT SELECTION SECTION

          This section lets users choose their donation amount in two ways:
          1. Click a preset amount button
          2. Enter a custom amount in the input field
        */}
        <div className="space-y-4 py-4">
          {/* Preset Amount Buttons */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Choose an amount
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {presetAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={
                    selectedAmount === amount && customInput === ""
                      ? "default"
                      : "secondary"
                  }
                  onClick={() => handlePresetClick(amount)}
                  className="text-lg font-semibold h-14"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <Label
              htmlFor="custom-amount"
              className="text-sm font-medium mb-2 block"
            >
              Or enter a custom amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="custom-amount"
                type="number"
                step="0.01"
                min="1"
                max="10000"
                placeholder="Enter amount"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                className="pl-7 h-14 text-lg"
              />
            </div>
            {/* Show validation error if any */}
            {amountError && (
              <p className="text-sm text-destructive mt-1">{amountError}</p>
            )}
          </div>

          {/* Selected Amount Display */}
          <div className="bg-muted rounded-lg p-4 text-center border-2 border-primary/20">
            <p className="text-sm text-muted-foreground">Total Donation</p>
            <p className="text-3xl font-bold text-primary">
              ${selectedAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/*
          STRIPE ELEMENTS PROVIDER

          IMPORTANT: The 'key' prop forces Elements to re-render when amount changes.

          WHY WE NEED THE KEY:
          - Stripe Elements can't update the amount dynamically
          - Changing the key tells React "this is a new component instance"
          - React unmounts the old Elements and mounts a new one
          - The new instance uses the updated amount

          The key is the amount in cents (e.g., $50.00 = 5000)
          This ensures a unique key for each different amount
        */}
        {canProceed ? (
          <Elements
            key={convertToSubcurrency(selectedAmount)} // Forces re-render when amount changes
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(selectedAmount), // Amount in cents
              currency: "usd",

              // Optional: Customize appearance
              // appearance: {
              //   theme: 'stripe',
              //   variables: {
              //     colorPrimary: '#0570de',
              //   }
              // }
            }}
          >
            {/*
              CHECKOUT FORM

              Pass the selected amount to CheckoutPage so it can:
              1. Create a Payment Intent with the correct amount
              2. Display "Pay $XX.XX" on the submit button
            */}
            <CheckoutPage amount={selectedAmount} />
          </Elements>
        ) : (
          // Show message if amount is invalid
          <div className="text-center py-8 text-muted-foreground">
            Please select or enter a valid donation amount to continue.
          </div>
        )}

        {/* Security Badge */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * USAGE EXAMPLES
 *
 * Basic usage with defaults:
 * ```tsx
 * <DonationModal />
 * // Shows: $25, $50, $100, $250 presets, default selection: $50
 * ```
 *
 * Custom button text:
 * ```tsx
 * <DonationModal buttonText="Support K9s" />
 * ```
 *
 * Custom preset amounts:
 * ```tsx
 * <DonationModal
 *   presetAmounts={[10, 25, 50, 100, 500]}
 *   defaultAmount={25}
 * />
 * ```
 *
 * Custom button styling:
 * ```tsx
 * <DonationModal
 *   buttonText="Make a Difference"
 *   buttonClassName="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
 * />
 * ```
 *
 * Custom trigger element:
 * ```tsx
 * <DonationModal>
 *   <Card className="cursor-pointer hover:shadow-lg">
 *     <CardHeader>
 *       <CardTitle>Support Our Mission</CardTitle>
 *     </CardHeader>
 *   </Card>
 * </DonationModal>
 * ```
 */

/**
 * HOW THE AMOUNT FLOW WORKS
 *
 * 1. USER SELECTS $50 PRESET
 *    └─> selectedAmount = 50
 *    └─> customInput = ""
 *    └─> Elements key = 5000
 *    └─> Payment Intent created for $50.00
 *
 * 2. USER TYPES "75" IN CUSTOM INPUT
 *    └─> customInput = "75"
 *    └─> selectedAmount = 75 (validated and updated)
 *    └─> Elements key changes to 7500
 *    └─> Elements re-renders with new amount
 *    └─> New Payment Intent created for $75.00
 *
 * 3. USER CLICKS $100 PRESET
 *    └─> selectedAmount = 100
 *    └─> customInput = "" (cleared)
 *    └─> Elements key changes to 10000
 *    └─> Elements re-renders with new amount
 *    └─> New Payment Intent created for $100.00
 */

/**
 * ADVANCED ENHANCEMENTS YOU COULD ADD
 *
 * 1. IMPACT MESSAGING
 *    Show what each amount provides:
 *    ```tsx
 *    const impacts = {
 *      25: "Provides basic first aid supplies",
 *      50: "Provides emergency medical kit",
 *      100: "Provides advanced trauma kit",
 *      250: "Provides full training session"
 *    };
 *    ```
 *
 * 2. SUGGESTED AMOUNTS
 *    Dynamically suggest amounts based on user history or campaigns
 *
 * 3. RECURRING DONATIONS
 *    Add a toggle for one-time vs monthly donations
 *
 * 4. TAX DEDUCTION ESTIMATE
 *    Show estimated tax deduction (assuming 501(c)(3) status)
 *
 * 5. DONOR COVER FEES
 *    Add option to cover Stripe fees (~2.9% + $0.30)
 *    ```tsx
 *    const stripeFee = (amount * 0.029 + 0.30);
 *    const totalWithFees = amount + stripeFee;
 *    ```
 */
