import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, PackageIcon, TruckIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderTimeline } from "@/components/account/order-timeline";
import { DeliveryEstimate } from "@/components/shop/delivery-estimate";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/lib/data/orders";
import { formatCurrency } from "@/lib/utils";

const PENDING_STATUSES = new Set(["PENDING_PAYMENT", "PROCESSING", "SHIPPED"]);

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/account/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" /> Back to orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Placed{" "}
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <OrderTimeline status={order.status} />
        {order.trackingNumber && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-sm">
            <TruckIcon className="size-4 text-primary" />
            Tracking number: <span className="font-medium">{order.trackingNumber}</span>
          </div>
        )}
        {PENDING_STATUSES.has(order.status) && (
          <div className="mt-6">
            <DeliveryEstimate
              items={order.items.map((i) => ({ kind: i.kind, estPrintHours: i.estPrintHours }))}
              from={new Date(order.createdAt)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h2 className="mb-4 font-heading font-semibold">Items</h2>
          <ul className="flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <PackageIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity}
                    {item.heightMm && item.widthMm && item.depthMm
                      ? ` · ${item.heightMm}×${item.widthMm}×${item.depthMm}mm`
                      : ""}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>−{formatCurrency(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shippingTotal === 0 ? "Free" : formatCurrency(order.shippingTotal)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-3 font-heading font-semibold">Shipping Address</h2>
          <p className="text-sm text-muted-foreground">
            {order.shippingName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
            <br />
            {order.shippingCity}, {order.shippingState} {order.shippingZip}
            <br />
            {order.shippingCountry}
          </p>
        </div>
      </div>
    </div>
  );
}
