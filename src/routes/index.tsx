import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { AboutSection } from "@/components/home/AboutSection";
import { FeaturedSneakers } from "@/components/home/FeaturedSneakers";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveAuctionsSection } from "@/components/home/LiveAuctionsSection";
import { getAuctions } from "@/services/auctions";
import { getFeaturedProducts } from "@/services/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Haven — Premium Sneakers & Live Auctions" },
      {
        name: "description",
        content:
          "Haven is a premium sneaker marketplace. Shop authenticated pairs, discover new silhouettes and bid in live auctions.",
      },
      { property: "og:title", content: "Haven — Premium Sneakers & Live Auctions" },
      {
        property: "og:description",
        content: "Find your next pair. Authenticated sneakers and live bidding on exclusive drops.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getFeaturedProducts(20),
  });
  const auctions = useQuery({ queryKey: ["auctions"], queryFn: getAuctions });

  return (
    <SiteLayout>
      <HeroSection />
      <FeaturedSneakers products={featured.data ?? []} loading={featured.isLoading} />
      <LiveAuctionsSection auctions={auctions.data ?? []} />
      <AboutSection />
    </SiteLayout>
  );
}
