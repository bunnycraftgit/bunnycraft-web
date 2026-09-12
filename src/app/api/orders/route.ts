import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPricingSettings } from "@/lib/data/filaments";
import { calculateCustomPrintPrice, round2 } from "@/lib/pricing";
import { createOrderSchema } from "@/lib/validations/order";

const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING_RATE = 6.99;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  const parsed = createOrderSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order." },
      { status: 400 }
    );
  }

  const { items, shipping, couponCode, guestEmail, saveAddress } = parsed.data;

  if (!session?.user && !guestEmail) {
    return NextResponse.json(
      { error: "An email address is required to check out as a guest." },
      { status: 400 }
    );
  }

  const settings = await getPricingSettings();

  let subtotal = 0;
  const itemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];

  for (const item of items) {
    if (item.kind === "PRODUCT") {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: "One of the products in your cart is no longer available." }, { status: 400 });
      }
      const unitPrice = Number(product.price);
      subtotal += unitPrice * item.quantity;
      itemsToCreate.push({
        kind: "PRODUCT",
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        product: { connect: { id: product.id } },
      });
    } else {
      const filament = await prisma.filament.findUnique({ where: { id: item.filamentId } });
      if (!filament) {
        return NextResponse.json({ error: "The selected filament is no longer available." }, { status: 400 });
      }
      const breakdown = calculateCustomPrintPrice({
        dimensions: { heightMm: item.heightMm, widthMm: item.widthMm, depthMm: item.depthMm },
        filament: { pricePerGram: Number(filament.pricePerGram), density: Number(filament.density) },
        settings,
        quantity: item.quantity,
      });
      subtotal += breakdown.unitPrice * item.quantity;
      itemsToCreate.push({
        kind: "CUSTOM",
        name: `Custom print — ${item.fileName} (${filament.name}, ${item.colorName})`,
        quantity: item.quantity,
        unitPrice: breakdown.unitPrice,
        filament: { connect: { id: filament.id } },
        fileUrl: item.fileUrl,
        fileName: item.fileName,
        fileType: item.fileType,
        heightMm: item.heightMm,
        widthMm: item.widthMm,
        depthMm: item.depthMm,
        estWeightGrams: breakdown.weightGrams,
        estPrintHours: breakdown.printTimeHours,
      });
    }
  }
  subtotal = round2(subtotal);

  let discountTotal = 0;
  let appliedCouponCode: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    const validCoupon =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit) &&
      (!coupon.minSubtotal || subtotal >= Number(coupon.minSubtotal));

    if (validCoupon) {
      discountTotal =
        coupon.discountType === "PERCENT"
          ? round2(subtotal * (Number(coupon.value) / 100))
          : Math.min(Number(coupon.value), subtotal);
      appliedCouponCode = coupon.code;
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }
  }

  const shippingTotal = subtotal - discountTotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const total = round2(Math.max(0, subtotal - discountTotal) + shippingTotal);

  // Payment is stubbed for now (see lib/payment.ts) — the order is created
  // directly with PENDING_PAYMENT and no charge occurs.
  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id,
      guestEmail: session?.user ? undefined : guestEmail,
      status: "PENDING_PAYMENT",
      subtotal,
      discountTotal,
      shippingTotal,
      total,
      couponCode: appliedCouponCode,
      shippingName: shipping.fullName,
      shippingLine1: shipping.line1,
      shippingLine2: shipping.line2,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      shippingCountry: shipping.country,
      items: { create: itemsToCreate },
    },
  });

  if (session?.user && saveAddress) {
    await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: shipping.fullName,
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
        phone: shipping.phone,
      },
    });
  }

  return NextResponse.json({ orderId: order.id });
}
