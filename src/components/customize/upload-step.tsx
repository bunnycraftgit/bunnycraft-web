"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { ArrowRightIcon, FileBoxIcon, UploadCloudIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModelViewer, type ModelDimensions } from "@/components/customize/model-viewer";
import { cn } from "@/lib/utils";

const ACCEPT = {
  "model/stl": [".stl"],
  "model/obj": [".obj"],
  "model/3mf": [".3mf"],
  "application/octet-stream": [".stl", ".obj", ".3mf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadStep({
  file,
  onFileSelected,
  onDimensions,
  onNext,
}: {
  file: File | null;
  onFileSelected: (file: File | null) => void;
  onDimensions: (dimensions: ModelDimensions) => void;
  onNext: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropAccepted: (files) => {
      setError(null);
      onFileSelected(files[0] ?? null);
    },
    onDropRejected: (rejections) => {
      setError(rejections[0]?.errors[0]?.message ?? "That file couldn't be uploaded.");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">Upload your model</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          STL, OBJ, 3MF, JPG, or PNG — up to 50MB.
        </p>
      </div>

      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-20 text-center transition-colors",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex size-14 items-center justify-center rounded-none bg-primary/10 text-primary">
            <UploadCloudIcon className="size-6" />
          </div>
          <p className="font-medium">
            {isDragActive ? "Drop your file here" : "Drag & drop your file, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">STL · OBJ · 3MF · JPG · PNG</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ModelViewer file={file} onDimensions={onDimensions} />
          <div className="flex flex-col justify-between">
            <div className="flex items-start gap-3 rounded-xl border border-border p-4">
              <FileBoxIcon className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <button
                onClick={() => onFileSelected(null)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Remove file"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground sm:mt-0">
              Drag to orbit the preview. We&apos;ll use this file to estimate a starting size in
              the next step — you can always adjust it.
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button size="lg" onClick={onNext} disabled={!file}>
          Continue <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
