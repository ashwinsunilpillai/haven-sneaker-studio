import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  loading?: boolean | undefined;
  skeletonCount?: number | undefined;
}

export function ProductGrid({ products, loading, skeletonCount = 8 }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No sneakers matched that search.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
