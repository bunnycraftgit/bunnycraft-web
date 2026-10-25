import { NextResponse } from "next/server";

import { Testimonial, updateByPk } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { testimonialSchema } from "@/lib/validations/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = testimonialSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const data = parsed.data.place === "" ? { ...parsed.data, place: null } : parsed.data;
  const testimonial = await updateByPk(Testimonial, id, data);
  if (!testimonial) {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }
  return NextResponse.json(testimonial);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await Testimonial.destroy({ where: { id } });
  return NextResponse.json({ ok: true });
}
