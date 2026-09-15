import type { Metadata } from "next";

import { TrackOrderForm } from "@/components/account/track-order-form";

export const metadata: Metadata = { title: "Track Your Order" };

export default function TrackOrderPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Track Your Order</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your order number and email to check its status — no account needed.
          </p>
        </div>
        <TrackOrderForm />
      </div>
    </div>
  );
}
