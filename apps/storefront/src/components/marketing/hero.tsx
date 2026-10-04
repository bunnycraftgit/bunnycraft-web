"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

function unsplash(photoId: string) {
  return `https://images.unsplash.com/${photoId}?w=1800&h=1125&fit=crop&auto=format&q=80`;
}

const SLIDES = [
  {
    src: unsplash("photo-1758387933125-5ac945b4e2cd"),
    alt: "3D printer in operation, extruding a model layer by layer",
  },
  {
    src: unsplash("photo-1742971239045-afabc9f7d744"),
    alt: "Spools of colorful PLA filament used for custom 3D printing",
  },
  {
    src: unsplash("photo-1743056586194-837401d75e0a"),
    alt: "A 3D printer actively printing a detailed model",
  },
  {
    src: unsplash("photo-1563520240344-52b067aa5f84"),
    alt: "Desktop 3D printer ready to print a custom order",
  },
];

export function Hero() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  function goTo(delta: 1 | -1) {
    setActive((i) => (i + delta + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={SLIDES[active].src}
              alt={SLIDES[active].alt}
              fill
              priority={active === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
      </div>

      <div className="container-page relative z-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-none border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">
            <SparklesIcon className="size-3.5 text-primary" />
            Precision 3D printing, made to order
          </span>
          <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Bring Your Ideas to Life with Custom 3D Printing
          </h1>
          <p className="mt-5 max-w-lg text-balance text-lg text-white/80">
            Upload your design, choose your filament, get an instant price estimate, and order
            with confidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/customize">
                Customize Your Model <ArrowRightIcon />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <button
        aria-label="Previous slide"
        onClick={() => goTo(-1)}
        className="absolute top-1/2 left-4 z-10 hidden size-11 -translate-y-1/2 items-center justify-center border border-border bg-card/80 text-foreground backdrop-blur transition-colors hover:bg-card sm:flex"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => goTo(1)}
        className="absolute top-1/2 right-4 z-10 hidden size-11 -translate-y-1/2 items-center justify-center border border-border bg-card/80 text-foreground backdrop-blur transition-colors hover:bg-card sm:flex"
      >
        <ChevronRightIcon className="size-5" />
      </button>

      <div className="absolute right-6 bottom-6 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-none transition-all ${
              i === active ? "w-6 bg-primary" : "w-1.5 bg-foreground/25"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
