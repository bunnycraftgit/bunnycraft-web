"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cartLineTotal, useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validations/order";

const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING_RATE = 6.99;

type SavedAddress = ShippingAddressInput & { id: string; isDefault: boolean };

export function CheckoutContent() {
  const router = useRouter();
  const { status } = useSession();
  const lines = useCartStore((s) => s.lines);
  const couponCode = useCartStore((s) => s.couponCode);
  const clearCart = useCartStore((s) => s.clear);

  const [guestEmail, setGuestEmail] = React.useState("");
  const [saveAddress, setSaveAddress] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const subtotal = lines.reduce((sum, l) => sum + cartLineTotal(l), 0);

  const form = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
      phone: "",
    },
  });

  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((addresses: SavedAddress[]) => {
        const preferred = addresses[0];
        if (preferred) {
          form.reset({
            fullName: preferred.fullName,
            line1: preferred.line1,
            line2: preferred.line2 ?? "",
            city: preferred.city,
            state: preferred.state,
            zip: preferred.zip,
            country: preferred.country,
            phone: preferred.phone ?? "",
          });
        }
      })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const discount = 0; // discount amount was already reflected client-side in /cart; recomputed authoritatively server-side on submit

  const estimatedShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const estimatedTotal = subtotal - discount + estimatedShipping;

  async function onSubmit(shipping: ShippingAddressInput) {
    setError(null);
    if (status !== "authenticated" && !guestEmail.trim()) {
      setError("Enter an email address so we can send your order confirmation.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) =>
            l.kind === "product"
              ? { kind: "PRODUCT", productId: l.productId, quantity: l.quantity }
              : {
                  kind: "CUSTOM",
                  filamentId: l.filamentId,
                  colorName: l.colorName ?? "",
                  fileName: l.fileName,
                  fileType: l.fileType,
                  fileUrl: l.fileUrl ?? "",
                  heightMm: l.heightMm,
                  widthMm: l.widthMm,
                  depthMm: l.depthMm,
                  quantity: l.quantity,
                }
          ),
          couponCode,
          guestEmail: status === "authenticated" ? undefined : guestEmail.trim(),
          shipping,
          saveAddress: status === "authenticated" ? saveAddress : false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      clearCart();
      router.push(`/checkout/confirmation/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingBagIcon className="size-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button asChild>
          <Link href="/shop">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Checkout</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {status !== "authenticated" && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h2 className="mb-3 font-heading font-semibold">Contact</h2>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Have an account?{" "}
                    <Link href="/login?callbackUrl=/checkout" className="font-medium text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to check out faster.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h2 className="mb-4 font-heading font-semibold">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="line1"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="line2"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP / Postal code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {status === "authenticated" && (
                  <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={saveAddress}
                      onCheckedChange={(c) => setSaveAddress(c === true)}
                    />
                    Save this address to my account
                  </label>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
                Payment is simulated in this build — no card details are collected and no charge
                occurs. Your order will be created with a “Pending Payment” status.
              </div>

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}

              <Button type="submit" size="lg" disabled={submitting} className="lg:hidden">
                {submitting && <LoaderCircleIcon className="animate-spin" />}
                Place Order — {formatCurrency(estimatedTotal)}
              </Button>
            </form>
          </Form>
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {lines.map((l) => (
              <li key={l.id} className="flex justify-between text-sm">
                <span className="truncate pr-2 text-muted-foreground">
                  {l.kind === "product" ? l.name : `Custom print — ${l.fileName}`} × {l.quantity}
                </span>
                <span className="shrink-0 font-medium">{formatCurrency(cartLineTotal(l))}</span>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-success">
                <span>Coupon {couponCode}</span>
                <span>Applied at checkout</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{estimatedShipping === 0 ? "Free" : formatCurrency(estimatedShipping)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-semibold">Estimated Total</span>
            <span className="font-heading text-xl font-bold">{formatCurrency(estimatedTotal)}</span>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-5 hidden w-full lg:flex"
            disabled={submitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            {submitting && <LoaderCircleIcon className="animate-spin" />}
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}
