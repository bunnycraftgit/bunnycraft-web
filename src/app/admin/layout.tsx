import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BoxesIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingBagIcon,
  TagIcon,
} from "lucide-react";

import { auth } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/filaments", label: "Filaments", icon: BoxesIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/coupons", label: "Coupons", icon: TagIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBagIcon },
  { href: "/admin/settings", label: "Pricing Settings", icon: SettingsIcon },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage catalog, pricing, and orders.
        </p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-52 lg:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-muted"
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
