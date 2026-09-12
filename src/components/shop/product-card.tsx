"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { EyeIcon, HeartIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shop/star-rating";
import { QuickViewDialog } from "@/components/shop/quick-view-dialog";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartStore } from "@/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";
import type { PlainProduct } from "@/lib/data/products";

export function ProductCard({ product }: { product: PlainProduct }) {
  const { isWishlisted, toggle } = useWishlist(product.id);
  const addProduct = useCartStore((s) => s.addProduct);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  function handleAddToCart() {
    addProduct({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unitPrice: product.price,
      material: product.material ?? undefined,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart.`);
  }

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Link href={`/shop/${product.slug}`} className="relative block h-full w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {product.compareAtPrice && (
            <Badge variant="accent" className="absolute top-3 left-3">
              Sale
            </Badge>
          )}

          <button
            onClick={toggle}
            aria-label="Toggle wishlist"
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-none bg-background/90 text-foreground shadow-soft backdrop-blur transition-transform hover:scale-105"
          >
            <HeartIcon
              className={cn("size-4", isWishlisted && "fill-destructive text-destructive")}
            />
          </button>

          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingBagIcon /> Add to Cart
            </Button>
            <Button
              size="icon-sm"
              variant="glass"
              aria-label="Quick view"
              onClick={() => setQuickViewOpen(true)}
            >
              <EyeIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 p-4">
          <p className="text-xs font-medium text-muted-foreground">{product.categoryName}</p>
          <Link href={`/shop/${product.slug}`} className="line-clamp-1 font-medium hover:text-primary">
            {product.name}
          </Link>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <div className="mt-1 flex items-center gap-2">
            <span className="font-heading text-lg font-semibold">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <QuickViewDialog
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
