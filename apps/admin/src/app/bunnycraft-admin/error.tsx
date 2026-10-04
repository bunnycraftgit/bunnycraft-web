"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/20 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-none bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-6" />
      </div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">
        The admin panel hit an unexpected error. You can try again, or head back
        to the dashboard.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>
          <RefreshCwIcon /> Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bunnycraft-admin">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
