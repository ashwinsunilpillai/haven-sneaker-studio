import { products } from "@/data/products";
import type { Product } from "@/lib/types";

/**
 * Mock product service. Every function is async so the mock data source can be
 * swapped for `fetch("/api/products")` against an Express backend later.
 */

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProducts(): Promise<Product[]> {
  await delay();
  return products;
}

export async function getFeaturedProducts(limit = 20): Promise<Product[]> {
  await delay();
  return products.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  await delay();
  return products.find((product) => product.slug === slug);
}

export function searchProductsSync(query: string, limit = 6): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products
    .filter((product) =>
      [product.name, product.brand, product.model, product.category]
        .join(" ")
        .toLowerCase()
        .includes(q),
    )
    .slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay(120);
  return searchProductsSync(query, 50);
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  await delay();
  const current = products.find((product) => product.slug === slug);
  return products
    .filter((product) => product.slug !== slug && product.category === current?.category)
    .slice(0, limit);
}
