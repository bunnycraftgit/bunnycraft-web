import type { Metadata } from "next";

import { OrdersManager } from "@/components/admin/orders-manager";
import { prisma } from "@/lib/prisma";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";
import { buildOrderWhere } from "@/lib/admin-order-filters";

export const metadata: Metadata = { title: "Admin — Orders" };

const PAGE_SIZE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = parseQuery(sp);
  const where = buildOrderWhere({ q, status: sp.status, dateFrom: sp.dateFrom, dateTo: sp.dateTo });

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { select: { id: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  const plain = orders.map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    trackingNumber: o.trackingNumber,
    shippingName: o.shippingName,
    guestEmail: o.guestEmail,
    user: o.user,
    items: o.items,
  }));

  return <OrdersManager initial={plain} meta={paginationMeta(page, total, PAGE_SIZE)} />;
}
