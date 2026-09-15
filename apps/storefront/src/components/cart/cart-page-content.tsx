"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { LoaderCircleIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TagIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  cartLineTotal,
  useCartStore,
  type CartLine,
} from "@/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";

function lineTitle(line: CartLine) {
  return line.kind === "product" ? line.name : `Custom print — ${line.fileName}`;
}

function lineSubtitle(line: CartLine) {
  if (line.kind === "product") return line.material;
  return `${line.filamentName}${line.colorName ? ` · ${line.colorName}` : ""} · ${line.heightMm}×${line.widthMm}×${line.depthMm}mm · ~${line.estWeightGrams}g`;
}

function lineImage(line: CartLine) {
  return line.kind === "product" ? line.image : line.previewImage;
}

type CouponState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "applied"; code: string; discountAmount: number }
  | { status: "error"; message: string };

export function CartPageContent() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const storedCoupon = useCartStore((s) => s.couponCode);
  const setCouponCode = useCartStore((s) => s.setCouponCode);

  const [couponInput, setCouponInput] = React.useState(storedCoupon ?? "");
  const [coupon, setCoupon] = React.useState<CouponState>({ status: "idle" });

  const subtotal = lines.reduce((sum, l) => sum + cartLineTotal(l), 0);
  const discount = coupon.status === "applied" ? coupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCoupon({ status: "loading" });
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCoupon({ status: "error", message: data.message ?? "Invalid coupon." });
        setCouponCode(null);
        return;
      }
      setCoupon({ status: "applied", code: data.code, discountAmount: data.discountAmount });
      setCouponCode(data.code);
      toast.success(`Coupon ${data.code} applied.`);
    } catch {
      setCoupon({ status: "error", message: "Couldn't validate that coupon. Try again." });
    }
  }

  function clearCoupon() {
    setCoupon({ status: "idle" });
    setCouponCode(null);
    setCouponInput("");
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingBagIcon className="size-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="max-w-sm text-muted-foreground">
          Browse the shop or start a custom print to add something to your cart.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/shop">Browse products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/customize">Customize a model</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Your Cart</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {lines.map((line) => {
            const image = lineImage(line);
            return (
              <div
                key={line.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {image ? (
                    <Image src={image} alt={lineTitle(line)} fill sizes="96px" className="object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={line.kind === "product" ? `/shop/${line.slug}` : "#"}
                        className="font-medium hover:text-primary"
                      >
                        {lineTitle(line)}
                      </Link>
                      <p className="text-sm text-muted-foreground">{lineSubtitle(line)}</p>
                    </div>
                    <button
                      onClick={() => removeLine(line.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-none border border-border">
                      <button
                        className="flex size-7 items-center justify-center rounded-none hover:bg-muted"
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        className="flex size-7 items-center justify-center rounded-none hover:bg-muted"
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="size-3.5" />
                      </button>
                    </div>
                    <span className="font-heading font-semibold">
                      {formatCurrency(cartLineTotal(line))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">Order Summary</h2>

          <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <TagIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="pl-10"
                disabled={coupon.status === "applied"}
              />
            </div>
            {coupon.status === "applied" ? (
              <Button type="button" variant="outline" onClick={clearCoupon}>
                Remove
              </Button>
            ) : (
              <Button type="submit" variant="outline" disabled={coupon.status === "loading"}>
                {coupon.status === "loading" && <LoaderCircleIcon className="animate-spin" />}
                Apply
              </Button>
            )}
          </form>
          {coupon.status === "error" && (
            <p className="mt-2 text-xs font-medium text-destructive">{coupon.message}</p>
          )}
          {coupon.status === "applied" && (
            <p className="mt-2 text-xs font-medium text-success">
              {coupon.code} applied — {formatCurrency(coupon.discountAmount)} off
            </p>
          )}

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>−{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className={cn("flex items-center justify-between")}>
            <span className="font-heading text-lg font-semibold">Total</span>
            <span className="font-heading text-xl font-bold">{formatCurrency(total)}</span>
          </div>

          <Button asChild size="lg" className="mt-5 w-full">
            <Link href="/bunnycraft-checkout">Proceed to Checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
