import { PaymentSettings } from "@bunnycraft/db";

export type PaymentSettingsValues = {
  qrImageUrl: string | null;
  upiId: string | null;
  payeeName: string | null;
};

const EMPTY_PAYMENT_SETTINGS: PaymentSettingsValues = {
  qrImageUrl: null,
  upiId: null,
  payeeName: null,
};

export async function getPaymentSettings(): Promise<PaymentSettingsValues> {
  try {
    const settings = await PaymentSettings.findByPk(1);
    if (!settings) return EMPTY_PAYMENT_SETTINGS;
    return {
      qrImageUrl: settings.qrImageUrl,
      upiId: settings.upiId,
      payeeName: settings.payeeName,
    };
  } catch (err) {
    console.warn(
      "[getPaymentSettings] payment settings unavailable —",
      err instanceof Error ? err.message : err
    );
    return EMPTY_PAYMENT_SETTINGS;
  }
}
