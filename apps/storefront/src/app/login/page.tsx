import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" description="Sign in to track orders and manage your account.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
