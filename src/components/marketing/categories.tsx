import Image from "next/image";
import Link from "next/link";

import { CATEGORIES, printImage } from "@/lib/catalog-data";

export function Categories() {
  return (
    <section className="container-page py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Shop by Category</h2>
          <p className="mt-2 text-muted-foreground">
            From tabletop miniatures to one-off replacement parts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-soft animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Image
              src={printImage(c.imageIndex, 500, 400)}
              alt={c.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-heading font-semibold text-white">{c.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
