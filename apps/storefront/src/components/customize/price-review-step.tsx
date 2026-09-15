"use client";

import { ArrowLeftIcon, LoaderCircleIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DeliveryEstimate } from "@bunnycraft/shared/src/components/delivery-estimate";
import { calculateCustomPrintPrice, type Dimensions, type PricingSettingsValues } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import type { PlainFilament } from "@/lib/data/filaments";

export function PriceReviewStep({
  file,
  dimensions,
  filament,
  colorName,
  quantity,
  settings,
  onQuantityChange,
  onBack,
  onAddToCart,
  submitting,
}: {
  file: File;
  dimensions: Dimensions;
  filament: PlainFilament;
  colorName: string;
  quantity: number;
  settings: PricingSettingsValues;
  onQuantityChange: (quantity: number) => void;
  onBack: () => void;
  onAddToCart: () => void;
  submitting: boolean;
}) {
  const breakdown = calculateCustomPrintPrice({ dimensions, filament, settings, quantity });

  const rows: Array<[string, string]> = [
    ["Filament used", `${breakdown.weightGrams} g`],
    ["Material price", `${formatCurrency(filament.pricePerGram)}/g`],
    ["Material cost", formatCurrency(breakdown.materialCost)],
    ["Printing cost", `${formatCurrency(breakdown.printingCost)} (${breakdown.printTimeHours} hrs)`],
    ["Finishing", formatCurrency(breakdown.finishingCost)],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Review & price</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This updates instantly if you go back and change anything.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border p-5">
          <h3 className="mb-3 font-heading font-semibold">Configuration</h3>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">File</dt>
              <dd className="max-w-[60%] truncate text-right">{file.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Dimensions</dt>
              <dd>
                {dimensions.heightMm} × {dimensions.widthMm} × {dimensions.depthMm} mm
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Material</dt>
              <dd>{filament.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Color</dt>
              <dd>{colorName}</dd>
            </div>
          </dl>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-1 rounded-none border border-border">
              <button
                className="flex size-7 items-center justify-center rounded-none hover:bg-muted"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <MinusIcon className="size-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
              <button
                className="flex size-7 items-center justify-center rounded-none hover:bg-muted"
                onClick={() => onQuantityChange(Math.min(20, quantity + 1))}
                aria-label="Increase quantity"
              >
                <PlusIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-5">
          <h3 className="mb-3 font-heading font-semibold">Price breakdown</h3>
          <dl className="flex flex-col gap-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <Separator className="my-4" />
          {breakdown.minimumApplied && (
            <p className="mb-2 text-xs text-muted-foreground">
              Minimum order price applied — this print&apos;s computed cost was below our{" "}
              {formatCurrency(breakdown.unitPrice)} minimum.
            </p>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unit price × {quantity}</span>
            <span>{formatCurrency(breakdown.unitPrice)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-heading text-lg font-semibold">Total</span>
            <span className="font-heading text-2xl font-bold">{formatCurrency(breakdown.total)}</span>
          </div>
          <Separator className="my-4" />
          <DeliveryEstimate items={[{ kind: "CUSTOM", estPrintHours: breakdown.printTimeHours }]} />
        </div>
      </div>

      <div className="flex justify-between">
        <Button size="lg" variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeftIcon /> Back
        </Button>
        <Button size="lg" onClick={onAddToCart} disabled={submitting}>
          {submitting ? <LoaderCircleIcon className="animate-spin" /> : <ShoppingBagIcon />}
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
