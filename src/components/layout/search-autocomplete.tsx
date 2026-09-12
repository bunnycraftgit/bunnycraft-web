"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

type SearchResult = { id: string; slug: string; name: string; image: string; price: number };

export function SearchAutocomplete({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  const visibleResults = trimmedQuery.length < 2 ? [] : results;

  React.useEffect(() => {
    if (trimmedQuery.length < 2) return;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmedQuery)}`);
        if (!res.ok) return;
        setResults(await res.json());
        setOpen(true);
      } catch {
        // network hiccup — leave existing results in place
      }
    }, 250);
    return () => clearTimeout(id);
  }, [trimmedQuery]);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    onNavigate?.();
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={submitSearch}>
        <div className="relative w-full">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => visibleResults.length > 0 && setOpen(true)}
            placeholder="Search products…"
            className="rounded-none pl-10"
          />
        </div>
      </form>

      {open && visibleResults.length > 0 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lift">
          {visibleResults.map((r) => (
            <Link
              key={r.id}
              href={`/shop/${r.slug}`}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={r.image} alt="" fill sizes="40px" className="object-cover" />
              </div>
              <span className="flex-1 truncate text-sm">{r.name}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {formatCurrency(r.price)}
              </span>
            </Link>
          ))}
          <button
            onClick={submitSearch}
            className="w-full border-t border-border px-3 py-2 text-center text-sm font-medium text-primary hover:bg-muted"
          >
            See all results
          </button>
        </div>
      )}
    </div>
  );
}
