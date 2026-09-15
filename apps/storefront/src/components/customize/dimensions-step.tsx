"use client";

import { ArrowLeftIcon, ArrowRightIcon, BoxIcon, ClockIcon, ScaleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  estimatedPrintTimeHours,
  estimatedPrintVolumeCm3,
  estimatedWeightGrams,
  type Dimensions,
  type PricingSettingsValues,
} from "@/lib/pricing";

const AVERAGE_DENSITY = 1.2;

export function DimensionsStep({
  dimensions,
  onChange,
  settings,
  onNext,
  onBack,
}: {
  dimensions: Dimensions;
  onChange: (dimensions: Dimensions) => void;
  settings: PricingSettingsValues;
  onNext: () => void;
  onBack: () => void;
}) {
  const volumeCm3 = estimatedPrintVolumeCm3(dimensions, settings);
  const weightGrams = estimatedWeightGrams(volumeCm3, AVERAGE_DENSITY);
  const printHours = estimatedPrintTimeHours(weightGrams, settings);

  const valid = dimensions.heightMm > 0 && dimensions.widthMm > 0 && dimensions.depthMm > 0;

  function field(key: keyof Dimensions, label: string) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={key}>{label} (mm)</Label>
        <Input
          id={key}
          type="number"
          min={1}
          max={500}
          step={0.1}
          value={dimensions[key] || ""}
          onChange={(e) => onChange({ ...dimensions, [key]: Number(e.target.value) })}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Set your dimensions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We prefilled these from your model — adjust to the size you want printed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {field("heightMm", "Height")}
        {field("widthMm", "Width")}
        {field("depthMm", "Depth")}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/40 p-5 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary">
            <BoxIcon className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Print volume</p>
            <p className="font-heading font-semibold">{volumeCm3.toFixed(1)} cm³</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary">
            <ScaleIcon className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. filament usage</p>
            <p className="font-heading font-semibold">{weightGrams.toFixed(0)} g</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary">
            <ClockIcon className="size-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. print time</p>
            <p className="font-heading font-semibold">{printHours.toFixed(1)} hrs</p>
          </div>
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Based on an average filament density — exact figures update once you pick a material.
      </p>

      <div className="flex justify-between">
        <Button size="lg" variant="outline" onClick={onBack}>
          <ArrowLeftIcon /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!valid}>
          Continue <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
