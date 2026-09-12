"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

let wishlistIds: Set<string> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
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
  const [, forceRender] = React.useReducer((c) => c + 1, 0);

  React.useEffect(() => {
    const listener = () => forceRender();
    listeners.add(listener);
    if (status === "authenticated" && wishlistIds === null) {
      loadWishlist();
    }
    return () => {
      listeners.delete(listener);
    };
  }, [status]);

  const isWishlisted = wishlistIds?.has(productId) ?? false;

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
