import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReviewSchema } from "@/lib/validations/review";

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

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const existing = await prisma.review.findFirst({
    where: { productId, userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      productId,
      userId: session.user.id,
      authorName: session.user.name ?? "Anonymous",
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      photoUrl: parsed.data.photoUrl,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewCount: agg._count,
    },
  });

  return NextResponse.json(review);
}
