import { NextResponse } from "next/server";

import { Order, OrderItem, User, updateByPk } from "@bunnycraft/db";
import { requireAdmin } from "@/lib/require-admin";
import { orderUpdateSchema } from "@/lib/validations/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const order = await Order.findByPk(id, {
    include: [
      { model: OrderItem, as: "items" },
      { model: User, as: "user", attributes: ["name", "email"] },
    ],
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = orderUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const order = await updateByPk(Order, id, parsed.data);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json(order);
}
