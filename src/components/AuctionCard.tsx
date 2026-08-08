import { Link } from "@tanstack/react-router";

import { Countdown } from "@/components/Countdown";
import { Button } from "@/components/ui/haven-button";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

export interface AuctionCardProps {
  product: Product;
  currentBid: number;
  bidCount: number;
  isTopBidder?: boolean;
  onBid?: (product: Product) => void;
  variant?: "compact" | "full";
}

export function AuctionCard({
  product,
  currentBid,
  bidCount,
  isTopBidder,
  onBid,
  variant = "compact",
}: AuctionCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden bg-surface"
      >
        <span className="eyebrow absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-sm bg-live px-2 py-1 text-[0.6rem] text-live-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live-foreground" />
          Live
        </span>
        <img
          src={product.image}
          alt={`${product.brand} ${product.name} sneaker on auction`}
          width={1240}
          height={886}
          loading="lazy"
          className={
            variant === "full"
              ? "aspect-[16/10] w-full object-contain p-6 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
              : "aspect-[4/3] w-full object-contain p-4 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
          }
        />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="eyebrow text-muted-foreground">{product.brand}</p>
          <h3 className="font-sans text-base font-semibold tracking-tight">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <dt className="eyebrow text-muted-foreground">Current bid</dt>
            <dd className="display mt-1 text-2xl text-live">{formatINR(currentBid)}</dd>
            <dd className="text-xs text-muted-foreground">{bidCount} bids</dd>
          </div>
          <div className="text-right">
            <dt className="eyebrow text-muted-foreground">Time remaining</dt>
            <dd className="display mt-1 text-2xl">
              {product.auctionEndsAt ? <Countdown endsAt={product.auctionEndsAt} /> : "--:--:--"}
            </dd>
            {isTopBidder ? (
              <dd className="text-xs font-semibold text-live">You are the top bidder</dd>
            ) : null}
          </div>
        </dl>

        <div className="mt-auto">
          {onBid ? (
            <Button variant="live" block onClick={() => onBid(product)}>
              Bid higher
            </Button>
          ) : (
            <Button variant="live" block asChild>
              <Link to="/auction">Bid higher</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
