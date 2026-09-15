// Delivery estimates are a simple rule-based approximation (no live courier
// API) — production time from print hours, plus a flat shipping-transit
// range. Tune the constants below as real fulfillment data comes in.
const HOURS_PER_PRODUCTION_DAY = 8;
const PRODUCT_PREP_DAYS = 2;
const CUSTOM_QA_BUFFER_DAYS = 1;
const SHIPPING_TRANSIT_MIN_DAYS = 3;
const SHIPPING_TRANSIT_MAX_DAYS = 5;

export type DeliveryEstimateItem = {
  kind: "PRODUCT" | "CUSTOM";
  estPrintHours?: number | null;
};

export type DeliveryWindow = { from: Date; to: Date };

function productionDaysForItem(item: DeliveryEstimateItem): number {
  if (item.kind === "CUSTOM") {
    const printDays = Math.ceil(
      (item.estPrintHours ?? 0) / HOURS_PER_PRODUCTION_DAY,
    );
    return Math.max(PRODUCT_PREP_DAYS, printDays + CUSTOM_QA_BUFFER_DAYS);
  }
  return PRODUCT_PREP_DAYS;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function estimateDeliveryWindow(
  items: DeliveryEstimateItem[],
  from: Date = new Date(),
): DeliveryWindow {
  const maxProductionDays =
    items.length > 0
      ? Math.max(...items.map(productionDaysForItem))
      : PRODUCT_PREP_DAYS;

  return {
    from: addDays(from, maxProductionDays + SHIPPING_TRANSIT_MIN_DAYS),
    to: addDays(from, maxProductionDays + SHIPPING_TRANSIT_MAX_DAYS),
  };
}

export function formatDeliveryWindow(
  window: DeliveryWindow,
  locale = "en-IN",
): string {
  const sameYear = window.from.getFullYear() === window.to.getFullYear();
  const fromStr = window.from.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
  const toStr = window.to.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  return `${fromStr} – ${toStr}`;
}
