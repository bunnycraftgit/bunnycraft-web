import { NextResponse } from "next/server";

import { prisma } from "@bunnycraft/db";
import { submitTestimonialSchema } from "@/lib/validations/review";

export async function POST(request: Request) {
  const parsed = submitTestimonialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { website, ...data } = parsed.data;
  // Bots fill the hidden field; pretend it worked so they don't retry.
  if (website) return NextResponse.json({ ok: true });

  await prisma.testimonial.create({
    data: {
      name: data.name,
      place: data.place || null,
      photoUrl: data.photoUrl ?? null,
      rating: data.rating,
      comment: data.comment,
      published: false,
    },
  });

  return NextResponse.json({ ok: true });
}
