import type { Metadata } from "next";

import { OrdersManager } from "@/components/admin/orders-manager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin — Orders" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: { select: { id: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

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

  return <OrdersManager initial={plain} />;
}
