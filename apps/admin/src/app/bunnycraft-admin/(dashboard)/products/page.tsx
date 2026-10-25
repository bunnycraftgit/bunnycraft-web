import type { Metadata } from "next";

import { ProductsManager } from "@/components/admin/products-manager";
import {
  Category,
  Product,
  contains,
  type SequelizeOrder,
  type WhereOptions,
} from "@bunnycraft/db";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";

export const metadata: Metadata = { title: "Admin — Products" };

const PAGE_SIZE = 20;

type SortKey = "newest" | "price-asc" | "price-desc" | "stock-asc" | "name-asc";

const SORTS: Record<SortKey, SequelizeOrder> = {
  newest: [["createdAt", "DESC"]],
  "price-asc": [["price", "ASC"]],
  "price-desc": [["price", "DESC"]],
  "stock-asc": [["stock", "ASC"]],
  "name-asc": [["name", "ASC"]],
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

  const where: WhereOptions = {
    ...(q ? { name: contains(q) } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, total, categories] = await Promise.all([
    Product.findAll({
      where,
      include: [{ model: Category, as: "category" }],
      order: SORTS[sort],
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    Product.count({ where }),
    Category.findAll({ order: [["name", "ASC"]] }),
  ]);

  const plainProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    images: Array.isArray(p.images) ? p.images : [],
    material: p.material,
    tags: Array.isArray(p.tags) ? p.tags : [],
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    stock: p.stock,
    featured: p.featured,
    status: p.status,
    categoryId: p.categoryId,
    category: { name: p.category?.name ?? "" },
  }));

  return (
    <ProductsManager
      initial={plainProducts}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      meta={paginationMeta(page, total, PAGE_SIZE)}
    />
  );
}
