import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@bunnycraft/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
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

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: session.user.id, productId: parsed.data.productId },
    },
    update: {},
    create: { userId: session.user.id, productId: parsed.data.productId },
  });

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

  await prisma.wishlistItem
    .delete({
      where: {
        userId_productId: { userId: session.user.id, productId: parsed.data.productId },
      },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
