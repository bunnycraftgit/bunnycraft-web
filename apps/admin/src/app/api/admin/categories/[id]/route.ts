import { NextResponse } from "next/server";

import { Category, updateByPk } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { categorySchema } from "@/lib/validations/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = categorySchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const category = await updateByPk(Category, id, parsed.data);
  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  try {
    await Category.destroy({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "This category still has products assigned to it and can't be deleted." },
      { status: 409 }
    );
  }
}
