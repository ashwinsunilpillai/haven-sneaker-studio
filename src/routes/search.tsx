import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ProductGrid } from "@/components/ProductGrid";
import { SiteLayout } from "@/components/SiteLayout";
import { searchProducts } from "@/services/products";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Search sneakers — Haven" },
      { name: "description", content: "Search Haven's catalogue of authenticated sneakers." },
      { property: "og:title", content: "Search sneakers — Haven" },
      { property: "og:description", content: "Find Jordans, Kobes, Air Max and more on Haven." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/search" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["products", "search", q],
    queryFn: () => searchProducts(q),
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[100rem] px-5 py-12 md:px-8 md:py-20">
        <p className="eyebrow text-muted-foreground">Search results</p>
        <h1 className="display mt-3 text-[clamp(2.5rem,8vw,5rem)]">{q || "ALL SNEAKERS"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoading ? "Searching…" : `${data?.length ?? 0} pairs found`}
        </p>

        <div className="mt-12">
          <ProductGrid products={data ?? []} loading={isLoading} skeletonCount={8} />
        </div>
      </div>
    </SiteLayout>
  );
}
