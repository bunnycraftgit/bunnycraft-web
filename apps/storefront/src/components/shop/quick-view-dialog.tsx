"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shop/star-rating";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { PRODUCT_STATUS_LABEL, isPurchasable } from "@/lib/product-status";
import type { PlainProduct } from "@/lib/data/products";

export function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: {
  product: PlainProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addProduct = useCartStore((s) => s.addProduct);
  const purchasable = isPurchasable(product.status);

  function handleAddToCart() {
    if (!purchasable) return;
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
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 sm:grid sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-muted sm:rounded-l-2xl sm:rounded-tr-none">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 p-6">
          <DialogHeader className="gap-2 text-left">
            <Badge variant="secondary" className="w-fit">
              {product.categoryName}
            </Badge>
            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <span className="font-heading text-2xl font-semibold">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.material && (
            <p className="text-sm text-muted-foreground">Printed in {product.material}</p>
          )}

          <div className="mt-2 flex flex-col gap-2">
            <Button onClick={handleAddToCart} disabled={!purchasable}>
              <ShoppingBagIcon /> {purchasable ? "Add to Cart" : PRODUCT_STATUS_LABEL[product.status]}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/shop/${product.slug}`} onClick={() => onOpenChange(false)}>
                View Full Details
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
