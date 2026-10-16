"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2Icon, LoaderCircleIcon, PencilLineIcon, UploadCloudIcon, UserIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StarRatingInput } from "@/components/shop/star-rating-input";

const EMPTY_FORM = { name: "", place: "", rating: 5, comment: "", website: "" };

export function ShareReviewDialog() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && submitted) {
      setForm(EMPTY_FORM);
      setPhotoUrl(null);
      setSubmitted(false);
    }
  }

  async function uploadPhoto(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo is too large (max 5MB).");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't upload that photo.");
      setPhotoUrl(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          place: form.place.trim() || undefined,
          photoUrl: photoUrl ?? undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't send your review.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PencilLineIcon /> Share your experience
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2Icon className="size-10 text-success" />
            <DialogTitle>Thank you!</DialogTitle>
            <DialogDescription>
              We&apos;ve received your review. It&apos;ll appear on the site once our team has
              checked it.
            </DialogDescription>
            <Button className="mt-2" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Share your experience</DialogTitle>
              <DialogDescription>
                Tell others what you thought of your BunnyCraft order.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="Your photo" className="size-full object-cover" />
                    ) : (
                      <UserIcon className="size-7 text-muted-foreground" />
                    )}
                  </div>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
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
                  {photoUrl ? "Change photo" : "Add your photo (optional)"}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sr-name">Your name</Label>
                  <Input
                    id="sr-name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sr-place">City (optional)</Label>
                  <Input
                    id="sr-place"
                    maxLength={100}
                    value={form.place}
                    onChange={(e) => setForm({ ...form, place: e.target.value })}
                    placeholder="e.g. Pune, Maharashtra"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Rating</Label>
                <StarRatingInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sr-comment">Your review</Label>
                <Textarea
                  id="sr-comment"
                  required
                  rows={5}
                  minLength={10}
                  maxLength={1000}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
              </div>

              {/* Honeypot: hidden from people, bots tend to fill it in. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}

              <Button type="submit" disabled={submitting || uploading}>
                {submitting && <LoaderCircleIcon className="animate-spin" />}
                Submit review
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
