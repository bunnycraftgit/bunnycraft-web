import type { Metadata } from "next";

import { CouponsManager } from "@/components/admin/coupons-manager";
import { prisma } from "@bunnycraft/db";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";

export const metadata: Metadata = { title: "Admin — Coupons" };

const PAGE_SIZE = 20;

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = parseQuery(sp);
  const where = q ? { code: { contains: q.toUpperCase() } } : {};

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.coupon.count({ where }),
  ]);

  const plain = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    value: Number(c.value),
    minSubtotal: c.minSubtotal ? Number(c.minSubtotal) : null,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }));

  return <CouponsManager initial={plain} meta={paginationMeta(page, total, PAGE_SIZE)} />;
}
