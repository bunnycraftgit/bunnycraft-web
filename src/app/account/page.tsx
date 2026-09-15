import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { AddressManager } from "@/components/account/address-manager";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Your Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const [user, addresses] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  if (!user) redirect("/login?callbackUrl=/account");

  const plainAddresses = addresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state,
    zip: a.zip,
    country: a.country,
    phone: a.phone ?? undefined,
    isDefault: a.isDefault,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Your Account</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile and saved addresses.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 font-heading text-lg font-semibold">Profile</h2>
        <ProfileForm
          initialName={user.name ?? ""}
          email={user.email}
          initialImage={user.image}
          memberSince={user.createdAt.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
          })}
        />
      </div>

      <Separator />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 font-heading text-lg font-semibold">Password</h2>
        <ChangePasswordForm />
      </div>

      <Separator />

      <AddressManager initialAddresses={plainAddresses} />
    </div>
  );
}
