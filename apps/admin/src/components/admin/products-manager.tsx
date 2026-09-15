"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CopyIcon, LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { formatCurrency } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;

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
type Meta = { page: number; pageCount: number; total: number; pageSize: number };

function emptyForm(categoryId: string) {
  return {
    name: "",
    slug: "",
    description: "",
    price: 19.99,
    compareAtPrice: null as number | null,
    images: [] as string[],
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
  meta,
}: {
  initial: Product[];
  categories: Category[];
  meta: Meta;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setProducts(initial);
  }

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState(emptyForm(categories[0]?.id ?? ""));
  const [saving, setSaving] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = React.useState(categories[0]?.id ?? "");
  const [bulkBusy, setBulkBusy] = React.useState(false);

  function setUrlParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

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
      images: p.images,
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
      toast.success("Product saved.");
      setOpen(false);
      router.refresh();
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
    router.refresh();
  }

  async function duplicate(p: Product) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${p.name} (Copy)`,
        slug: `${p.slug}-copy-${suffix}`,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        material: p.material ?? undefined,
        tags: p.tags,
        stock: p.stock,
        featured: false,
        categoryId: p.categoryId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Couldn't duplicate that product.");
      return;
    }
    toast.success("Product duplicated.");
    router.refresh();
  }

  async function toggleFeatured(p: Product) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)));
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !p.featured }),
    }).catch(() => toast.error("Couldn't update that product."));
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
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))));
  }

  async function bulkAction(action: "feature" | "unfeature" | "delete" | "setCategory") {
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: [...selected],
          action,
          ...(action === "setCategory" ? { categoryId: bulkCategory } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Updated ${data.count} product${data.count === 1 ? "" : "s"}.`);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk action failed.");
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Products</h2>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon /> Add product
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchBar placeholder="Search products…" />
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(v) => setUrlParam("category", v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(v) => setUrlParam("sort", v)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="stock-asc">Stock: low to high</SelectItem>
            <SelectItem value="name-asc">Name: A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
        <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkAction("feature")}>
          Feature
        </Button>
        <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkAction("unfeature")}>
          Unfeature
        </Button>
        <Select value={bulkCategory} onValueChange={setBulkCategory}>
          <SelectTrigger size="sm" className="w-40">
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
        <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkAction("setCategory")}>
          Move to category
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={bulkBusy}
          className="text-destructive hover:text-destructive"
          onClick={() => bulkAction("delete")}
        >
          Delete
        </Button>
      </BulkActionBar>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={products.length > 0 && selected.size === products.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
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
              <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelected(p.id)} />
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category?.name}</TableCell>
                <TableCell>{formatCurrency(p.price)}</TableCell>
                <TableCell>
                  <span className={p.stock <= LOW_STOCK_THRESHOLD ? "font-medium text-destructive" : ""}>
                    {p.stock}
                  </span>
                  {p.stock <= LOW_STOCK_THRESHOLD && (
                    <Badge variant="destructive" className="ml-2">
                      Low stock
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Switch checked={p.featured} onCheckedChange={() => toggleFeatured(p)} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => duplicate(p)} className="text-muted-foreground hover:text-foreground" aria-label="Duplicate">
                      <CopyIcon className="size-4" />
                    </button>
                    <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground" aria-label="Edit">
                      <PencilIcon className="size-4" />
                    </button>
                    <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No products match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminPagination {...meta} />
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
              <Label>Images</Label>
              <ProductImageUploader
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
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
            <Button onClick={save} disabled={saving || form.images.length === 0}>
              {saving && <LoaderCircleIcon className="animate-spin" />}
              Save product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
