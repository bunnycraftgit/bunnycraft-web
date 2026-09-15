"use client";

import * as React from "react";
import { toast } from "sonner";
import { HeartIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import type { PlainProduct } from "@/lib/data/products";

export function AddToCartPanel({ product }: { product: PlainProduct }) {
  const [quantity, setQuantity] = React.useState(1);
  const addProduct = useCartStore((s) => s.addProduct);
  const { isWishlisted, toggle } = useWishlist(product.id);

  function handleAddToCart() {
    addProduct({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unitPrice: product.price,
      material: product.material ?? undefined,
      quantity,
    });
    toast.success(`${product.name} × ${quantity} added to cart.`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center justify-center gap-3 rounded-none border border-border px-3 py-2 sm:justify-start">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex size-7 items-center justify-center rounded-none hover:bg-muted"
          aria-label="Decrease quantity"
        >
          <MinusIcon className="size-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="flex size-7 items-center justify-center rounded-none hover:bg-muted"
          aria-label="Increase quantity"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </div>

      <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
        <ShoppingBagIcon /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>

      <Button size="lg" variant="outline" onClick={toggle} aria-label="Toggle wishlist">
        <HeartIcon className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
      </Button>
    </div>
  );
}
