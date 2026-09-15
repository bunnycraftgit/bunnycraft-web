import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Dimensions" },
  { id: 3, label: "Material" },
  { id: 4, label: "Price & Review" },
];

export function WizardStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((step, i) => (
        <li key={step.id} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-none border text-sm font-semibold transition-colors",
                step.id < current && "border-primary bg-primary text-primary-foreground",
                step.id === current && "border-primary text-primary",
                step.id > current && "border-border text-muted-foreground"
              )}
            >
              {step.id < current ? <CheckIcon className="size-4" /> : step.id}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                step.id <= current ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px flex-1 transition-colors",
                step.id < current ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
