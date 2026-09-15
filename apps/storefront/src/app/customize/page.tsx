import type { Metadata } from "next";

import { CustomizeWizard } from "@/components/customize/customize-wizard";
import { getFilaments, getPricingSettings } from "@/lib/data/filaments";

export const metadata: Metadata = { title: "Customize Your Model" };

export default async function CustomizePage() {
  const [filaments, settings] = await Promise.all([getFilaments(), getPricingSettings()]);

  return <CustomizeWizard filaments={filaments} settings={settings} />;
}
