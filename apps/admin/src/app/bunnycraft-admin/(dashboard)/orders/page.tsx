import type { Metadata } from "next";

import { OrdersManager } from "@/components/admin/orders-manager";
import { Order, OrderItem, User } from "@bunnycraft/db";
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
    Order.findAll({
      where,
      include: [
        { model: OrderItem, as: "items", attributes: ["id"] },
        { model: User, as: "user", attributes: ["name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    Order.count({ where }),
  ]);

  const plain = orders.map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    trackingNumber: o.trackingNumber,
    paymentProofUrl: o.paymentProofUrl,
    shippingName: o.shippingName,
    guestEmail: o.guestEmail,
    user: o.user ? { name: o.user.name, email: o.user.email } : null,
    items: (o.items ?? []).map((i) => ({ id: i.id })),
  }));

  return <OrdersManager initial={plain} meta={paginationMeta(page, total, PAGE_SIZE)} />;
}
