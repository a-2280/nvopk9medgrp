"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

function SuccessContent() {

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground">
          Your donation helps provide life-saving medical training and
          equipment for working K9 units.
        </p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return <SuccessContent />;
}
