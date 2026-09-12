import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { couponSchema } from "@/lib/validations/admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = couponSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
  });
  if (existing) {
    return NextResponse.json({ error: "That coupon code already exists." }, { status: 409 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      ...parsed.data,
      code: parsed.data.code.toUpperCase(),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });
  return NextResponse.json(coupon);
}
