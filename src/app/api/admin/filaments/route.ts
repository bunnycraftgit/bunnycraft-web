import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { filamentSchema } from "@/lib/validations/admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const filaments = await prisma.filament.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(filaments);
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = filamentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const filament = await prisma.filament.create({ data: parsed.data });
  return NextResponse.json(filament);
}
