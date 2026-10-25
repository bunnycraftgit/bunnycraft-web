import { NextResponse } from "next/server";

import { NewsletterSubscriber } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await NewsletterSubscriber.destroy({ where: { id } });
  return NextResponse.json({ ok: true });
}
