"use client";

import * as React from "react";
import { toast } from "sonner";
import { LoaderCircleIcon, QrCodeIcon, UploadCloudIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentSettingsValues } from "@/lib/data/payment";

export function PaymentSettingsForm({ initial }: { initial: PaymentSettingsValues }) {
  const [form, setForm] = React.useState(initial);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  async function uploadQr(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't upload the QR code.");
      setForm((prev) => ({ ...prev, qrImageUrl: data.url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Payment settings updated — checkout now shows this QR code.");
    } catch {
      toast.error("Couldn't save payment settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label>UPI QR code</Label>
        <div className="flex items-end gap-4">
          <div className="relative flex size-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
            {form.qrImageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.qrImageUrl} alt="Payment QR code" className="size-full object-contain p-2" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, qrImageUrl: null })}
                  aria-label="Remove QR code"
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <XIcon className="size-3" />
                </button>
              </>
            ) : (
              <QrCodeIcon className="size-10 text-neutral-400" />
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadQr(file);
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
            {form.qrImageUrl ? "Replace QR" : "Upload QR"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          The QR image from your UPI / bank app. Customers scan it after placing an order.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="upiId">UPI ID</Label>
          <Input
            id="upiId"
            value={form.upiId ?? ""}
            onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            placeholder="bunnycraft@okaxis"
          />
          <p className="text-xs text-muted-foreground">Shown under the QR for manual entry.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="payeeName">Payee name</Label>
          <Input
            id="payeeName"
            value={form.payeeName ?? ""}
            onChange={(e) => setForm({ ...form, payeeName: e.target.value })}
            placeholder="BunnyCraft"
          />
          <p className="text-xs text-muted-foreground">Name customers will see in their UPI app.</p>
        </div>
      </div>

      <Button type="submit" disabled={saving || uploading} className="w-fit">
        {saving && <LoaderCircleIcon className="animate-spin" />}
        Save payment settings
      </Button>
    </form>
  );
}
