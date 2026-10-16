import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

import { ProductsManager } from "@/components/admin/products-manager";
import { prisma } from "@bunnycraft/db";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";

export const metadata: Metadata = { title: "Admin — Products" };

const PAGE_SIZE = 20;

type SortKey = "newest" | "price-asc" | "price-desc" | "stock-asc" | "name-asc";

const SORTS: Record<SortKey, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  "stock-asc": { stock: "asc" },
  "name-asc": { name: "asc" },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = parseQuery(sp);
  const categoryId = sp.category || undefined;
  const sort = (sp.sort && sp.sort in SORTS ? sp.sort : "newest") as SortKey;

  const where: Prisma.ProductWhereInput = {
    ...(q ? { name: { contains: q } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: SORTS[sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const plainProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    material: p.material,
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    stock: p.stock,
    featured: p.featured,
    status: p.status,
    categoryId: p.categoryId,
    category: { name: p.category.name },
  }));

  return (
    <ProductsManager
      initial={plainProducts}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      meta={paginationMeta(page, total, PAGE_SIZE)}
    />
  );
}
