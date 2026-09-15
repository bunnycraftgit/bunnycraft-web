import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageOpenIcon } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { ShopFilters, ShopSortDesktop } from "@/components/shop/shop-filters";
import { getAllMaterials, getProducts, type ProductSort } from "@/lib/data/products";

export const metadata: Metadata = { title: "Shop" };

type SearchParams = {
  category?: string;
  material?: string;
  q?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const materials = getAllMaterials();

  const products = await getProducts({
    category: params.category,
    material: params.material,
    q: params.q,
    sort: params.sort as ProductSort | undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  });

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {params.q ? `Results for “${params.q}”` : "Shop All Prints"}
        </h1>
        <p className="mt-2 text-muted-foreground">{products.length} products</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense>
          <ShopFilters materials={materials} />
        </Suspense>

        <div className="flex-1">
          <div className="mb-6 hidden justify-end lg:flex">
            <Suspense>
              <ShopSortDesktop />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
              <PackageOpenIcon className="size-10 text-muted-foreground" />
              <p className="font-medium">No products match those filters.</p>
              <p className="text-sm text-muted-foreground">
                Try clearing a filter or searching for something else.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
