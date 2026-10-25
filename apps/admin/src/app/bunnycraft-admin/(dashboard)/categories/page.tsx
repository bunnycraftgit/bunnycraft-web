import type { Metadata } from "next";

import { CategoriesManager } from "@/components/admin/categories-manager";
import { paginationMeta, parsePage, parseQuery } from "@/lib/pagination";
import { Category, contains, countOf } from "@bunnycraft/db";

export const metadata: Metadata = { title: "Admin — Categories" };

const PAGE_SIZE = 20;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = parseQuery(sp);
  const where = q ? { name: contains(q) } : {};

  const [categories, total] = await Promise.all([
    Category.findAll({
      where,
      attributes: { include: [[countOf("Product", "categoryId", "Category"), "productCount"]] },
      order: [["name", "ASC"]],
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    Category.count({ where }),
  ]);

  const plain = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    productCount: Number(c.get("productCount")),
  }));

  return (
    <CategoriesManager
      initial={plain}
      meta={paginationMeta(page, total, PAGE_SIZE)}
    />
  );
}
