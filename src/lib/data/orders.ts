import { prisma } from "@/lib/prisma";

export type PlainOrderItem = {
  id: string;
  kind: "PRODUCT" | "CUSTOM";
  name: string;
  quantity: number;
  unitPrice: number;
  fileUrl: string | null;
  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;
  estWeightGrams: number | null;
  estPrintHours: number | null;
};

export type PlainOrder = {
  id: string;
  status: "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  userId: string | null;
  guestEmail: string | null;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  couponCode: string | null;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  trackingNumber: string | null;
  createdAt: string;
  items: PlainOrderItem[];
};

function mapOrder(order: NonNullable<Awaited<ReturnType<typeof fetchOrder>>>): PlainOrder {
  return {
    id: order.id,
    status: order.status,
    userId: order.userId,
    guestEmail: order.guestEmail,
    subtotal: Number(order.subtotal),
    discountTotal: Number(order.discountTotal),
    shippingTotal: Number(order.shippingTotal),
    total: Number(order.total),
    couponCode: order.couponCode,
    shippingName: order.shippingName,
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingZip: order.shippingZip,
    shippingCountry: order.shippingCountry,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      kind: i.kind,
      name: i.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      fileUrl: i.fileUrl,
      heightMm: i.heightMm ? Number(i.heightMm) : null,
      widthMm: i.widthMm ? Number(i.widthMm) : null,
      depthMm: i.depthMm ? Number(i.depthMm) : null,
      estWeightGrams: i.estWeightGrams ? Number(i.estWeightGrams) : null,
      estPrintHours: i.estPrintHours ? Number(i.estPrintHours) : null,
    })),
  };
}

function fetchOrder(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { items: true } });
}

export async function getOrderById(id: string): Promise<PlainOrder | null> {
  const order = await fetchOrder(id);
  if (!order) return null;
  return mapOrder(order);
}

export async function getOrdersForUser(userId: string): Promise<PlainOrder[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrder);
}
