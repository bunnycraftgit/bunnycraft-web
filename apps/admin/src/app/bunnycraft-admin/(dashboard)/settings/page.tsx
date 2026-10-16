import type { Metadata } from "next";

import { Separator } from "@/components/ui/separator";
import { PricingSettingsForm } from "@/components/admin/pricing-settings-form";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { getPricingSettings } from "@/lib/data/filaments";
import { getPaymentSettings } from "@/lib/data/payment";

export const metadata: Metadata = { title: "Admin — Settings" };

export default async function AdminSettingsPage() {
  const [settings, paymentSettings] = await Promise.all([getPricingSettings(), getPaymentSettings()]);

  return (
    <div>
      <h2 className="mb-1 font-heading text-lg font-semibold">Pricing Settings</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        These constants drive the customize wizard&apos;s live price calculator.
      </p>
      <PricingSettingsForm initial={settings} />

      <Separator className="my-10" />

      <h2 className="mb-1 font-heading text-lg font-semibold">Payment</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Customers pay by scanning this UPI QR code after placing an order, then upload a screenshot
        for you to confirm on the Orders page.
      </p>
      <PaymentSettingsForm initial={paymentSettings} />
    </div>
  );
}
