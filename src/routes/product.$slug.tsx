import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { BidPanel } from "@/components/BidPanel";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductGrid } from "@/components/ProductGrid";
import { SiteLayout } from "@/components/SiteLayout";
import { connectAuctionSocket, joinAuctionRoom, leaveAuctionRoom } from "@/services/auctions";
import { getProductBySlug, getRelatedProducts } from "@/services/products";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Sneaker not found — Haven" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Haven`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const related = useQuery({
    queryKey: ["products", "related", product.slug],
    queryFn: () => getRelatedProducts(product.slug),
  });

  const [bid, setBid] = useState({
    currentBid: product.currentBid ?? 0,
    bidCount: product.bidCount ?? 0,
  });
  const [bidOpen, setBidOpen] = useState(false);

  useEffect(() => {
    if (!product.isAuction) return;

    const auctionId = product.auctionId ?? product.id;
    const unsubscribe = connectAuctionSocket((payload) => {
      if (payload.productId !== product.id) return;
      setBid({ currentBid: payload.currentBid, bidCount: payload.bidCount });
    });

    joinAuctionRoom(auctionId);

    return () => {
      leaveAuctionRoom(auctionId);
      unsubscribe();
    };
  }, [product.auctionId, product.id, product.isAuction]);

  return (
    <SiteLayout>
      <ProductDetails
        product={product}
        currentBid={bid.currentBid}
        bidCount={bid.bidCount}
        onBid={() => setBidOpen(true)}
      />

      <section className="mx-auto max-w-[100rem] px-5 pb-16 md:px-8">
        <h2 className="display mb-8 border-t border-border pt-10 text-3xl">YOU MAY ALSO LIKE</h2>
        <ProductGrid products={related.data ?? []} loading={related.isLoading} skeletonCount={4} />
      </section>

      <BidPanel
        product={product.isAuction ? product : null}
        currentBid={bid.currentBid}
        open={bidOpen}
        onOpenChange={setBidOpen}
        onBidPlaced={(_id, amount, bidCount) => setBid({ currentBid: amount, bidCount })}
      />
    </SiteLayout>
  );
}

function ProductNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="display text-5xl">PAIR NOT FOUND</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This sneaker is no longer listed on Haven.
        </p>
      </div>
    </SiteLayout>
  );
}
