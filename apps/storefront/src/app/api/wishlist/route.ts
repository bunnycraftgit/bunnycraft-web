import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { WishlistItem } from "@bunnycraft/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const items = await WishlistItem.findAll({
    where: { userId: session.user.id },
    attributes: ["productId"],
  });

  return NextResponse.json(items);
}

const bodySchema = z.object({ productId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const key = { userId: session.user.id, productId: parsed.data.productId };
  await WishlistItem.findOrCreate({ where: key, defaults: key });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  await WishlistItem.destroy({
    where: { userId: session.user.id, productId: parsed.data.productId },
  });

  return NextResponse.json({ ok: true });
}
