export type ProductStatus = "LIVE" | "SOLD_OUT" | "COMING_SOON";

export const PRODUCT_STATUSES: ProductStatus[] = ["LIVE", "SOLD_OUT", "COMING_SOON"];

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  LIVE: "Live",
  SOLD_OUT: "Sold Out",
  COMING_SOON: "Coming Soon",
};

// Only LIVE products can be added to the cart or ordered.
export function isPurchasable(status: ProductStatus) {
  return status === "LIVE";
}
