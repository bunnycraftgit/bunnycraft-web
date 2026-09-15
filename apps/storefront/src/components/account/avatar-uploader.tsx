"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { CameraIcon, LoaderCircleIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export function AvatarUploader({
  image,
  name,
  onChange,
}: {
  image: string | null;
  name: string;
  onChange: (image: string | null) => void;
}) {
  const [uploading, setUploading] = React.useState(false);

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
        onChange(data.url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't upload that image.");
      } finally {
        setUploading(false);
      }
    },
    onDropRejected: (rejections) => {
      toast.error(rejections[0]?.errors[0]?.message ?? "That file couldn't be uploaded.");
    },
  });

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div {...getRootProps()} className="group relative cursor-pointer">
        <input {...getInputProps()} />
        <Avatar className="size-16 rounded-full border border-border">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className="rounded-full text-base">{initials || "?"}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <LoaderCircleIcon className="size-5 animate-spin text-white" />
          ) : (
            <CameraIcon className="size-5 text-white" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Profile photo</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">Click the photo to change it.</span>
          {image && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 text-destructive hover:underline"
            >
              <XIcon className="size-3" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
