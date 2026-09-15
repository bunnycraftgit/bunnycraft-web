import { prisma } from "@bunnycraft/db";
import { REVIEW_POOL, img } from "@/lib/catalog-data";

export type PlainTestimonial = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  photoUrl: string | null;
  productName: string | null;
};

function fallbackTestimonials(): PlainTestimonial[] {
  return REVIEW_POOL.filter((r) => r.rating === 5).map((r, i) => ({
    id: `fallback-${i}`,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    photoUrl: img(`avatar-${r.authorName}`, 128, 128),
    productName: null,
  }));
}

export async function getTestimonials(limit = 8): Promise<PlainTestimonial[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { rating: 5 },
      include: { product: { select: { name: true } } },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    if (reviews.length === 0) throw new Error("no reviews in database yet");
    return reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      photoUrl: r.photoUrl,
      productName: r.product?.name ?? null,
    }));
  } catch (err) {
    console.warn(
      "[getTestimonials] using fallback catalog data —",
      err instanceof Error ? err.message : err
    );
    return fallbackTestimonials().slice(0, limit);
  }
}

export type PlainReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  photoUrl: string | null;
  createdAt: string;
};

export async function getProductReviews(productId: string): Promise<PlainReview[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    return reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      photoUrl: r.photoUrl,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (err) {
    console.warn(
      "[getProductReviews] no reviews available —",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}
