"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ImagePlusIcon, LoaderCircleIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/shop/star-rating-input";

const ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };

export function WriteReviewForm({
  productId,
  hasReviewed,
}: {
  productId: string;
  hasReviewed: boolean;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDropAccepted: async (files) => {
      const file = files[0];
      if (!file) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        setPhotoUrl(data.url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't upload that photo.");
      } finally {
        setUploading(false);
      }
    },
    onDropRejected: (rejections) => {
      toast.error(rejections[0]?.errors[0]?.message ?? "That file couldn't be uploaded.");
    },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Choose a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, photoUrl: photoUrl ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit your review.");
      toast.success("Thanks for your review!");
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status !== "authenticated") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>{" "}
        to leave a review.
      </div>
    );
  }

  if (hasReviewed || submitted) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        You&apos;ve already reviewed this product. Thanks for your feedback!
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <h3 className="font-heading font-semibold">Write a review</h3>
      <StarRatingInput value={rating} onChange={setRating} />
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product…"
        rows={3}
      />
      <div className="flex items-center gap-3">
        <div {...getRootProps()} className="cursor-pointer text-sm text-primary hover:underline">
          <input {...getInputProps()} />
          <span className="inline-flex items-center gap-1.5">
            {uploading ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <ImagePlusIcon className="size-4" />
            )}
            {photoUrl ? "Change photo" : "Add a photo (optional)"}
          </span>
        </div>
        {photoUrl && (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border">
            <Image src={photoUrl} alt="" fill sizes="48px" className="object-cover" />
            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Remove photo"
            >
              <XIcon className="size-2.5" />
            </button>
          </div>
        )}
      </div>
      <Button type="submit" disabled={submitting || uploading} className="w-fit">
        {submitting && <LoaderCircleIcon className="animate-spin" />}
        Submit review
      </Button>
    </form>
  );
}
