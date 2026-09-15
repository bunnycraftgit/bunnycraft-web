"use client";

import * as React from "react";
import { LoaderCircleIcon, PackageIcon, SearchIcon, TruckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@bunnycraft/shared/src/components/order-status-badge";
import { OrderTimeline } from "@bunnycraft/shared/src/components/order-timeline";
import { formatCurrency } from "@/lib/utils";
import type { PlainOrder } from "@/lib/data/orders";

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<PlainOrder | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h2>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <OrderTimeline status={order.status} />
          {order.trackingNumber && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-sm">
              <TruckIcon className="size-4 text-primary" />
              Tracking number: <span className="font-medium">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-heading font-semibold">Items</h3>
          <ul className="flex flex-col gap-4">
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
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <Button variant="outline" onClick={() => setOrder(null)} className="self-start">
          Track another order
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orderNumber">Order number</Label>
        <Input
          id="orderNumber"
          placeholder="e.g. A1B2C3D4"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Find this on your order confirmation page — it looks like #A1B2C3D4.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">The email you used at checkout.</p>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? <LoaderCircleIcon className="animate-spin" /> : <SearchIcon />}
        Track Order
      </Button>
    </form>
  );
}
