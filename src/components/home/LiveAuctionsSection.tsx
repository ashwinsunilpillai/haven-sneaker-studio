import { Link } from "@tanstack/react-router";

import { AuctionGrid } from "@/components/AuctionGrid";
import { Button } from "@/components/ui/haven-button";
import type { Product } from "@/lib/types";

export function LiveAuctionsSection({ auctions }: { auctions: Product[] }) {
  return (
    <section className="bg-[oklch(0.16_0.005_280)] py-20 text-[oklch(0.98_0_0)] md:py-28">
      <div className="mx-auto max-w-[100rem] px-5 md:px-8">
        <header className="mb-12 flex flex-col gap-4 border-b border-white/15 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2 text-live">
              <span className="size-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
              Bidding open
            </p>
            <h2 className="display mt-3 text-[clamp(2.5rem,6vw,4.5rem)]">LIVE AUCTIONS</h2>
            <p className="mt-2 text-sm text-white/70">
              Bid on exclusive pairs before time runs out.
            </p>
          </div>
          <Button variant="live" asChild>
            <Link to="/auction">Enter the auction room</Link>
          </Button>
        </header>

        <div className="[&_article]:border-white/15 [&_article]:bg-white/[0.04] [&_dl]:border-white/15 [&_h3]:text-white [&_img]:bg-white">
          <AuctionGrid products={auctions.slice(0, 3)} />
        </div>
      </div>
    </section>
  );
}
