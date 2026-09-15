"use client";

import * as React from "react";

import { cn, formatCurrency } from "@/lib/utils";

type Point = { date: string; value: number };

function formatValue(variant: "currency" | "count", value: number) {
  if (variant === "currency") return formatCurrency(value);
  return `${value} order${value === 1 ? "" : "s"}`;
}

export function TrendChart({
  title,
  points,
  variant,
}: {
  title: string;
  points: Point[];
  variant: "currency" | "count";
}) {
  const [hover, setHover] = React.useState<number | null>(null);

  const max = Math.max(1, ...points.map((p) => p.value));
  const n = points.length;
  const gap = 0.6;
  const barWidth = n > 0 ? (100 - gap * (n - 1)) / n : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-heading text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>
      <div className="relative h-32">
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`${title} over the last 30 days`}
        >
          <line x1="0" y1="39.5" x2="100" y2="39.5" className="stroke-border" strokeWidth="0.5" />
          {points.map((p, i) => {
            const h = max > 0 ? (p.value / max) * 34 : 0;
            const x = i * (barWidth + gap);
            return (
              <rect
                key={p.date}
                x={x}
                y={39 - h}
                width={Math.max(barWidth, 0.3)}
                height={h}
                rx="0.6"
                className={cn(
                  "fill-primary transition-opacity",
                  hover !== null && hover !== i && "opacity-30"
                )}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>
        {hover !== null && points[hover] && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lift"
            style={{ left: `${((hover + 0.5) / n) * 100}%` }}
          >
            <p className="font-semibold">{formatValue(variant, points[hover].value)}</p>
            <p className="text-muted-foreground">
              {new Date(points[hover].date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>
          {points[0] &&
            new Date(points[0].date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
        </span>
        <span>
          {points[n - 1] &&
            new Date(points[n - 1].date).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })}
        </span>
      </div>
    </div>
  );
}
