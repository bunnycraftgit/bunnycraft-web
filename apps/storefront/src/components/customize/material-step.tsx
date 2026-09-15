"use client";

import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlainFilament } from "@/lib/data/filaments";

const STRENGTH_LABEL: Record<PlainFilament["strength"], string> = {
  LOW: "Light Duty",
  MEDIUM: "Standard",
  HIGH: "Heavy Duty",
  VERY_HIGH: "Industrial",
};

export function MaterialStep({
  filaments,
  filamentId,
  colorName,
  onSelect,
  onNext,
  onBack,
}: {
  filaments: PlainFilament[];
  filamentId: string | null;
  colorName: string | null;
  onSelect: (filamentId: string, colorName: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Choose your material</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pricing updates instantly as you switch filament or color.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filaments.map((f) => {
          const selected = filamentId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id, colorName && selected ? colorName : f.colors[0]?.name ?? "")}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all",
                selected
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-heading font-semibold">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.finish}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-heading font-semibold">
                    ${f.pricePerGram.toFixed(3)}
                    <span className="text-xs font-normal text-muted-foreground">/g</span>
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {STRENGTH_LABEL[f.strength]}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{f.description}</p>

              <div className="flex flex-wrap items-center gap-2">
                {f.colors.map((c) => {
                  const colorSelected = selected && colorName === c.name;
                  return (
                    <span
                      key={c.name}
                      role="button"
                      tabIndex={0}
                      title={c.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(f.id, c.name);
                      }}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-none border-2 transition-transform hover:scale-110",
                        colorSelected ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {colorSelected && (
                        <CheckIcon
                          className="size-3.5"
                          style={{
                            color: isLight(c.hex) ? "#111" : "#fff",
                          }}
                        />
                      )}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button size="lg" variant="outline" onClick={onBack}>
          <ArrowLeftIcon /> Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!filamentId || !colorName}>
          Continue <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
