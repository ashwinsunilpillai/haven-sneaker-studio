import type { Product } from "@/lib/types";
import { AuctionCard } from "@/components/AuctionCard";

interface AuctionGridProps {
  products: Product[];
  bids?: Record<string, { currentBid: number; bidCount: number; isTopBidder?: boolean }>;
  onBid?: (product: Product) => void;
  variant?: "compact" | "full";
}

export function AuctionGrid({ products, bids, onBid, variant = "compact" }: AuctionGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No auctions are live right now. Check back shortly.
      </p>
    );
  }

  return (
    <div
      className={
        variant === "full"
          ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {products.map((product) => {
        const state = bids?.[product.id];
        return (
          <AuctionCard
            key={product.id}
            product={product}
            variant={variant}
            currentBid={state?.currentBid ?? product.currentBid ?? 0}
            bidCount={state?.bidCount ?? product.bidCount ?? 0}
            isTopBidder={state?.isTopBidder}
            onBid={onBid}
          />
        );
      })}
    </div>
  );
}
