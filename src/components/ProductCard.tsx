import { Link } from "@tanstack/react-router";

import { Countdown } from "@/components/Countdown";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority }: ProductCardProps) {
  return (
    <article className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block focus:outline-none"
        aria-label={`${product.brand} ${product.name}, ${formatINR(product.price)}`}
      >
        <div className="relative overflow-hidden rounded-sm border border-border bg-card transition-shadow duration-500 group-hover:shadow-[var(--shadow-lift)] group-focus-visible:shadow-[var(--shadow-lift)]">
          <div className="absolute left-3 top-3 z-10 flex gap-1.5">
            {product.isNew ? (
              <span className="eyebrow rounded-sm bg-foreground px-2 py-1 text-[0.6rem] text-primary-foreground">
                New
              </span>
            ) : null}
            {product.isAuction ? (
              <span className="eyebrow rounded-sm bg-live px-2 py-1 text-[0.6rem] text-live-foreground">
                Auction
              </span>
            ) : null}
          </div>
          <img
            src={product.image}
            alt={`${product.brand} ${product.name} sneaker, side profile`}
            width={1240}
            height={886}
            loading={priority ? "eager" : "lazy"}
            className="aspect-[4/3] w-full bg-surface object-contain p-4 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-foreground/95 px-4 py-3 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform duration-400 ease-[var(--ease-out-soft)]",
              "group-hover:translate-y-0 group-focus-visible:translate-y-0",
            )}
          >
            View details
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <p className="eyebrow text-muted-foreground">{product.brand}</p>
          <h3 className="font-sans text-sm font-semibold tracking-tight text-foreground">
            {product.name}
          </h3>
          {product.isAuction && product.currentBid ? (
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className="font-semibold text-live">{formatINR(product.currentBid)}</span>
              <span className="text-xs text-muted-foreground">current bid</span>
              {product.auctionEndsAt ? (
                <Countdown
                  endsAt={product.auctionEndsAt}
                  label="Time remaining"
                  className="text-xs text-muted-foreground"
                />
              ) : null}
            </p>
          ) : (
            <p className="text-sm font-semibold text-foreground">{formatINR(product.price)}</p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] w-full rounded-sm bg-surface" />
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-16 rounded-sm bg-surface" />
        <div className="h-3.5 w-3/4 rounded-sm bg-surface" />
        <div className="h-3.5 w-20 rounded-sm bg-surface" />
      </div>
    </div>
  );
}
