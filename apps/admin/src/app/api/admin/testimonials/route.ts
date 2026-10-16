import { NextResponse } from "next/server";

import { prisma } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { testimonialSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = testimonialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({
    data: { ...parsed.data, place: parsed.data.place || null },
  });
  return NextResponse.json(testimonial);
}
