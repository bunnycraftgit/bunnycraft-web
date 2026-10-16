import { prisma } from "@bunnycraft/db";

export type PlainTestimonialEntry = {
  id: string;
  authorName: string;
  place: string | null;
  photoUrl: string | null;
  rating: number;
  comment: string;
};

// Testimonials the admin added by hand (Admin → Testimonials).
export async function getPublishedTestimonials(limit = 12): Promise<PlainTestimonialEntry[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((t) => ({
      id: t.id,
      authorName: t.name,
      place: t.place,
      photoUrl: t.photoUrl,
      rating: t.rating,
      comment: t.comment,
    }));
  } catch (err) {
    console.warn(
      "[getPublishedTestimonials] unable to load testimonials —",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}
