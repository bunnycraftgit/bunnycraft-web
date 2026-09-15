"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon, ShoppingBagIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
  return `${line.filamentName}${line.colorName ? ` · ${line.colorName}` : ""} · ${line.heightMm}×${line.widthMm}×${line.depthMm}mm`;
}

function lineImage(line: CartLine) {
  return line.kind === "product" ? line.image : line.previewImage;
}

export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const subtotal = lines.reduce((sum, l) => sum + cartLineTotal(l), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBagIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button asChild size="sm" onClick={() => onOpenChange(false)}>
              <Link href="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="-mx-6 flex-1 overflow-y-auto px-6">
              <ul className="flex flex-col gap-4">
                {lines.map((line) => {
                  const image = lineImage(line);
                  return (
                    <li key={line.id} className="flex gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {image ? (
                          <Image
                            src={image}
                            alt={lineTitle(line)}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-medium">{lineTitle(line)}</p>
                          <button
                            onClick={() => removeLine(line.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                            aria-label="Remove item"
                          >
                            <XIcon className="size-4" />
                          </button>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {lineSubtitle(line)}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-none border border-border">
                            <button
                              className={cn(
                                "flex size-6 items-center justify-center rounded-none hover:bg-muted"
                              )}
                              onClick={() => setQuantity(line.id, line.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <MinusIcon className="size-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-medium">
                              {line.quantity}
                            </span>
                            <button
                              className="flex size-6 items-center justify-center rounded-none hover:bg-muted"
                              onClick={() => setQuantity(line.id, line.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <PlusIcon className="size-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatCurrency(cartLineTotal(line))}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <SheetFooter className="gap-3">
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-heading text-lg font-semibold">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and discounts calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" onClick={() => onOpenChange(false)}>
                  <Link href="/bunnycraft-cart">View Cart</Link>
                </Button>
                <Button asChild onClick={() => onOpenChange(false)}>
                  <Link href="/bunnycraft-checkout">Checkout</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
