import { NextResponse } from "next/server";

import { Order, OrderItem, User } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const orders = await Order.findAll({
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["name", "email"] },
    ],
    order: [["createdAt", "DESC"]],
  });
  return NextResponse.json(orders);
}
