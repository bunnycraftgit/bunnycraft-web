"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", { ...values, redirect: false });
    if (res?.error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    const session = await getSession();
    if (session?.user?.role !== "ADMIN") {
      await signOut({ redirect: false });
      setError("This account doesn't have admin access.");
      setLoading(false);
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl?.startsWith("/bunnycraft-admin") ? callbackUrl : "/bunnycraft-admin");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading && <LoaderCircleIcon className="animate-spin" />}
          Sign in
        </Button>

        {process.env.NODE_ENV === "development" && (
          <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            Demo admin — admin@bunnycraft.com / Admin123!
          </div>
        )}
      </form>
    </Form>
  );
}
