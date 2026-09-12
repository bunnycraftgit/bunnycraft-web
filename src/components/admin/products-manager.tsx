"use client";

import * as React from "react";
import { toast } from "sonner";
import { LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  material: string | null;
  tags: string[];
  stock: number;
  featured: boolean;
  categoryId: string;
  category: { name: string };
};

function emptyForm(categoryId: string) {
  return {
    name: "",
    slug: "",
    description: "",
    price: 19.99,
    compareAtPrice: null as number | null,
    images: "",
    material: "",
    tags: "",
    stock: 25,
    featured: false,
    categoryId,
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductsManager({
  initial,
  categories,
}: {
  initial: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState(emptyForm(categories[0]?.id ?? ""));
  const [saving, setSaving] = React.useState(false);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm(categories[0]?.id ?? ""));
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images.join("\n"),
      material: p.material ?? "",
      tags: p.tags.join(", "),
      stock: p.stock,
      featured: p.featured,
      categoryId: p.categoryId,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        material: form.material || undefined,
      };
      const res = await fetch(editing ? `/api/admin/products/${editing.id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const withCategory = { ...data, category: categories.find((c) => c.id === data.categoryId) };
      setProducts((prev) =>
        editing ? prev.map((p) => (p.id === data.id ? withCategory : p)) : [...prev, withCategory]
      );
      toast.success("Product saved.");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that product.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Couldn't delete that product.");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product deleted.");
  }

  async function toggleFeatured(p: Product) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)));
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !p.featured }),
    }).catch(() => toast.error("Couldn't update that product."));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Products</h2>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon /> Add product
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category?.name}</TableCell>
                <TableCell>{formatCurrency(p.price)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <Switch checked={p.featured} onCheckedChange={() => toggleFeatured(p)} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground">
                      <PencilIcon className="size-4" />
                    </button>
                    <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
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
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  placeholder={slugify(form.name) || "auto-generated-from-name"}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Compare-at price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.compareAtPrice ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, compareAtPrice: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Image URLs (one per line)</Label>
              <Textarea
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Material (optional)</Label>
                <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm">
              <Switch
                checked={form.featured}
                onCheckedChange={(c) => setForm({ ...form, featured: c })}
              />
              Featured on homepage
            </label>
          </div>

          <DialogFooter>
            <Button onClick={save} disabled={saving}>
              {saving && <LoaderCircleIcon className="animate-spin" />}
              Save product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
