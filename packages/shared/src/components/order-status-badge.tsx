import { Badge } from "@/components/ui/badge";
import type { PlainOrder } from "@/lib/data/orders";

const STATUS_LABEL: Record<PlainOrder["status"], string> = {
  PENDING_PAYMENT: "Pending Payment",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_VARIANT: Record<PlainOrder["status"], "secondary" | "accent" | "success" | "destructive"> = {
  PENDING_PAYMENT: "accent",
  PROCESSING: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function OrderStatusBadge({ status }: { status: PlainOrder["status"] }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
