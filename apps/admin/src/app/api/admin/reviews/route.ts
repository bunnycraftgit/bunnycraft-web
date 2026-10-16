import { NextResponse } from "next/server";

import { prisma } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { adminReviewSchema } from "@/lib/validations/admin";
import { refreshProductRating } from "@/lib/data/reviews";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const reviews = await prisma.review.findMany({
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

// Lets an admin add a review on a customer's behalf (e.g. feedback received
// over WhatsApp or Instagram). Not linked to a user account.
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = adminReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      authorName: parsed.data.authorName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      photoUrl: parsed.data.photoUrl ?? null,
    },
  });
  await refreshProductRating(parsed.data.productId);

  return NextResponse.json(review);
}
