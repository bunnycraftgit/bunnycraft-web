import { NextResponse } from "next/server";

import { Review } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { refreshProductRating } from "@/lib/data/reviews";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const review = await Review.findByPk(id);
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
  await review.destroy();
  await refreshProductRating(review.productId);
  return NextResponse.json({ ok: true });
}
