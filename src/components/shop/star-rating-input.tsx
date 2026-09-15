"use client";

import * as React from "react";
import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <StarIcon
              className={cn(
                "size-6 transition-colors",
                star <= display ? "fill-primary text-primary" : "fill-muted text-muted"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
