import { NextResponse } from "next/server";

import { ContactMessage } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await ContactMessage.destroy({ where: { id } });
  return NextResponse.json({ ok: true });
}
