import Link from "next/link";
import { PackageSearchIcon } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex size-11 items-center justify-center rounded-none bg-primary text-primary-foreground">
            <PackageSearchIcon className="size-5" />
          </Link>
          <h1 className="font-heading text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">{children}</div>
      </div>
    </div>
  );
}
