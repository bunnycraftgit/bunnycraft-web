// Plain constants (no Sequelize import) so client-side code can use them too.

export const ROLES = ["CUSTOMER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PRODUCT_STATUSES = ["LIVE", "SOLD_OUT", "COMING_SOON"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const DISCOUNT_TYPES = ["PERCENT", "FIXED"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const STRENGTH_RATINGS = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;
export type StrengthRating = (typeof STRENGTH_RATINGS)[number];

export const ORDER_ITEM_KINDS = ["PRODUCT", "CUSTOM"] as const;
export type OrderItemKind = (typeof ORDER_ITEM_KINDS)[number];
