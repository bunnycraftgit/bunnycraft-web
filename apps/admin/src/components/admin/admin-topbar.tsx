"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOutIcon, StoreIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/admin/theme-toggle";

export function AdminTopbar({ adminName }: { adminName: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/bunnycraft-admin" className="font-heading text-sm font-bold tracking-tight">
          BunnyCraft <span className="text-muted-foreground">Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">{adminName}</span>
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/" target="_blank" rel="noreferrer">
              <StoreIcon /> View store
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/bunnycraft-admin/login" })}
          >
            <LogOutIcon /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
