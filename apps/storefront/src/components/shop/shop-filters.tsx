"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CATEGORIES } from "@/lib/catalog-data";
import { formatCurrency } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const MAX_PRICE = 50;

function FiltersBody({
  materials,
  activeCategory,
  activeMaterial,
  priceRange,
  onChange,
}: {
  materials: string[];
  activeCategory?: string;
  activeMaterial?: string;
  priceRange: [number, number];
  onChange: (patch: Record<string, string | null>) => void;
}) {
  const [localRange, setLocalRange] = React.useState(priceRange);
  const [prevPriceRange, setPrevPriceRange] = React.useState(priceRange);

  if (priceRange[0] !== prevPriceRange[0] || priceRange[1] !== prevPriceRange[1]) {
    setPrevPriceRange(priceRange);
    setLocalRange(priceRange);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onChange({ category: null })}
            className={`rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
              !activeCategory ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted"
            }`}
          >
            All categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => onChange({ category: c.slug })}
              className={`rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                activeCategory === c.slug
                  ? "bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Material</h3>
        <div className="flex flex-col gap-2.5">
          {materials.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox
                checked={activeMaterial === m}
                onCheckedChange={(checked) => onChange({ material: checked ? m : null })}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold">Price</h3>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={1}
          value={localRange}
          onValueChange={(v) => setLocalRange(v as [number, number])}
          onValueCommit={(v) =>
            onChange({
              minPrice: v[0] > 0 ? String(v[0]) : null,
              maxPrice: v[1] < MAX_PRICE ? String(v[1]) : null,
            })
          }
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(localRange[0])}</span>
          <span>{formatCurrency(localRange[1])}{localRange[1] === MAX_PRICE ? "+" : ""}</span>
        </div>
      </div>
    </div>
  );
}

export function ShopFilters({ materials }: { materials: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const activeCategory = searchParams.get("category") ?? undefined;
  const activeMaterial = searchParams.get("material") ?? undefined;
  const activeSort = searchParams.get("sort") ?? "newest";
  const minPrice = Number(searchParams.get("minPrice") ?? 0);
  const maxPrice = Number(searchParams.get("maxPrice") ?? MAX_PRICE);

  const activeFilterCount = [activeCategory, activeMaterial, searchParams.get("minPrice"), searchParams.get("maxPrice")].filter(Boolean).length;

  function patch(values: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    ["category", "material", "minPrice", "maxPrice"].forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterIcon className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-none bg-primary px-1.5 text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-xs">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto">
              <FiltersBody
                materials={materials}
                activeCategory={activeCategory}
                activeMaterial={activeMaterial}
                priceRange={[minPrice, maxPrice]}
                onChange={patch}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Select value={activeSort} onValueChange={(v) => patch({ sort: v })}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <Label className="text-sm font-semibold">Filters</Label>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3" /> Clear
            </button>
          )}
        </div>
        <FiltersBody
          materials={materials}
          activeCategory={activeCategory}
          activeMaterial={activeMaterial}
          priceRange={[minPrice, maxPrice]}
          onChange={patch}
        />
      </aside>
    </>
  );
}

export function ShopSortDesktop() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSort = searchParams.get("sort") ?? "newest";

  function onSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={activeSort} onValueChange={onSortChange}>
      <SelectTrigger size="sm" className="hidden w-48 lg:flex">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
