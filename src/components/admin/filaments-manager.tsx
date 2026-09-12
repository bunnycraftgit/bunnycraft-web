"use client";

import * as React from "react";
import { toast } from "sonner";
import { LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { formatCurrency } from "@/lib/utils";

type Strength = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
type FilamentColor = { name: string; hex: string };
type Filament = {
  id: string;
  name: string;
  type: string;
  colors: FilamentColor[];
  pricePerGram: number;
  density: number;
  stockGrams: number;
  strength: Strength;
  finish: string;
  description: string;
  active: boolean;
};

const EMPTY = {
  name: "",
  type: "",
  colors: [{ name: "", hex: "#888888" }] as FilamentColor[],
  pricePerGram: 0.05,
  density: 1.24,
  stockGrams: 1000,
  strength: "MEDIUM" as Strength,
  finish: "",
  description: "",
  active: true,
};

export function FilamentsManager({ initial }: { initial: Filament[] }) {
  const [filaments, setFilaments] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Filament | null>(null);
  const [form, setForm] = React.useState(EMPTY);
  const [saving, setSaving] = React.useState(false);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(f: Filament) {
    setEditing(f);
    setForm({ ...f, colors: f.colors.length ? f.colors : EMPTY.colors });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form, colors: form.colors.filter((c) => c.name && c.hex) };
      const res = await fetch(editing ? `/api/admin/filaments/${editing.id}` : "/api/admin/filaments", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFilaments((prev) =>
        editing ? prev.map((f) => (f.id === data.id ? data : f)) : [...prev, data]
      );
      toast.success("Filament saved.");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that filament.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/filaments/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Couldn't delete that filament.");
      return;
    }
    setFilaments((prev) => prev.filter((f) => f.id !== id));
    toast.success("Filament deleted.");
  }

  async function toggleActive(f: Filament) {
    setFilaments((prev) => prev.map((x) => (x.id === f.id ? { ...x, active: !x.active } : x)));
    await fetch(`/api/admin/filaments/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !f.active }),
    }).catch(() => toast.error("Couldn't update that filament."));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Filaments</h2>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon /> Add filament
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price/g</TableHead>
              <TableHead>Density</TableHead>
              <TableHead>Stock (g)</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filaments.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell>{formatCurrency(f.pricePerGram)}</TableCell>
                <TableCell>{f.density} g/cm³</TableCell>
                <TableCell>{f.stockGrams}</TableCell>
                <TableCell>
                  <Badge variant="outline">{f.strength.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Switch checked={f.active} onCheckedChange={() => toggleActive(f)} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(f)} className="text-muted-foreground hover:text-foreground">
                      <PencilIcon className="size-4" />
                    </button>
                    <button onClick={() => remove(f.id)} className="text-muted-foreground hover:text-destructive">
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit filament" : "Add filament"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Price per gram ($)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={form.pricePerGram}
                  onChange={(e) => setForm({ ...form, pricePerGram: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Density (g/cm³)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.density}
                  onChange={(e) => setForm({ ...form, density: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Stock (g)</Label>
                <Input
                  type="number"
                  value={form.stockGrams}
                  onChange={(e) => setForm({ ...form, stockGrams: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Strength</Label>
                <Select
                  value={form.strength}
                  onValueChange={(v) => setForm({ ...form, strength: v as Strength })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Light Duty</SelectItem>
                    <SelectItem value="MEDIUM">Standard</SelectItem>
                    <SelectItem value="HIGH">Heavy Duty</SelectItem>
                    <SelectItem value="VERY_HIGH">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Finish</Label>
              <Input value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Colors</Label>
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => {
                      const colors = [...form.colors];
                      colors[i] = { ...colors[i], hex: e.target.value };
                      setForm({ ...form, colors });
                    }}
                    className="size-9 shrink-0 rounded-lg border border-border"
                  />
                  <Input
                    placeholder="Color name"
                    value={c.name}
                    onChange={(e) => {
                      const colors = [...form.colors];
                      colors[i] = { ...colors[i], name: e.target.value };
                      setForm({ ...form, colors });
                    }}
                  />
                  <button
                    onClick={() => setForm({ ...form, colors: form.colors.filter((_, j) => j !== i) })}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setForm({ ...form, colors: [...form.colors, { name: "", hex: "#888888" }] })}
              >
                <PlusIcon /> Add color
              </Button>
            </div>

            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
              Active (visible in customize wizard)
            </label>
          </div>

          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {saving && <LoaderCircleIcon className="animate-spin" />}
              Save filament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
