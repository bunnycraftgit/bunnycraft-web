import type { Metadata } from "next";

import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import { prisma } from "@bunnycraft/db";

export const metadata: Metadata = { title: "Admin — Testimonials" };

export default async function AdminTestimonialsPage() {
  // Unpublished first so new submissions from the website are easy to spot.
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ published: "asc" }, { createdAt: "desc" }],
  });

  return (
    <TestimonialsManager
      initial={testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        place: t.place,
        photoUrl: t.photoUrl,
        rating: t.rating,
        comment: t.comment,
        published: t.published,
      }))}
    />
  );
}
