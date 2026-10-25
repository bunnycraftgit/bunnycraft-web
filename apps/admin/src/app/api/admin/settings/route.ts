import { NextResponse } from "next/server";

import { PricingSettings } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { pricingSettingsSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = pricingSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const [settings] = await PricingSettings.upsert({ id: 1, ...parsed.data });
  return NextResponse.json(settings);
}
