"use client";

import * as React from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { LoaderCircleIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export function ProductImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = React.useState(false);

  async function uploadFiles(files: File[]) {
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Couldn't upload ${file.name}.`);
        uploaded.push(data.url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: 10 * 1024 * 1024,
    onDropAccepted: uploadFiles,
    onDropRejected: (rejections) => {
      toast.error(rejections[0]?.errors[0]?.message ?? "That file couldn't be uploaded.");
    },
  });

  function remove(url: string) {
    onChange(images.filter((i) => i !== url));
  }

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                aria-label="Remove image"
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors",
          isDragActive && "border-primary bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <LoaderCircleIcon className="size-5 animate-spin text-primary" />
        ) : (
          <UploadCloudIcon className="size-5 text-muted-foreground" />
        )}
        <p className="text-xs text-muted-foreground">
          {isDragActive ? "Drop images here" : "Drag & drop images, or click to browse (JPG/PNG, max 10MB)"}
        </p>
      </div>
    </div>
  );
}
