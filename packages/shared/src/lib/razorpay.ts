import Razorpay from "razorpay";

let client: Razorpay | null = null;

// Lazy so a missing key doesn't crash the app at import time — only routes
// that actually try to charge someone need to fail.
export function getRazorpayClient() {
  if (client) return client;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing).");
  }

  client = new Razorpay({ key_id, key_secret });
  return client;
}
