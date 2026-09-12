import type { Metadata } from "next";

import { ProductsManager } from "@/components/admin/products-manager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin — Products" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
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
    categoryId: p.categoryId,
    category: { name: p.category.name },
  }));

  return (
    <ProductsManager
      initial={plainProducts}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
