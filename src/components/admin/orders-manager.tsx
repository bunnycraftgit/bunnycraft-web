"use client";

import * as React from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatCurrency } from "@/lib/utils";

type Status = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type AdminOrder = {
  id: string;
  status: Status;
  total: number;
  createdAt: string;
  trackingNumber: string | null;
  shippingName: string;
  guestEmail: string | null;
  user: { name: string | null; email: string } | null;
  items: { id: string }[];
};

export function OrdersManager({ initial }: { initial: AdminOrder[] }) {
  const [orders, setOrders] = React.useState(initial);
  const [trackingDrafts, setTrackingDrafts] = React.useState<Record<string, string>>({});

  async function updateStatus(id: string, status: Status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    if (!res?.ok) toast.error("Couldn't update order status.");
  }

  async function saveTracking(id: string) {
    const trackingNumber = trackingDrafts[id];
    if (trackingNumber === undefined) return;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, trackingNumber } : o)));
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber }),
    }).catch(() => null);
    if (!res?.ok) toast.error("Couldn't save tracking number.");
    else toast.success("Tracking number saved.");
  }

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold">Orders</h2>
      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking #</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item
                    {o.items.length === 1 ? "" : "s"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{o.user?.name ?? o.shippingName}</p>
                  <p className="text-xs text-muted-foreground">{o.user?.email ?? o.guestEmail}</p>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(o.total)}</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as Status)}>
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue>
                        <OrderStatusBadge status={o.status} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 w-36"
                    defaultValue={o.trackingNumber ?? ""}
                    placeholder="—"
                    onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [o.id]: e.target.value }))}
                    onBlur={() => saveTracking(o.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
