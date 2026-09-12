import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Your Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const orders = await getOrdersForUser(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <p className="mt-1 text-muted-foreground">Track and review your past orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <PackageIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Button asChild size="sm">
            <Link href="/shop">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="font-heading font-semibold">{formatCurrency(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
