import type { Metadata } from "next";

import { ReviewsManager } from "@/components/admin/reviews-manager";
import { Op, Product, Review, contains, type WhereOptions } from "@bunnycraft/db";
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
  const where: WhereOptions = q
    ? { [Op.or]: [{ authorName: contains(q) }, { "$product.name$": contains(q) }] }
    : {};

  const [reviews, total, products] = await Promise.all([
    Review.findAll({
      where,
      include: [{ model: Product, as: "product", attributes: ["name", "slug"] }],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    Review.count({ where, include: [{ model: Product, as: "product", attributes: [] }] }),
    Product.findAll({ attributes: ["id", "name"], order: [["name", "ASC"]] }),
  ]);

  const plain = reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    photoUrl: r.photoUrl,
    createdAt: r.createdAt.toISOString(),
    product: { name: r.product?.name ?? "", slug: r.product?.slug ?? "" },
  }));

  return (
    <ReviewsManager
      initial={plain}
      products={products.map((p) => ({ id: p.id, name: p.name }))}
      meta={paginationMeta(page, total, PAGE_SIZE)}
    />
  );
}
