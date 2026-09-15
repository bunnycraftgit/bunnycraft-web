"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangleIcon, LoaderCircleIcon, PrinterIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OrderStatusBadge } from "@bunnycraft/shared/src/components/order-status-badge";
import { OrderTimeline } from "@bunnycraft/shared/src/components/order-timeline";
import { DeliveryEstimate } from "@bunnycraft/shared/src/components/delivery-estimate";
import { formatCurrency } from "@/lib/utils";

type Status = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
const PENDING_STATUSES = new Set<Status>(["PENDING_PAYMENT", "PROCESSING", "SHIPPED"]);

type FullOrder = {
  id: string;
  status: Status;
  createdAt: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  total: string;
  couponCode: string | null;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  trackingNumber: string | null;
  guestEmail: string | null;
  user: { name: string | null; email: string } | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: string;
    kind: "PRODUCT" | "CUSTOM";
    estPrintHours: string | null;
  }[];
};

export function OrderDetailSheet({ orderId, trigger }: { orderId: string; trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<FullOrder | null>(null);

  async function loadOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error ?? "Couldn't load this order.");
      setOrder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't load this order.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !order) loadOrder();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Order #{orderId.slice(-8).toUpperCase()}</SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex justify-center py-10">
            <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangleIcon className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={loadOrder}>
              <RefreshCwIcon /> Try again
            </Button>
          </div>
        )}

        {order && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={order.status} />
              <Button asChild variant="outline" size="sm">
                <Link href={`/bunnycraft-admin/orders/${order.id}/packing-slip`} target="_blank">
                  <PrinterIcon /> Packing slip
                </Link>
              </Button>
            </div>

            <OrderTimeline status={order.status} />

            {order.trackingNumber && (
              <p className="text-sm">
                <span className="text-muted-foreground">Tracking:</span>{" "}
                <span className="font-medium">{order.trackingNumber}</span>
              </p>
            )}

            {PENDING_STATUSES.has(order.status) && (
              <DeliveryEstimate
                items={order.items.map((i) => ({
                  kind: i.kind,
                  estPrintHours: i.estPrintHours ? Number(i.estPrintHours) : null,
                }))}
                from={new Date(order.createdAt)}
              />
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold">Customer</h3>
              <p className="text-sm text-muted-foreground">
                {order.user?.name ?? order.shippingName} · {order.user?.email ?? order.guestEmail}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Items</h3>
              <ul className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discountTotal) > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>−{formatCurrency(Number(order.discountTotal))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {Number(order.shippingTotal) === 0 ? "Free" : formatCurrency(Number(order.shippingTotal))}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 text-sm font-semibold">Shipping address</h3>
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
        )}
      </SheetContent>
    </Sheet>
  );
}
