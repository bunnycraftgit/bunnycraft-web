"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { formatCurrency } from "@/lib/utils";

type DiscountType = "PERCENT" | "FIXED";
type Coupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  minSubtotal: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
};
type Meta = { page: number; pageCount: number; total: number; pageSize: number };

const EMPTY = {
  code: "",
  discountType: "PERCENT" as DiscountType,
  value: 10,
  minSubtotal: null as number | null,
  usageLimit: null as number | null,
  active: true,
  expiresAt: null as string | null,
};

export function CouponsManager({ initial, meta }: { initial: Coupon[]; meta: Meta }) {
  const router = useRouter();
  const [coupons, setCoupons] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setCoupons(initial);
  }
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coupon | null>(null);
  const [form, setForm] = React.useState(EMPTY);
  const [saving, setSaving] = React.useState(false);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      value: c.value,
      minSubtotal: c.minSubtotal,
      usageLimit: c.usageLimit,
      active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : null,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupons((prev) => (editing ? prev.map((c) => (c.id === data.id ? data : c)) : [...prev, data]));
      toast.success("Coupon saved.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete that coupon.");
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Coupon deleted.");
    router.refresh();
  }

  async function toggleActive(c: Coupon) {
    setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    }).catch(() => toast.error("Couldn't update that coupon."));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Coupons</h2>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon /> Add coupon
        </Button>
      </div>

      <div className="mb-4">
        <AdminSearchBar placeholder="Search coupon codes…" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min. subtotal</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.code}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {c.discountType === "PERCENT" ? `${c.value}%` : formatCurrency(c.value)}
                  </Badge>
                </TableCell>
                <TableCell>{c.minSubtotal ? formatCurrency(c.minSubtotal) : "—"}</TableCell>
                <TableCell>
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </TableCell>
                <TableCell>
                  <Switch checked={c.active} onCheckedChange={() => toggleActive(c)} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground">
                      <PencilIcon className="size-4" />
                    </button>
                    <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive">
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminPagination {...meta} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit coupon" : "Add coupon"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) => setForm({ ...form, discountType: v as DiscountType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percent off</SelectItem>
                    <SelectItem value="FIXED">Fixed amount off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Min. subtotal ($, optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.minSubtotal ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, minSubtotal: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Usage limit (optional)</Label>
                <Input
                  type="number"
                  value={form.usageLimit ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Expires (optional)</Label>
                <Input
                  type="date"
                  value={form.expiresAt ?? ""}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value || null })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {saving && <LoaderCircleIcon className="animate-spin" />}
              Save coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
