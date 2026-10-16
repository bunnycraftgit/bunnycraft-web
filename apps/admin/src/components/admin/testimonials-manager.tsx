"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  UploadCloudIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

type Testimonial = {
  id: string;
  name: string;
  place: string | null;
  photoUrl: string | null;
  rating: number;
  comment: string;
  published: boolean;
};

type FormState = Omit<Testimonial, "id">;

const EMPTY_FORM: FormState = {
  name: "",
  place: "",
  photoUrl: null,
  rating: 5,
  comment: "",
  published: true,
};

function Avatar({ url, name, className }: { url: string | null; name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted",
        className
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="size-full object-cover" />
      ) : (
        <UserIcon className="size-1/2 text-muted-foreground" />
      )}
    </div>
  );
}

export function TestimonialsManager({ initial }: { initial: Testimonial[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setTestimonials(initial);
  }

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Testimonial | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({ ...t, place: t.place ?? "" });
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
      const res = await fetch(
        editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Testimonial saved.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that testimonial.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) {
      toast.error("Couldn't delete that testimonial.");
      return;
    }
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    toast.success("Testimonial deleted.");
    router.refresh();
  }

  async function togglePublished(t: Testimonial) {
    setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, published: !x.published } : x)));
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !t.published }),
    }).catch(() => null);
    if (!res?.ok) toast.error("Couldn't update that testimonial.");
  }

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Testimonials</h2>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon /> Add testimonial
        </Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Published testimonials are shown in the &ldquo;What Customers Are Saying&rdquo; section on
        the homepage. Reviews customers submit on the website arrive here as{" "}
        <span className="font-medium text-foreground">Pending</span> — switch on
        &ldquo;Published&rdquo; to approve them.
      </p>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Published</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar url={t.photoUrl} name={t.name} className="size-9" />
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        {t.name}
                        {!t.published && <Badge variant="accent">Pending</Badge>}
                      </p>
                      {t.place && <p className="text-xs text-muted-foreground">{t.place}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-sm">
                  <p className="line-clamp-2 text-sm whitespace-normal text-muted-foreground">
                    {t.comment}
                  </p>
                </TableCell>
                <TableCell>{t.rating} ★</TableCell>
                <TableCell>
                  <Switch checked={t.published} onCheckedChange={() => togglePublished(t)} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Edit"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {testimonials.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No testimonials yet — add your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit testimonial" : "Add testimonial"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar url={form.photoUrl} name={form.name} className="size-20" />
                {form.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, photoUrl: null })}
                    aria-label="Remove photo"
                    className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <XIcon className="size-3" />
                  </button>
                )}
              </div>
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
                {uploading ? <LoaderCircleIcon className="animate-spin" /> : <UploadCloudIcon />}
                {form.photoUrl ? "Change photo" : "Upload profile photo"}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-name">Name</Label>
                <Input
                  id="t-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Priya Sharma"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-place">Place</Label>
                <Input
                  id="t-place"
                  value={form.place ?? ""}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  placeholder="Jaipur, Rajasthan"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  >
                    <StarIcon
                      className={cn(
                        "size-6",
                        n <= form.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-comment">Review</Label>
              <Textarea
                id="t-comment"
                rows={5}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="What did the customer say?"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm">
              <Switch
                checked={form.published}
                onCheckedChange={(c) => setForm({ ...form, published: c })}
              />
              Show on homepage
            </label>
          </div>

          <DialogFooter>
            <Button
              onClick={save}
              disabled={saving || uploading || !form.name.trim() || !form.comment.trim()}
            >
              {saving && <LoaderCircleIcon className="animate-spin" />}
              Save testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
