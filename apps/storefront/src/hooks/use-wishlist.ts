"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

let wishlistIds: Set<string> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function loadWishlist() {
  const res = await fetch("/api/wishlist");
  if (!res.ok) return;
  const data: { productId: string }[] = await res.json();
  wishlistIds = new Set(data.map((d) => d.productId));
  notify();
}

export function useWishlist(productId: string) {
  const { status } = useSession();

  // useSyncExternalStore only re-renders this instance when its own snapshot
  // (this product's membership) actually changes, unlike a manual
  // listener + forceRender which would re-render every card on the page
  // whenever any single product's wishlist status changed.
  const isWishlisted = React.useSyncExternalStore(
    subscribe,
    () => wishlistIds?.has(productId) ?? false,
    () => false
  );

  React.useEffect(() => {
    if (status === "authenticated" && wishlistIds === null) {
      loadWishlist();
    }
  }, [status]);

  const toggle = React.useCallback(async () => {
    if (status !== "authenticated") {
      toast.info("Sign in to save items to your wishlist.");
      return;
    }

    const nextWishlisted = !isWishlisted;
    wishlistIds ??= new Set();
    if (nextWishlisted) wishlistIds.add(productId);
    else wishlistIds.delete(productId);
    notify();

    try {
      const res = await fetch("/api/wishlist", {
        method: nextWishlisted ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      if (nextWishlisted) wishlistIds.delete(productId);
      else wishlistIds.add(productId);
      notify();
      toast.error("Couldn't update your wishlist. Please try again.");
    }
  }, [status, isWishlisted, productId]);

  return { isWishlisted, toggle };
}
