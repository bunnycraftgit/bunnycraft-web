"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, LoaderCircleIcon, PlusIcon, StarIcon, TrashIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  photoUrl: string | null;
  createdAt: string;
  product: { name: string; slug: string };
};
type Meta = { page: number; pageCount: number; total: number; pageSize: number };
type ProductOption = { id: string; name: string };

const EMPTY_FORM = {
  productId: "",
  authorName: "",
  rating: 5,
  comment: "",
  photoUrl: null as string | null,
};

export function ReviewsManager({
  initial,
  products,
  meta,
}: {
  initial: Review[];
  products: ProductOption[];
  meta: Meta;
}) {
  const router = useRouter();
  const [reviews, setReviews] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setReviews(initial);
  }

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  function openAdd() {
    setForm({ ...EMPTY_FORM, productId: products[0]?.id ?? "" });
    setOpen(true);
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't upload that photo.");
      setForm((prev) => ({ ...prev, photoUrl: data.url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Review added.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add that review.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete that review.");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review deleted.");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Product Reviews</h2>
        <Button size="sm" onClick={openAdd} disabled={products.length === 0}>
          <PlusIcon /> Add review
        </Button>
      </div>
      <div className="mb-4">
        <AdminSearchBar placeholder="Search author or product…" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/shop/${r.product.slug}`} className="font-medium hover:underline">
                    {r.product.name}
                  </Link>
                </TableCell>
                <TableCell>{r.authorName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className="size-3.5"
                        fill={i < r.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {r.comment}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No reviews match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminPagination {...meta} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add review</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-author">Customer name</Label>
              <Input
                id="r-author"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Rahul Verma"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Rating</Label>
              <div className="flex gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  >
                    <StarIcon className="size-6" fill={n <= form.rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-comment">Review</Label>
              <Textarea
                id="r-comment"
                rows={5}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="What did the customer say about this product?"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Photo (optional)</Label>
              <div className="flex items-center gap-3">
                {form.photoUrl && (
                  <div className="relative size-16 overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.photoUrl} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photoUrl: null })}
                      aria-label="Remove photo"
                      className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  {uploading ? <LoaderCircleIcon className="animate-spin" /> : <ImageIcon />}
                  {form.photoUrl ? "Change photo" : "Upload photo"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={save}
              disabled={
                saving || uploading || !form.productId || !form.authorName.trim() || !form.comment.trim()
              }
            >
              {saving && <LoaderCircleIcon className="animate-spin" />}
              Add review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
