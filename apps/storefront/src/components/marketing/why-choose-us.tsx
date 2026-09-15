import {
  CreditCardIcon,
  PackageCheckIcon,
  PaletteIcon,
  ShieldCheckIcon,
  TargetIcon,
  TruckIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: TargetIcon,
    title: "Precision 3D Printing",
    description: "Fine layer heights and calibrated machines for crisp, accurate detail every print.",
  },
  {
    icon: PaletteIcon,
    title: "Premium Filaments",
    description: "Eight curated materials, from everyday PLA to reinforced carbon fiber blends.",
  },
  {
    icon: PackageCheckIcon,
    title: "Fast Turnaround",
    description: "Most orders leave the print farm within 2-3 business days of confirmation.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Custom Designs",
    description: "Upload your own STL, OBJ, or 3MF file and get a quote in seconds.",
  },
  {
    icon: CreditCardIcon,
    title: "Secure Payments",
    description: "Checkout is encrypted end-to-end so your details stay protected.",
  },
  {
    icon: TruckIcon,
    title: "Nationwide Shipping",
    description: "Tracked shipping to every state, with real-time order status updates.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-muted/40 py-20">
      <div className="container-page">
        <div className="mb-12 max-w-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">Why Choose BunnyCraft</h2>
          <p className="mt-2 text-muted-foreground">
            A print shop built around clarity — you know your price, your material, and your
            timeline before you ever click order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-heading font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
