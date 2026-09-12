import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { CATEGORIES, PRODUCTS, printImage } from "@/lib/catalog-data";

export type PlainProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  material: string | null;
  tags: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  categorySlug: string;
  categoryName: string;
};

type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

function mapProduct(p: ProductWithCategory): PlainProduct {
  return {
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
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    featured: p.featured,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
  };
}

// Used until DATABASE_URL points at a live, seeded database — keeps the
// storefront fully browsable during local setup instead of showing an error.
function fallbackProducts(): PlainProduct[] {
  const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));
  return PRODUCTS.map((p, i) => {
    const category = categoryBySlug.get(p.categorySlug)!;
    return {
      id: p.slug,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: "compareAtPrice" in p ? (p.compareAtPrice ?? null) : null,
      images: [printImage(i), printImage(i + 3), printImage(i + 6)],
      material: p.material,
      tags: [...p.tags],
      stock: 25,
      rating: 4.6,
      reviewCount: 14,
      featured: "featured" in p ? Boolean(p.featured) : false,
      categorySlug: category.slug,
      categoryName: category.name,
    };
  });
}

export async function getFeaturedProducts(limit = 8): Promise<PlainProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    if (products.length === 0) throw new Error("no featured products in database yet");
    return products.map(mapProduct);
  } catch (err) {
    console.warn(
      "[getFeaturedProducts] using fallback catalog data —",
      err instanceof Error ? err.message : err
    );
    return fallbackProducts()
      .filter((p) => p.featured)
      .slice(0, limit);
  }
}

export type ProductSort = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export type ProductFilters = {
  category?: string;
  material?: string;
  q?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
};

function sortProducts(products: PlainProduct[], sort: ProductSort | undefined) {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "featured":
      return list.sort((a, b) => Number(b.featured) - Number(a.featured));
    default:
      return list;
  }
}

function filterFallback(products: PlainProduct[], filters: ProductFilters) {
  let list = products;
  if (filters.category) list = list.filter((p) => p.categorySlug === filters.category);
  if (filters.material) list = list.filter((p) => p.material === filters.material);
  if (filters.minPrice != null) list = list.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) list = list.filter((p) => p.price <= filters.maxPrice!);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return sortProducts(list, filters.sort);
}

export async function getProducts(filters: ProductFilters = {}): Promise<PlainProduct[]> {
  try {
    const where: Prisma.ProductWhereInput = {};
    if (filters.category) where.category = { slug: filters.category };
    if (filters.material) where.material = filters.material;
    if (filters.minPrice != null || filters.maxPrice != null) {
      where.price = {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      };
    }
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { description: { contains: filters.q } },
      ];
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      filters.sort === "price-asc"
        ? { price: "asc" }
        : filters.sort === "price-desc"
          ? { price: "desc" }
          : filters.sort === "rating"
            ? { rating: "desc" }
            : filters.sort === "featured"
              ? { featured: "desc" }
              : { createdAt: "desc" };

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      take: 60,
    });

    const total = await prisma.product.count();
    if (total === 0) throw new Error("no products in database yet");

    return products.map(mapProduct);
  } catch (err) {
    console.warn(
      "[getProducts] using fallback catalog data —",
      err instanceof Error ? err.message : err
    );
    return filterFallback(fallbackProducts(), filters);
  }
}

export async function getProductBySlug(slug: string): Promise<PlainProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (product) return mapProduct(product);

    // A real miss against a seeded database is a genuine 404 — only fall
    // back to static catalog data when the table itself is still empty
    // (database not seeded yet).
    const total = await prisma.product.count();
    if (total > 0) return null;
    return fallbackProducts().find((p) => p.slug === slug) ?? null;
  } catch (err) {
    console.warn(
      "[getProductBySlug] using fallback catalog data —",
      err instanceof Error ? err.message : err
    );
    return fallbackProducts().find((p) => p.slug === slug) ?? null;
  }
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4
): Promise<PlainProduct[]> {
  const products = await getProducts({ category: categorySlug });
  return products.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}

export function getAllMaterials(): string[] {
  return Array.from(new Set(PRODUCTS.map((p) => p.material)));
}

export async function getWishlistProducts(userId: string): Promise<PlainProduct[]> {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    return items.map((i) => mapProduct(i.product));
  } catch (err) {
    console.warn(
      "[getWishlistProducts] unable to load wishlist —",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}
