import type { Metadata } from "next";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { auth } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/data/products";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="container-page flex flex-col items-center justify-center gap-4 py-32 text-center">
        <HeartIcon className="size-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign in to see your wishlist</h1>
        <p className="max-w-sm text-muted-foreground">
          Create an account or sign in to save products and pick up where you left off.
        </p>
        <Button asChild>
          <Link href="/login?callbackUrl=/wishlist">Sign in</Link>
        </Button>
      </div>
    );
  }

  const products = await getWishlistProducts(session.user.id);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Your Wishlist</h1>
      <p className="mt-2 text-muted-foreground">{products.length} saved products</p>

      {products.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
          <HeartIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">Nothing saved yet.</p>
          <Button asChild size="sm" className="mt-1">
            <Link href="/shop">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
