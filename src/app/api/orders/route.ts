import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPricingSettings } from "@/lib/data/filaments";
import { calculateCustomPrintPrice, round2 } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/payment";
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

  const productIds = [...new Set(items.filter((i) => i.kind === "PRODUCT").map((i) => i.productId))];
  const filamentIds = [...new Set(items.filter((i) => i.kind === "CUSTOM").map((i) => i.filamentId))];

  const [products, filaments] = await Promise.all([
    productIds.length ? prisma.product.findMany({ where: { id: { in: productIds } } }) : [],
    filamentIds.length ? prisma.filament.findMany({ where: { id: { in: filamentIds } } }) : [],
  ]);
  const productById = new Map(products.map((p) => [p.id, p]));
  const filamentById = new Map(filaments.map((f) => [f.id, f]));

  const invalidProductIds = productIds.filter((id) => !productById.has(id));
  const invalidFilamentIds = filamentIds.filter((id) => !filamentById.has(id));
  if (invalidProductIds.length || invalidFilamentIds.length) {
    return NextResponse.json(
      {
        error: "Some items in your cart are no longer available and were removed.",
        invalidProductIds,
        invalidFilamentIds,
      },
      { status: 400 }
    );
  }

  let subtotal = 0;
  const itemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];

  for (const item of items) {
    if (item.kind === "PRODUCT") {
      const product = productById.get(item.productId)!;
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
      const filament = filamentById.get(item.filamentId)!;
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

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder(total, order.id);
  } catch (err) {
    console.error("[POST /api/orders] Razorpay order creation failed —", err);
    await prisma.order.delete({ where: { id: order.id } }).catch(() => null);
    return NextResponse.json(
      { error: "Couldn't start payment. Please try again in a moment." },
      { status: 502 }
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id },
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

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    customerName: shipping.fullName,
    customerEmail: session?.user ? undefined : guestEmail,
    customerPhone: shipping.phone,
  });
}
