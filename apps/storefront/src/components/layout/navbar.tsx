"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BoxesIcon,
  CogIcon,
  DicesIcon,
  Gamepad2Icon,
  GiftIcon,
  HeartIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  ShoppingBagIcon,
  UserRoundIcon,
  WrenchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CartSheet } from "@/components/layout/cart-sheet";
import { SearchAutocomplete } from "@/components/layout/search-autocomplete";
import { useCartCount } from "@/store/cart-store";
import { CATEGORIES, NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  Home: HomeIcon,
  Gamepad2: Gamepad2Icon,
  Dices: DicesIcon,
  UserRound: UserRoundIcon,
  Boxes: BoxesIcon,
  Wrench: WrenchIcon,
  Cog: CogIcon,
  Gift: GiftIcon,
} as const;

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const cartCount = useCartCount();

  const [scrolled, setScrolled] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/bunnycraft-admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled ? "glass shadow-soft" : "bg-background/0"
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/bunnycraft-logo.svg" alt="" width={32} height={32} className="size-8" priority />
          <span className="font-heading text-lg font-bold tracking-tight">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Categories
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c.icon];
                return (
                  <DropdownMenuItem key={c.slug} asChild>
                    <Link href={`/shop?category=${c.slug}`}>
                      <Icon className="size-4 text-muted-foreground" />
                      {c.name}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {NAV_LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm" className="text-sm font-medium">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <SearchAutocomplete className="ml-auto hidden max-w-sm flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Link href="/wishlist" aria-label="Wishlist">
              <HeartIcon className="size-[18px]" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBagIcon className="size-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-none bg-primary text-[10px] font-semibold text-primary-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Button>

          <ThemeToggle />

          <div className="hidden sm:block">
            {status === "authenticated" && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full">
                    {session.user.image ? (
                      <Avatar className="size-7 rounded-full">
                        <AvatarImage src={session.user.image} alt="" />
                        <AvatarFallback className="rounded-full text-[10px]">
                          {(session.user.name ?? session.user.email ?? "?")[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <UserRoundIcon className="size-[18px]" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="truncate">
                    {session.user.name ?? session.user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <UserRoundIcon /> Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <ShoppingBagIcon /> Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => signOut()}>
                    <LogOutIcon /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <MenuIcon className="size-[18px]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>{SITE_NAME}</SheetTitle>
              </SheetHeader>
              <SearchAutocomplete onNavigate={() => setMobileOpen(false)} />
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Wishlist
                </Link>
              </nav>
              <Separator />
              <div>
                <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Categories</p>
                <nav className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop?category=${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    >
                      {c.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <Separator />
              {status === "authenticated" && session?.user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Button asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
