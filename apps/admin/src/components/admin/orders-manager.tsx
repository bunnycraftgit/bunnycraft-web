"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DownloadIcon, EyeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { OrderDetailSheet } from "@/components/admin/order-detail-sheet";
import { OrderStatusBadge } from "@bunnycraft/shared/src/components/order-status-badge";
import { formatCurrency } from "@/lib/utils";

type Status = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type AdminOrder = {
  id: string;
  status: Status;
  total: number;
  createdAt: string;
  trackingNumber: string | null;
  paymentProofUrl: string | null;
  shippingName: string;
  guestEmail: string | null;
  user: { name: string | null; email: string } | null;
  items: { id: string }[];
};
type Meta = { page: number; pageCount: number; total: number; pageSize: number };

const STATUSES: Status[] = ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrdersManager({ initial, meta }: { initial: AdminOrder[]; meta: Meta }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [orders, setOrders] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setOrders(initial);
  }

  const [trackingDrafts, setTrackingDrafts] = React.useState<Record<string, string>>({});
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = React.useState<Status>("PROCESSING");
  const [bulkBusy, setBulkBusy] = React.useState(false);

  function setUrlParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

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

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === orders.length ? new Set() : new Set(orders.map((o) => o.id))));
  }

  async function bulkUpdateStatus() {
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], status: bulkStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Updated ${data.count} order${data.count === 1 ? "" : "s"}.`);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk update failed.");
    } finally {
      setBulkBusy(false);
    }
  }

  const exportHref = `/api/admin/orders/export?${searchParams.toString()}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Orders</h2>
        <Button asChild size="sm" variant="outline">
          <a href={exportHref} download>
            <DownloadIcon /> Export CSV
          </a>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchBar placeholder="Search customer, email…" />
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(v) => setUrlParam("status", v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="h-9 w-36"
          defaultValue={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => setUrlParam("dateFrom", e.target.value)}
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          className="h-9 w-36"
          defaultValue={searchParams.get("dateTo") ?? ""}
          onChange={(e) => setUrlParam("dateTo", e.target.value)}
        />
      </div>

      <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as Status)}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" disabled={bulkBusy} onClick={bulkUpdateStatus}>
          Update status
        </Button>
      </BulkActionBar>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={orders.length > 0 && selected.size === orders.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking #</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} data-state={selected.has(o.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox checked={selected.has(o.id)} onCheckedChange={() => toggleSelected(o.id)} />
                </TableCell>
                <TableCell>
                  <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")} · {o.items.length} item
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
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {o.status === "PENDING_PAYMENT" && o.paymentProofUrl && (
                    <p className="mt-1 text-xs font-medium text-primary">Screenshot to review</p>
                  )}
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
                <TableCell>
                  <OrderDetailSheet
                    orderId={o.id}
                    trigger={
                      <button className="text-muted-foreground hover:text-foreground" aria-label="View order">
                        <EyeIcon className="size-4" />
                      </button>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No orders match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminPagination {...meta} />
      </div>
    </div>
  );
}
