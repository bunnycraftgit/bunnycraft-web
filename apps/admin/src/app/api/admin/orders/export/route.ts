import { NextResponse } from "next/server";

import { prisma } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { buildOrderWhere } from "@/lib/admin-order-filters";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(request.url);
  const where = buildOrderWhere({
    q: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
  });

  const orders = await prisma.order.findMany({
    where,
    include: { items: { select: { id: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Order ID",
    "Date",
    "Status",
    "Customer",
    "Email",
    "Items",
    "Subtotal",
    "Discount",
    "Shipping",
    "Total",
    "Coupon",
    "Tracking Number",
  ];

  const rows = orders.map((o) => [
    o.id,
    o.createdAt.toISOString(),
    o.status,
    o.user?.name ?? o.shippingName,
    o.user?.email ?? o.guestEmail ?? "",
    String(o.items.length),
    o.subtotal.toString(),
    o.discountTotal.toString(),
    o.shippingTotal.toString(),
    o.total.toString(),
    o.couponCode ?? "",
    o.trackingNumber ?? "",
  ]);

  const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(String(v))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
