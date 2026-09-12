import type { Metadata } from "next";

import { CouponsManager } from "@/components/admin/coupons-manager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin — Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

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

  return <CouponsManager initial={plain} />;
}
