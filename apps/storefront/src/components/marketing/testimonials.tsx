"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shop/star-rating";
import type { PlainTestimonial } from "@/lib/data/reviews";

export function Testimonials({ testimonials }: { testimonials: PlainTestimonial[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth + 20 : 340;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="container-page py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">What Customers Are Saying</h2>
          <p className="mt-2 text-muted-foreground">Real prints, real feedback.</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="icon" onClick={() => scrollByCard(-1)} aria-label="Previous">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scrollByCard(1)} aria-label="Next">
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((t) => (
          <div
            key={t.id}
            data-card
            className="flex w-[85vw] shrink-0 snap-start flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft sm:w-[380px]"
          >
            <QuoteIcon className="size-6 text-primary/40" />
            <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{t.comment}&rdquo;</p>
            <div className="mt-auto flex items-center gap-3 pt-2">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-none bg-muted">
                {t.photoUrl && (
                  <Image src={t.photoUrl} alt={t.authorName} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{t.authorName}</p>
                <StarRating rating={t.rating} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
