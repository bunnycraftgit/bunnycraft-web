import { z } from "zod";

export const filamentColorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #A1B2C3"),
});

export const filamentSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  colors: z.array(filamentColorSchema).min(1),
  pricePerGram: z.number().positive(),
  density: z.number().positive(),
  stockGrams: z.number().int().nonnegative(),
  strength: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
  finish: z.string().min(1),
  description: z.string().min(1),
  active: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  images: z.array(z.string().min(1)).min(1),
  material: z.string().optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative(),
  featured: z.boolean().optional(),
  categoryId: z.string().min(1),
});

export const couponSchema = z.object({
  code: z.string().min(3),
  discountType: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minSubtotal: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
});

export const pricingSettingsSchema = z.object({
  machineRatePerHour: z.number().positive(),
  printSpeedGramsPerHour: z.number().positive(),
  finishingCostFlat: z.number().nonnegative(),
  infillFactor: z.number().positive().max(1),
  shapeFactor: z.number().positive().max(1),
  minimumPrice: z.number().nonnegative(),
});

export const paymentSettingsSchema = z.object({
  qrImageUrl: z.string().min(1).nullable(),
  upiId: z.string().trim().max(100).nullable(),
  payeeName: z.string().trim().max(100).nullable(),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  trackingNumber: z.string().nullable().optional(),
  // Only ever cleared by an admin (rejecting a screenshot) — never set here.
  paymentProofUrl: z.null().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const userRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN"]),
});
