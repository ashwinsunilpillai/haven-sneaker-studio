import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { searchProducts } from "@/services/products";

interface SearchBarProps {
  className?: string | undefined;
  autoFocus?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}

export function SearchBar({ className, autoFocus, onNavigate }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      searchProducts(trimmed, 6)
        .then((products) => {
          if (!cancelled) setResults(products);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    navigate({ to: "/product/$slug", params: { slug } });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    onNavigate?.();
    navigate({ to: "/search", search: { q: query.trim() } });
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form role="search" onSubmit={submit}>
        <label htmlFor="haven-search" className="sr-only">
          Search sneakers
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id="haven-search"
          type="search"
          autoFocus={autoFocus}
          value={query}
          placeholder="Search sneakers..."
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          className="h-11 w-full rounded-sm border border-border bg-card pl-10 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
      </form>

      {open && query.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-sm border border-border bg-popover shadow-[var(--shadow-lift)]">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted-foreground">
              No matches for “{query}”.
            </p>
          ) : (
            <ul className="max-h-96 overflow-auto py-1">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => go(product.slug)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                  >
                    <img
                      src={product.image}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      className="size-12 shrink-0 rounded-sm bg-surface object-contain p-1"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{product.name}</span>
                      <span className="block text-xs text-muted-foreground">{product.brand}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatINR(product.isAuction ? (product.currentBid ?? product.price) : product.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
