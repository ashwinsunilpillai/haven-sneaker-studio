import type { Product } from "@/lib/types";

const API_BASE_URL = "http://localhost:4000/api";

interface ProductsResponse {
  products: Product[];
}

interface ProductResponse {
  product: Product;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Not found");
    }

    throw new Error("Could not load products.");
  }

  return (await response.json()) as T;
}

export async function getProducts(): Promise<Product[]> {
  const data = await request<ProductsResponse>("/products");
  return data.products;
}

export async function getFeaturedProducts(limit = 20): Promise<Product[]> {
  const products = await getProducts();
  return products.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const data = await request<ProductResponse>(`/products/${encodeURIComponent(slug)}`);
    return data.product;
  } catch (error) {
    if (error instanceof Error && error.message === "Not found") {
      return undefined;
    }

    throw error;
  }
}

export async function searchProducts(query: string, limit = 50): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const products = await getProducts();

  return products
    .filter((product) =>
      [product.name, product.brand, product.model, product.category]
        .join(" ")
        .toLowerCase()
        .includes(q),
    )
    .slice(0, limit);
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  const current = products.find((product) => product.slug === slug);

  return products
    .filter((product) => product.slug !== slug && product.category === current?.category)
    .slice(0, limit);
}
