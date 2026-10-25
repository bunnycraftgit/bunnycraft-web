import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { Product, Review } from "@bunnycraft/db";
import { createReviewSchema } from "@/lib/validations/review";
import { refreshProductRating } from "@/lib/data/reviews";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });
  }

  const { id: productId } = await params;
  const parsed = createReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const existing = await Review.findOne({ where: { productId, userId: session.user.id } });
  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
  }

  const review = await Review.create({
    productId,
    userId: session.user.id,
    authorName: session.user.name ?? "Anonymous",
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    photoUrl: parsed.data.photoUrl ?? null,
  });

  await refreshProductRating(productId);

  return NextResponse.json(review);
}
