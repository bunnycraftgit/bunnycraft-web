import { NextResponse } from "next/server";

import { findOrderForTracking } from "@/lib/data/orders";
import { trackOrderSchema } from "@/lib/validations/order";

export async function POST(request: Request) {
  const parsed = trackOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const order = await findOrderForTracking(parsed.data.orderNumber, parsed.data.email);
  if (!order) {
    return NextResponse.json(
      { error: "We couldn't find an order matching that number and email." },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}
