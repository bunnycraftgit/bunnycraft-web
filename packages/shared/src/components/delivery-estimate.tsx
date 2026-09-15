import { TruckIcon } from "lucide-react";

import {
  estimateDeliveryWindow,
  formatDeliveryWindow,
  type DeliveryEstimateItem,
} from "@/lib/delivery";

export function DeliveryEstimate({
  items,
  from,
  className,
}: {
  items: DeliveryEstimateItem[];
  from?: Date;
  className?: string;
}) {
  const window = estimateDeliveryWindow(items, from);

  return (
    <div className={`flex items-center gap-2 text-sm ${className ?? ""}`}>
      <TruckIcon className="size-4 shrink-0 text-primary" />
      <span className="text-muted-foreground">
        Estimated delivery: <span className="font-medium text-foreground">{formatDeliveryWindow(window)}</span>
      </span>
    </div>
  );
}
