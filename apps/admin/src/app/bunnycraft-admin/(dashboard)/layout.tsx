import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/bunnycraft-admin/login");

  return (
    <div className="min-h-screen bg-muted/20">
      <AdminTopbar
        adminName={session.user.name ?? session.user.email ?? "Admin"}
      />
      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage catalog, pricing, and orders.
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
