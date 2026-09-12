import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCartPanel } from "@/components/shop/add-to-cart-panel";
import { StarRating } from "@/components/shop/star-rating";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getProductReviews } from "@/lib/data/reviews";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.categorySlug, product.slug),
  ]);

  return (
    <div className="container-page py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            {product.categoryName}
          </Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />

          <div className="flex items-center gap-3">
            <span className="font-heading text-3xl font-semibold">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="leading-relaxed text-muted-foreground">{product.description}</p>

          {product.material && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" />
              Printed in <span className="font-medium text-foreground">{product.material}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2Icon className="size-4 text-primary" />
            {product.stock > 0 ? `${product.stock} in stock, ships in 2-3 days` : "Currently out of stock"}
          </div>

          <Separator className="my-2" />

          <AddToCartPanel product={product} />
        </div>
      </div>

      <Separator className="my-14" />

      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="flex gap-4">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-none bg-muted">
                  {r.photoUrl && (
                    <Image src={r.photoUrl} alt={r.authorName} fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{r.authorName}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <>
          <Separator className="my-14" />
          <div>
            <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
