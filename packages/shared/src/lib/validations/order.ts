import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  line1: z.string().min(1, "Address is required."),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  zip: z.string().min(3, "ZIP / postal code is required."),
  country: z.string().min(1, "Country is required."),
  phone: z.string().optional(),
});

export const orderItemSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("PRODUCT"),
    productId: z.string().min(1),
    quantity: z.number().int().positive().max(99),
  }),
  z.object({
    kind: z.literal("CUSTOM"),
    filamentId: z.string().min(1),
    colorName: z.string().min(1),
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    fileUrl: z.string().min(1),
    heightMm: z.number().positive().max(1000),
    widthMm: z.number().positive().max(1000),
    depthMm: z.number().positive().max(1000),
    quantity: z.number().int().positive().max(99),
  }),
]);

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  couponCode: z.string().nullable().optional(),
  guestEmail: z.string().email().optional(),
  shipping: shippingAddressSchema,
  saveAddress: z.boolean().optional(),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(4, "Enter your order number.").max(64),
  email: z.string().email("Enter the email used at checkout."),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
