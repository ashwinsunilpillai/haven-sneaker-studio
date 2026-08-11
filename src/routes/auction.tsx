import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { AuctionGrid } from "@/components/AuctionGrid";
import { BidPanel } from "@/components/BidPanel";
import { SiteLayout } from "@/components/SiteLayout";
import type { Product } from "@/lib/types";
import {
  connectAuctionSocket,
  getAuctions,
  joinAuctionRoom,
  leaveAuctionRoom,
} from "@/services/auctions";

export const Route = createFileRoute("/auction")({
  head: () => ({
    meta: [
      { title: "Live Auctions — Haven" },
      { name: "description", content: "Real-time bidding on exclusive sneaker pairs at Haven." },
      { property: "og:title", content: "Live Auctions — Haven" },
      { property: "og:description", content: "Bid on exclusive pairs before time runs out." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/auction" },
    ],
    links: [{ rel: "canonical", href: "/auction" }],
  }),
  component: AuctionPage,
});

type BidState = Record<
  string,
  {
    currentBid: number;
    bidCount: number;
    isTopBidder?: boolean;
    auctionStatus?: Product["auctionStatus"];
    auctionEndsAt?: string;
  }
>;

function AuctionPage() {
  const { data, isLoading } = useQuery({ queryKey: ["auctions"], queryFn: getAuctions });
  // Local bid state stands in for a Socket.IO subscription.
  const [bids, setBids] = useState<BidState>({});
  const [active, setActive] = useState<Product | null>(null);

  const auctions = useMemo(() => data ?? [], [data]);
  const activeBid = active ? (bids[active.id]?.currentBid ?? active.currentBid ?? 0) : 0;

  useEffect(() => {
    const unsubscribe = connectAuctionSocket((payload) => {
      setBids((prev) => ({
        ...prev,
        [payload.productId]: {
          ...(prev[payload.productId] ?? {}),
          currentBid: payload.currentBid,
          bidCount: payload.bidCount,
          auctionStatus: payload.auctionStatus,
          auctionEndsAt: payload.auctionEndsAt,
        },
      }));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!auctions.length) return;

    const auctionIds = auctions.map((auction) => auction.auctionId ?? auction.id);
    auctionIds.forEach((auctionId) => joinAuctionRoom(auctionId));

    return () => {
      auctionIds.forEach((auctionId) => leaveAuctionRoom(auctionId));
    };
  }, [auctions]);

  return (
    <SiteLayout>
      <div className="bg-[oklch(0.16_0.005_280)] py-16 text-[oklch(0.98_0_0)] md:py-24">
        <div className="mx-auto max-w-[100rem] px-5 md:px-8">
          <p className="eyebrow flex items-center gap-2 text-live">
            <span className="size-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
            {auctions.length} auctions live
          </p>
          <h1 className="display mt-4 text-[clamp(3rem,10vw,8rem)]">LIVE AUCTIONS</h1>
          <p className="mt-3 max-w-md text-white/70">Real-time bidding on exclusive pairs.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[100rem] px-5 py-16 md:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-sm bg-surface" />
            ))}
          </div>
        ) : (
          <AuctionGrid products={auctions} bids={bids} variant="full" onBid={setActive} />
        )}
      </div>

      <BidPanel
        product={active}
        currentBid={activeBid}
        open={Boolean(active)}
        onOpenChange={(open) => !open && setActive(null)}
        onBidPlaced={(productId, amount, bidCount) =>
          setBids((prev) => ({
            ...prev,
            [productId]: { currentBid: amount, bidCount, isTopBidder: true },
          }))
        }
      />
    </SiteLayout>
  );
}
