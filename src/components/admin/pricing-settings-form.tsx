"use client";

import * as React from "react";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PricingSettingsValues } from "@/lib/pricing";

export function PricingSettingsForm({ initial }: { initial: PricingSettingsValues }) {
  const [form, setForm] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);

  function field(
    key: keyof PricingSettingsValues,
    label: string,
    description: string,
    step = "0.01"
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={key}>{label}</Label>
        <Input
          id={key}
          type="number"
          step={step}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Pricing settings updated — the customize wizard now uses these values.");
    } catch {
      toast.error("Couldn't save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {field(
          "machineRatePerHour",
          "Machine rate ($/hr)",
          "Charged for every hour the printer is estimated to run."
        )}
        {field(
          "printSpeedGramsPerHour",
          "Print speed (g/hr)",
          "Average grams of filament extruded per hour."
        )}
        {field("finishingCostFlat", "Finishing cost ($)", "Flat fee per custom print line item.")}
        {field(
          "infillFactor",
          "Infill factor",
          "Fraction of bounding-box volume that becomes printed material.",
          "0.01"
        )}
        {field(
          "shapeFactor",
          "Shape factor",
          "Fraction accounting for non-cuboid model shapes.",
          "0.01"
        )}
        {field(
          "minimumPrice",
          "Minimum price ($)",
          "Price floor for a single custom print, even if the computed cost is lower."
        )}
      </div>
      <Button type="submit" disabled={saving} className="w-fit">
        {saving && <LoaderCircleIcon className="animate-spin" />}
        Save settings
      </Button>
    </form>
  );
}
