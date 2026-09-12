import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ valid: false, message: "Invalid request." }, { status: 400 });
  }

  const { code, subtotal } = parsed.data;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, message: "That coupon code isn't valid." });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, message: "That coupon has expired." });
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, message: "That coupon has reached its usage limit." });
  }
  if (coupon.minSubtotal && subtotal < Number(coupon.minSubtotal)) {
    return NextResponse.json({
      valid: false,
      message: `Add ${(Number(coupon.minSubtotal) - subtotal).toFixed(2)} more to use this coupon.`,
    });
  }

  const discountAmount =
    coupon.discountType === "PERCENT"
      ? Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100
      : Math.min(Number(coupon.value), subtotal);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    value: Number(coupon.value),
    discountAmount,
  });
}
