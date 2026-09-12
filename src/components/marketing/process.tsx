import { CreditCardIcon, PackageIcon, SlidersHorizontalIcon, TruckIcon, UploadCloudIcon } from "lucide-react";

const STEPS = [
  { icon: UploadCloudIcon, title: "Upload Model", description: "Drop in an STL, OBJ, 3MF, or reference image." },
  { icon: SlidersHorizontalIcon, title: "Choose Material", description: "Pick from 8 filaments and see pricing update live." },
  { icon: CreditCardIcon, title: "Instant Quote", description: "Get an itemized price the moment you finish configuring." },
  { icon: PackageIcon, title: "We Print", description: "Your model goes into our queue and prints to spec." },
  { icon: TruckIcon, title: "Fast Delivery", description: "Tracked shipping straight to your door." },
];

export function Process() {
  return (
    <section className="container-page py-20">
      <div className="mb-14 max-w-xl">
        <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
        <p className="mt-2 text-muted-foreground">
          From upload to unboxing in five straightforward steps.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div className="absolute top-6 right-0 left-0 hidden h-px bg-border lg:block" />
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative flex flex-col items-start gap-3">
            <div className="relative z-10 flex size-12 items-center justify-center rounded-none border border-border bg-card text-primary shadow-soft">
              <step.icon className="size-5" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
            <h3 className="font-heading font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
