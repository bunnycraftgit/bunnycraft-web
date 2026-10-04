import { ShieldIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin Sign In" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/bunnycraft-admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-none bg-primary text-primary-foreground">
            <ShieldIcon className="size-5" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            BunnyCraft Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Restricted access — administrators only.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <Suspense>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
