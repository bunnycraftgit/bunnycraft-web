import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2Icon, PackageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/lib/data/orders";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  const session = await auth();
  if (order.userId && order.userId !== session?.user?.id) notFound();

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-none bg-success/15 text-success">
          <CheckCircle2Icon className="size-7" />
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">Order Confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks{order.shippingName ? `, ${order.shippingName.split(" ")[0]}` : ""}! We&apos;ve
          received order <span className="font-medium text-foreground">#{order.id.slice(-8).toUpperCase()}</span>.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading font-semibold">Order Summary</h2>
          <span className="rounded-none bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            Pending Payment
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <PackageIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
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
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <span className="font-heading text-lg font-semibold">Total</span>
          <span className="font-heading text-xl font-bold">{formatCurrency(order.total)}</span>
        </div>

        <Separator className="my-4" />

        <div>
          <p className="mb-1 text-sm font-medium">Shipping to</p>
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

      <div className="mx-auto mt-8 flex max-w-2xl justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        {session?.user && (
          <Button asChild>
            <Link href="/account/orders">Track Your Orders</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
