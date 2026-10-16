"use client";

import {
  BoxesIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  MailIcon,
  PackageIcon,
  QuoteIcon,
  SettingsIcon,
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/bunnycraft-admin", label: "Dashboard", icon: LayoutDashboardIcon },
  {
    href: "/bunnycraft-admin/categories",
    label: "Categories",
    icon: FolderTreeIcon,
  },
  { href: "/bunnycraft-admin/filaments", label: "Filaments", icon: BoxesIcon },
  { href: "/bunnycraft-admin/products", label: "Products", icon: PackageIcon },
  { href: "/bunnycraft-admin/coupons", label: "Coupons", icon: TagIcon },
  { href: "/bunnycraft-admin/orders", label: "Orders", icon: ShoppingBagIcon },
  { href: "/bunnycraft-admin/reviews", label: "Product Reviews", icon: StarIcon },
  { href: "/bunnycraft-admin/testimonials", label: "Testimonials", icon: QuoteIcon },
  { href: "/bunnycraft-admin/messages", label: "Messages", icon: MailIcon },
  { href: "/bunnycraft-admin/users", label: "Users", icon: UsersIcon },
  {
    href: "/bunnycraft-admin/settings",
    label: "Settings",
    icon: SettingsIcon,
  },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  // Dashboard is the prefix of every admin route, so it only matches exactly.
  function isActive(href: string) {
    if (href === "/bunnycraft-admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-52 lg:flex-col">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-muted",
              active && "bg-muted text-primary"
            )}
          >
            <item.icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
