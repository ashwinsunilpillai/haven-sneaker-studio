import { ProductGrid } from "@/components/ProductGrid";
import type { Product } from "@/lib/types";

interface FeaturedSneakersProps {
  products: Product[];
  loading?: boolean | undefined;
}

export function FeaturedSneakers({ products, loading }: FeaturedSneakersProps) {
  return (
    <section
      id="featured"
      className="mx-auto max-w-[100rem] scroll-mt-24 px-5 py-20 md:px-8 md:py-28"
    >
      <header className="mb-12 flex flex-col gap-3 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="display text-[clamp(2.5rem,6vw,4.5rem)]">FEATURED SNEAKERS</h2>
          <p className="mt-2 text-sm text-muted-foreground">Handpicked pairs worth having.</p>
        </div>
        <p className="eyebrow text-muted-foreground">{products.length} pairs in stock</p>
      </header>

      <ProductGrid products={products} loading={loading} skeletonCount={8} />
    </section>
  );
}
