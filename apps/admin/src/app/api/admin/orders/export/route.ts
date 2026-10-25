import { NextResponse } from "next/server";

import { Order, OrderItem, User } from "@bunnycraft/db";
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

  const orders = await Order.findAll({
    where,
    include: [
      { model: OrderItem, as: "items", attributes: ["id"] },
      { model: User, as: "user", attributes: ["name", "email"] },
    ],
    order: [["createdAt", "DESC"]],
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
    String(o.items?.length ?? 0),
    o.subtotal.toFixed(2),
    o.discountTotal.toFixed(2),
    o.shippingTotal.toFixed(2),
    o.total.toFixed(2),
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
