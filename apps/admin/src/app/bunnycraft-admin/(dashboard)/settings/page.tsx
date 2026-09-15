import type { Metadata } from "next";

import { PricingSettingsForm } from "@/components/admin/pricing-settings-form";
import { getPricingSettings } from "@/lib/data/filaments";

export const metadata: Metadata = { title: "Admin — Pricing Settings" };

export default async function AdminSettingsPage() {
  const settings = await getPricingSettings();

  return (
    <div>
      <h2 className="mb-1 font-heading text-lg font-semibold">Pricing Settings</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        These constants drive the customize wizard&apos;s live price calculator.
      </p>
      <PricingSettingsForm initial={settings} />
    </div>
  );
}
