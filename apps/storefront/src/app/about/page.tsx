import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhyChooseUs } from "@/components/marketing/why-choose-us";
import { Process } from "@/components/marketing/process";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind BunnyCraft's custom 3D printing studio.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="container-page py-16 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold sm:text-5xl">
          Custom 3D printing, built around clarity
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          BunnyCraft started as a single print farm with a simple goal: let anyone go from an
          idea to a physical object without guessing what it&apos;ll cost or how long it&apos;ll take.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/customize">
              Start a Custom Print <ArrowRightIcon />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/shop">Browse the Shop</Link>
          </Button>
        </div>
      </div>

      <Process />
      <WhyChooseUs />
    </div>
  );
}
