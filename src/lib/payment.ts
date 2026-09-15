import crypto from "crypto";

import { getRazorpayClient } from "@/lib/razorpay";

export type RazorpayOrderResult = {
  id: string;
  amount: number;
  currency: string;
};

// `amountInRupees` is the store's rupee amount (e.g. 499.00) — Razorpay
// expects the smallest currency unit (paise) on the wire.
export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string
): Promise<RazorpayOrderResult> {
  const order = await getRazorpayClient().orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
  });
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

// Recomputes the HMAC Razorpay's checkout script signs client-side and
// compares it to what the browser reported, so a tampered/forged success
// callback can't be used to mark an order paid.
export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  if (expected.length !== params.razorpaySignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.razorpaySignature));
}
