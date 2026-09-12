import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { getFeaturedProducts } from "@/lib/data/products";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(8);

  if (products.length === 0) return null;

  return (
    <section className="container-page py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Featured Products</h2>
          <p className="mt-2 text-muted-foreground">Popular prints, ready to ship.</p>
        </div>
        <Button variant="ghost" asChild className="hidden sm:inline-flex">
          <Link href="/shop">
            Shop All <ArrowRightIcon />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-8 flex justify-center sm:hidden">
        <Button variant="outline" asChild>
          <Link href="/shop">
            Shop All <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    </section>
  );
}
