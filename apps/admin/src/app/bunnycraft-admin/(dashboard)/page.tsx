import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangleIcon,
  BoxesIcon,
  ClockIcon,
  IndianRupeeIcon,
  MailIcon,
  PackageIcon,
  ShoppingBagIcon,
  StarIcon,
} from "lucide-react";

import { TrendChart } from "@/components/admin/trend-chart";
import { prisma } from "@bunnycraft/db";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard" };

const LOW_STOCK_THRESHOLD = 5;
const TREND_DAYS = 30;

function last30Days() {
  const days: string[] = [];
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function AdminDashboardPage() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (TREND_DAYS - 1));

  const [
    productCount,
    filamentCount,
    pendingOrders,
    allOrderTotals,
    recentOrdersForTrend,
    recentItemsForTop,
    lowStockProducts,
    recentOrdersForFeed,
    recentReviews,
    recentMessages,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.filament.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.order.findMany({ select: { total: true }, take: 2000 }),
    prisma.order.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { createdAt: true, total: true },
    }),
    prisma.orderItem.findMany({
      where: { kind: "PRODUCT", order: { createdAt: { gte: cutoff } } },
      select: { name: true, quantity: true, unitPrice: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, name: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, total: true, createdAt: true },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: { select: { name: true } } },
    }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const revenue = allOrderTotals.reduce((sum, o) => sum + Number(o.total), 0);

  const days = last30Days();
  const revenueByDay = new Map(days.map((d) => [d, 0]));
  const ordersByDay = new Map(days.map((d) => [d, 0]));
  for (const o of recentOrdersForTrend) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (!revenueByDay.has(key)) continue;
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(o.total));
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
  }
  const revenuePoints = days.map((d) => ({ date: d, value: revenueByDay.get(d) ?? 0 }));
  const orderPoints = days.map((d) => ({ date: d, value: ordersByDay.get(d) ?? 0 }));

  const productAgg = new Map<string, { qty: number; revenue: number }>();
  for (const item of recentItemsForTop) {
    const cur = productAgg.get(item.name) ?? { qty: 0, revenue: 0 };
    cur.qty += item.quantity;
    cur.revenue += Number(item.unitPrice) * item.quantity;
    productAgg.set(item.name, cur);
  }
  const topProducts = [...productAgg.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  type Activity = { id: string; text: string; href: string; icon: typeof ShoppingBagIcon; createdAt: Date };
  const activity: Activity[] = [
    ...recentOrdersForFeed.map((o) => ({
      id: `order-${o.id}`,
      text: `New order #${o.id.slice(-8).toUpperCase()} — ${formatCurrency(Number(o.total))}`,
      href: "/bunnycraft-admin/orders",
      icon: ShoppingBagIcon,
      createdAt: o.createdAt,
    })),
    ...recentReviews.map((r) => ({
      id: `review-${r.id}`,
      text: `${r.authorName} left a ${r.rating}★ review on ${r.product.name}`,
      href: "/bunnycraft-admin/reviews",
      icon: StarIcon,
      createdAt: r.createdAt,
    })),
    ...recentMessages.map((m) => ({
      id: `message-${m.id}`,
      text: `${m.name} sent a message: "${m.subject}"`,
      href: "/bunnycraft-admin/messages",
      icon: MailIcon,
      createdAt: m.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const stats = [
    { label: "Total Revenue", value: formatCurrency(revenue), icon: IndianRupeeIcon },
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendChart title="Revenue" points={revenuePoints} variant="currency" />
        <TrendChart title="Orders" points={orderPoints} variant="count" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-heading text-sm font-semibold">Top products (30 days)</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet in this period.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {topProducts.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 font-medium">{formatCurrency(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 flex items-center gap-1.5 font-heading text-sm font-semibold">
            <AlertTriangleIcon className="size-4 text-destructive" /> Low stock
          </h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everything is well stocked.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link href="/bunnycraft-admin/products" className="truncate hover:underline">
                    {p.name}
                  </Link>
                  <span className="shrink-0 font-medium text-destructive">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="mb-4 font-heading text-sm font-semibold">Recent activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activity.map((a) => (
                <li key={a.id}>
                  <Link href={a.href} className="flex items-start gap-2.5 text-sm hover:underline">
                    <a.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{a.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/bunnycraft-admin/orders"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Manage Orders</p>
          <p className="mt-1 text-sm text-muted-foreground">Update status and tracking numbers.</p>
        </Link>
        <Link
          href="/bunnycraft-admin/filaments"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Manage Filaments</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pricing, stock, and colors used by the customize wizard.
          </p>
        </Link>
        <Link
          href="/bunnycraft-admin/settings"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Pricing Settings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Machine rate, print speed, and finishing cost assumptions.
          </p>
        </Link>
        <Link
          href="/bunnycraft-admin/categories"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Manage Categories</p>
          <p className="mt-1 text-sm text-muted-foreground">Organize products into categories.</p>
        </Link>
        <Link
          href="/bunnycraft-admin/reviews"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Moderate Reviews</p>
          <p className="mt-1 text-sm text-muted-foreground">View and remove customer reviews.</p>
        </Link>
        <Link
          href="/bunnycraft-admin/messages"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Contact & Newsletter</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Read contact submissions and manage subscribers.
          </p>
        </Link>
        <Link
          href="/bunnycraft-admin/users"
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
        >
          <p className="font-heading font-semibold">Manage Users</p>
          <p className="mt-1 text-sm text-muted-foreground">Review accounts and update roles.</p>
        </Link>
      </div>
    </div>
  );
}
