import { Order, OrderItem, User, endsWith } from "@bunnycraft/db";

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
  paymentProofUrl: string | null;
  paymentReference: string | null;
  paymentSubmittedAt: string | null;
  createdAt: string;
  items: PlainOrderItem[];
};

function mapOrder(order: Order): PlainOrder {
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
    paymentProofUrl: order.paymentProofUrl,
    paymentReference: order.paymentReference,
    paymentSubmittedAt: order.paymentSubmittedAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    items: (order.items ?? []).map((i) => ({
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

const withItems = { model: OrderItem, as: "items" };

function fetchOrder(id: string) {
  return Order.findByPk(id, { include: [withItems] });
}

export async function getOrderById(id: string): Promise<PlainOrder | null> {
  const order = await fetchOrder(id);
  if (!order) return null;
  return mapOrder(order);
}

export async function getOrdersForUser(userId: string): Promise<PlainOrder[]> {
  const orders = await Order.findAll({
    where: { userId },
    include: [withItems],
    order: [["createdAt", "DESC"]],
  });
  return orders.map(mapOrder);
}

// Guests have no account, so the only way for them to look up an order later
// is the (truncated) order number shown on the confirmation page plus the
// email they checked out with. The full id also matches, since it trivially
// "ends with" itself, so this works for logged-in order ids too.
export async function findOrderForTracking(
  orderNumber: string,
  email: string
): Promise<PlainOrder | null> {
  const suffix = orderNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!suffix) return null;

  const order = await Order.findOne({
    where: { id: endsWith(suffix) },
    include: [withItems, { model: User, as: "user", attributes: ["email"] }],
  });
  if (!order) return null;

  const orderEmail = (order.user?.email ?? order.guestEmail ?? "").toLowerCase();
  if (orderEmail !== email.trim().toLowerCase()) return null;

  return mapOrder(order);
}
