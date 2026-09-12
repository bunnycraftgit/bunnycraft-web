import type { Metadata } from "next";
import Link from "next/link";
import { BoxesIcon, ClockIcon, DollarSignIcon, PackageIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [productCount, filamentCount, pendingOrders, orders] = await Promise.all([
    prisma.product.count(),
    prisma.filament.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.findMany({ select: { total: true }, take: 500 }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Total Revenue", value: formatCurrency(revenue), icon: DollarSignIcon },
    { label: "Orders Awaiting Payment", value: String(pendingOrders), icon: ClockIcon },
    { label: "Products", value: String(productCount), icon: PackageIcon },
    { label: "Filaments", value: String(filamentCount), icon: BoxesIcon },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-3 flex size-9 items-center justify-center rounded-none bg-primary/10 text-primary">
              <s.icon className="size-4" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/orders"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Manage Orders</p>
          <p className="mt-1 text-sm text-muted-foreground">Update status and tracking numbers.</p>
        </Link>
        <Link
          href="/admin/filaments"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Manage Filaments</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pricing, stock, and colors used by the customize wizard.
          </p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Pricing Settings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Machine rate, print speed, and finishing cost assumptions.
          </p>
        </Link>
      </div>
    </div>
  );
}
