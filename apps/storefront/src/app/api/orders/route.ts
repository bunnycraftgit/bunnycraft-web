import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  Address,
  Coupon,
  Filament,
  Order,
  OrderItem,
  Product,
  sequelize,
  type CreationAttributes,
} from "@bunnycraft/db";
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

  const orders = await Order.findAll({
    where: { userId: session.user.id },
    order: [["createdAt", "DESC"]],
    include: [{ model: OrderItem, as: "items" }],
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
    productIds.length ? Product.findAll({ where: { id: productIds } }) : [],
    filamentIds.length ? Filament.findAll({ where: { id: filamentIds } }) : [],
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

  const unavailableProducts = products.filter((p) => p.status !== "LIVE");
  if (unavailableProducts.length) {
    return NextResponse.json(
      {
        error: `${unavailableProducts.map((p) => p.name).join(", ")} ${
          unavailableProducts.length === 1 ? "isn't" : "aren't"
        } available right now and ${unavailableProducts.length === 1 ? "was" : "were"} removed from your cart.`,
        invalidProductIds: unavailableProducts.map((p) => p.id),
        invalidFilamentIds: [],
      },
      { status: 400 }
    );
  }

  let subtotal = 0;
  const itemsToCreate: Omit<CreationAttributes<OrderItem>, "orderId">[] = [];

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
        productId: product.id,
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
        filamentId: filament.id,
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
  let appliedCoupon: Coupon | null = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ where: { code: couponCode.trim().toUpperCase() } });
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
      appliedCoupon = coupon;
    }
  }

  const shippingTotal = subtotal - discountTotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const total = round2(Math.max(0, subtotal - discountTotal) + shippingTotal);

  const order = await sequelize.transaction(async (transaction) => {
    const created = await Order.create(
      {
        userId: session?.user?.id ?? null,
        guestEmail: session?.user ? null : guestEmail,
        status: "PENDING_PAYMENT",
        subtotal,
        discountTotal,
        shippingTotal,
        total,
        couponCode: appliedCoupon?.code ?? null,
        shippingName: shipping.fullName,
        shippingLine1: shipping.line1,
        shippingLine2: shipping.line2,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingZip: shipping.zip,
        shippingCountry: shipping.country,
      },
      { transaction }
    );
    await OrderItem.bulkCreate(
      itemsToCreate.map((item) => ({ ...item, orderId: created.id })),
      { transaction }
    );
    if (appliedCoupon) {
      await appliedCoupon.increment("usedCount", { by: 1, transaction });
    }
    return created;
  });

  if (session?.user && saveAddress) {
    await Address.create({
      userId: session.user.id,
      fullName: shipping.fullName,
      line1: shipping.line1,
      line2: shipping.line2,
      city: shipping.city,
      state: shipping.state,
      zip: shipping.zip,
      country: shipping.country,
      phone: shipping.phone,
    });
  }

  return NextResponse.json({ orderId: order.id });
}
