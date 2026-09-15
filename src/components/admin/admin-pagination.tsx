"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminPagination({
  page,
  pageCount,
  total,
  pageSize,
  pageParam = "page",
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  pageParam?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    if (nextPage <= 1) params.delete(pageParam);
    else params.set(pageParam, String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-border px-1 py-3 text-sm text-muted-foreground">
      <span>
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
        >
          <ChevronLeftIcon className="size-4" /> Prev
        </Button>
        <span className="text-xs">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => goTo(page + 1)}
        >
          Next <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
