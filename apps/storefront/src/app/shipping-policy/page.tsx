import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Shipping rates, timelines, and tracking information for BunnyCraft orders.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Shipping Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated July 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">
              Processing time
            </h2>
            <p>
              In-stock products ship within 1-2 business days. Custom prints go into our
              production queue immediately after ordering and typically leave our print farm
              within 2-3 business days, depending on print time and current order volume.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">Rates</h2>
            <p>
              Flat-rate shipping is ₹6.99 per order. Orders over ₹75 ship free. Exact carrier
              transit time depends on your location and is shown at checkout once available.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">
              Tracking
            </h2>
            <p>
              Once your order ships, a tracking number is attached to your order and visible from{" "}
              <span className="text-foreground">Account → Orders</span>. You&apos;ll be able to
              follow its status through delivery.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">
              Damaged or lost packages
            </h2>
            <p>
              If your order arrives damaged or doesn&apos;t arrive at all, contact us within 14
              days of the expected delivery date and we&apos;ll arrange a reprint or refund.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
