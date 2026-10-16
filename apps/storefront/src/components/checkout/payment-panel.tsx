"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClockIcon, ImageUpIcon, LoaderCircleIcon, QrCodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import type { PaymentSettingsValues } from "@/lib/data/payment";

type Props = {
  orderId: string;
  total: number;
  paymentProofUrl: string | null;
  settings: PaymentSettingsValues;
  // Set on the post-checkout page, where the cart still holds this order's items.
  clearCartOnSubmit?: boolean;
};

export function PaymentPanel({ orderId, total, paymentProofUrl, settings, clearCartOnSubmit }: Props) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clear);
  const [file, setFile] = React.useState<File | null>(null);
  const [reference, setReference] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [replacing, setReplacing] = React.useState(false);

  const orderNumber = orderId.slice(-8).toUpperCase();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Attach a screenshot of your payment.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (reference.trim()) body.append("reference", reference.trim());
      const res = await fetch(`/api/orders/${orderId}/payment-proof`, { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't upload your screenshot.");
      if (clearCartOnSubmit) clearCart();
      toast.success("Screenshot received — we'll confirm your payment shortly.");
      setReplacing(false);
      setFile(null);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't upload your screenshot.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (paymentProofUrl && !replacing) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        <ClockIcon className="size-6 text-primary" />
        <div>
          <h2 className="font-heading font-semibold">Payment under review</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ve received your payment screenshot. We&apos;ll verify it and start on your
            order shortly.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setReplacing(true)}>
          Upload a different screenshot
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
    >
      <div>
        <h2 className="font-heading text-lg font-semibold">Complete your payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan the QR code with any UPI app (GPay, PhonePe, Paytm…) and pay{" "}
          <span className="font-semibold text-foreground">{formatCurrency(total)}</span>. Add{" "}
          <span className="font-semibold text-foreground">#{orderNumber}</span> in the payment note
          if your app allows it.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-5">
        {settings.qrImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.qrImageUrl}
            alt="UPI payment QR code"
            className="size-56 rounded-lg bg-white object-contain p-2"
          />
        ) : (
          <div className="flex size-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
            <QrCodeIcon className="size-8" />
            QR code coming soon — contact us to pay.
          </div>
        )}
        {settings.payeeName && <p className="text-sm font-medium">{settings.payeeName}</p>}
        {settings.upiId && (
          <p className="text-sm text-muted-foreground">
            UPI ID: <span className="font-mono text-foreground select-all">{settings.upiId}</span>
          </p>
        )}
        <p className="font-heading text-2xl font-bold">{formatCurrency(total)}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="payment-proof">Payment screenshot</Label>
        <Input
          id="payment-proof"
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-muted-foreground">
          JPG or PNG showing the amount and transaction ID.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="payment-reference">UPI transaction ID (optional)</Label>
        <Input
          id="payment-reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. 4123 5678 9012"
          maxLength={64}
        />
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? <LoaderCircleIcon className="animate-spin" /> : <ImageUpIcon />}
          Submit payment screenshot
        </Button>
        {replacing && (
          <Button type="button" variant="ghost" onClick={() => setReplacing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
