import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

import { ReviewsManager } from "@/components/admin/reviews-manager";
import { prisma } from "@bunnycraft/db";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";

export const metadata: Metadata = { title: "Admin — Reviews" };

const PAGE_SIZE = 20;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = parseQuery(sp);
  const where: Prisma.ReviewWhereInput = q
    ? { OR: [{ authorName: { contains: q } }, { product: { name: { contains: q } } }] }
    : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.review.count({ where }),
  ]);

  const plain = reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    photoUrl: r.photoUrl,
    createdAt: r.createdAt.toISOString(),
    product: r.product,
  }));

  return <ReviewsManager initial={plain} meta={paginationMeta(page, total, PAGE_SIZE)} />;
}
