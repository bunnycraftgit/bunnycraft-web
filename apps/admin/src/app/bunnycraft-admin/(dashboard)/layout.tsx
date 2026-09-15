import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BoxesIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  MailIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { auth } from "@/lib/auth";

const NAV = [
  { href: "/bunnycraft-admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/bunnycraft-admin/categories", label: "Categories", icon: FolderTreeIcon },
  { href: "/bunnycraft-admin/filaments", label: "Filaments", icon: BoxesIcon },
  { href: "/bunnycraft-admin/products", label: "Products", icon: PackageIcon },
  { href: "/bunnycraft-admin/coupons", label: "Coupons", icon: TagIcon },
  { href: "/bunnycraft-admin/orders", label: "Orders", icon: ShoppingBagIcon },
  { href: "/bunnycraft-admin/reviews", label: "Reviews", icon: StarIcon },
  { href: "/bunnycraft-admin/messages", label: "Messages", icon: MailIcon },
  { href: "/bunnycraft-admin/users", label: "Users", icon: UsersIcon },
  { href: "/bunnycraft-admin/settings", label: "Pricing Settings", icon: SettingsIcon },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/bunnycraft-admin/login");

  return (
    <div className="min-h-screen bg-muted/20">
      <AdminTopbar adminName={session.user.name ?? session.user.email ?? "Admin"} />
      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
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
    </div>
  );
}
