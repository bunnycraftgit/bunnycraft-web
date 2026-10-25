import { NextResponse } from "next/server";

import { Filament, updateByPk } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { filamentSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = filamentSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const filament = await updateByPk(Filament, id, parsed.data);
  if (!filament) {
    return NextResponse.json({ error: "Filament not found." }, { status: 404 });
  }
  return NextResponse.json(filament);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  try {
    await Filament.destroy({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "This filament is used by existing orders. Deactivate it instead." },
      { status: 409 }
    );
  }
}
