import { Product, Review, fn, col } from "@bunnycraft/db";
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
    const reviews = await Review.findAll({
      where: { rating: 5 },
      include: [{ model: Product, as: "product", attributes: ["name"] }],
      limit,
      order: [["createdAt", "DESC"]],
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
    const reviews = await Review.findAll({
      where: { productId },
      order: [["createdAt", "DESC"]],
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

// Keeps Product.rating / reviewCount (shown on cards) in sync after a review
// is added or removed.
export async function refreshProductRating(productId: string) {
  const agg = (await Review.findOne({
    where: { productId },
    attributes: [
      [fn("AVG", col("rating")), "avg"],
      [fn("COUNT", col("id")), "count"],
    ],
    raw: true,
  })) as unknown as { avg: string | number | null; count: string | number } | null;
  await Product.update(
    {
      rating: Math.round(Number(agg?.avg ?? 0) * 10) / 10,
      reviewCount: Number(agg?.count ?? 0),
    },
    { where: { id: productId } }
  );
}
