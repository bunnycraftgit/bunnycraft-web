import type { Metadata } from "next";

import { FilamentsManager } from "@/components/admin/filaments-manager";
import { Filament, Op, contains } from "@bunnycraft/db";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";

export const metadata: Metadata = { title: "Admin — Filaments" };

const PAGE_SIZE = 20;

export default async function AdminFilamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = parseQuery(sp);
  const where = q ? { [Op.or]: [{ name: contains(q) }, { type: contains(q) }] } : {};

  const [filaments, total] = await Promise.all([
    Filament.findAll({
      where,
      order: [["name", "ASC"]],
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    Filament.count({ where }),
  ]);

  const plain = filaments.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    colors: Array.isArray(f.colors) ? f.colors : [],
    pricePerGram: Number(f.pricePerGram),
    density: Number(f.density),
    stockGrams: f.stockGrams,
    strength: f.strength,
    finish: f.finish,
    description: f.description,
    active: f.active,
  }));

  return <FilamentsManager initial={plain} meta={paginationMeta(page, total, PAGE_SIZE)} />;
}
