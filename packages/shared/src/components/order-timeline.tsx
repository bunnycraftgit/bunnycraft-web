import { CheckIcon, CreditCardIcon, PackageCheckIcon, TruckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlainOrder } from "@/lib/data/orders";

const STEPS = [
  { status: "PENDING_PAYMENT", label: "Order Placed", icon: CreditCardIcon },
  { status: "PROCESSING", label: "Processing", icon: PackageCheckIcon },
  { status: "SHIPPED", label: "Shipped", icon: TruckIcon },
  { status: "DELIVERED", label: "Delivered", icon: CheckIcon },
] as const;

export function OrderTimeline({ status }: { status: PlainOrder["status"] }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">
        <XIcon className="size-5" />
        <p className="text-sm font-medium">This order was cancelled.</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="flex items-start justify-between gap-2">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step.status} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "h-px flex-1",
                  i === 0 ? "opacity-0" : done ? "bg-primary" : "bg-border"
                )}
              />
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-none border",
                  done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                )}
              >
                <step.icon className="size-4" />
              </span>
              <div
                className={cn(
                  "h-px flex-1",
                  i === STEPS.length - 1
                    ? "opacity-0"
                    : i < currentIndex
                      ? "bg-primary"
                      : "bg-border"
                )}
              />
            </div>
            <span className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
