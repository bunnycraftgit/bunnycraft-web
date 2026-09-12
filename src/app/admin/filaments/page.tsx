import type { Metadata } from "next";

import { FilamentsManager } from "@/components/admin/filaments-manager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin — Filaments" };

export default async function AdminFilamentsPage() {
  const filaments = await prisma.filament.findMany({ orderBy: { name: "asc" } });

  const plain = filaments.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    colors: Array.isArray(f.colors) ? (f.colors as { name: string; hex: string }[]) : [],
    pricePerGram: Number(f.pricePerGram),
    density: Number(f.density),
    stockGrams: f.stockGrams,
    strength: f.strength,
    finish: f.finish,
    description: f.description,
    active: f.active,
  }));

  return <FilamentsManager initial={plain} />;
}
