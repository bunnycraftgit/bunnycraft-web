/**
 * Payment integration seam.
 *
 * No payment provider is wired up yet — orders are created directly with
 * status PENDING_PAYMENT and no charge occurs. When real payments are added
 * (e.g. Stripe), this is where `stripe.paymentIntents.create()` belongs:
 * the order route would call it after computing the authoritative total and
 * before creating the Order row, then store the returned client secret /
 * intent id on the order for the client to confirm.
 */
export type PaymentIntentStub = {
  id: string;
  status: "stubbed_no_charge";
};

export async function createPaymentIntentStub(amount: number): Promise<PaymentIntentStub> {
  void amount;
  return { id: `stub_${crypto.randomUUID()}`, status: "stubbed_no_charge" };
}
