"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, QuoteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shop/star-rating";
import { ShareReviewDialog } from "@/components/marketing/share-review-dialog";

type Testimonial = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  photoUrl: string | null;
  place?: string | null;
  // Google reviews only — Google requires linking back to the reviewer.
  authorUrl?: string | null;
  relativeTime?: string | null;
};

type GoogleSummary = { rating: number; total: number; mapsUrl: string | null };

export function Testimonials({
  testimonials,
  google,
}: {
  testimonials: Testimonial[];
  google?: GoogleSummary;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const width = card ? card.offsetWidth + 20 : 340;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  }

  return (
    <section className="container-page py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">What Customers Are Saying</h2>
          {google ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-heading text-2xl font-bold">{google.rating.toFixed(1)}</span>
              <StarRating rating={google.rating} size="md" />
              <span className="text-sm text-muted-foreground">
                {google.total} review{google.total === 1 ? "" : "s"} on Google
              </span>
              {google.mapsUrl && (
                <a
                  href={google.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  See all on Google <ExternalLinkIcon className="size-3.5" />
                </a>
              )}
            </div>
          ) : (
            <p className="mt-2 text-muted-foreground">Real prints, real feedback.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ShareReviewDialog />
          {testimonials.length > 1 && (
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" size="icon" onClick={() => scrollByCard(-1)} aria-label="Previous">
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scrollByCard(1)} aria-label="Next">
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {testimonials.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No reviews yet — be the first to share your experience!
        </p>
      )}

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
            <p className="line-clamp-6 text-sm leading-relaxed text-foreground/90">&ldquo;{t.comment}&rdquo;</p>
            <div className="mt-auto flex items-center gap-3 pt-2">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-none bg-muted">
                {t.photoUrl && (
                  <Image
                    src={t.photoUrl}
                    alt={t.authorName}
                    fill
                    sizes="40px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                {t.authorUrl ? (
                  <a
                    href={t.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    {t.authorName}
                  </a>
                ) : (
                  <p className="text-sm font-medium">{t.authorName}</p>
                )}
                {t.place && <p className="text-xs text-muted-foreground">{t.place}</p>}
                <div className="flex items-center gap-2">
                  <StarRating rating={t.rating} />
                  {t.relativeTime && (
                    <span className="text-xs text-muted-foreground">{t.relativeTime}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {google && <p className="mt-2 text-xs text-muted-foreground">Reviews from Google</p>}
    </section>
  );
}
