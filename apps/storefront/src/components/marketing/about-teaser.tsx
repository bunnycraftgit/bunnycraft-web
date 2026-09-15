import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { printImage } from "@/lib/catalog-data";

const STATS = [
  { value: "10k+", label: "Prints shipped" },
  { value: "8", label: "Curated filaments" },
  { value: "2-3 days", label: "Avg. turnaround" },
];

export function AboutTeaser() {
  return (
    <section className="container-page py-20">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={printImage(0, 900, 900)}
            alt="A 3D printer producing a custom part at the BunnyCraft print farm"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">About BunnyCraft</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            A print farm built around clarity, not guesswork
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            BunnyCraft started as a single print farm with a simple goal: let anyone go from an
            idea to a physical object without wondering what it&apos;ll cost or how long it&apos;ll
            take. Every order — off the shelf or fully custom — ships from our own studio with a
            real person checking it before it goes out the door.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl font-bold sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          <Button size="lg" variant="outline" className="mt-8" asChild>
            <Link href="/about">
              Our Story <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
