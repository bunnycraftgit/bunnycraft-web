import { NextResponse } from "next/server";

import { PaymentSettings } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { paymentSettingsSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = paymentSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const data = {
    qrImageUrl: parsed.data.qrImageUrl,
    upiId: parsed.data.upiId || null,
    payeeName: parsed.data.payeeName || null,
  };
  const [settings] = await PaymentSettings.upsert({ id: 1, ...data });
  return NextResponse.json(settings);
}
