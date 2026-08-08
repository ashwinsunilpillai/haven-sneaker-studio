import { products } from "@/data/products";
import type { Product } from "@/lib/types";

/**
 * Mock auction service.
 *
 * A real implementation will subscribe to a Socket.IO channel and push updates
 * into the same shapes returned here, so the UI layer will not need to change.
 */

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAuctions(): Promise<Product[]> {
  await delay();
  return products.filter((product) => product.isAuction);
}

export function getAuctionsSync(): Product[] {
  return products.filter((product) => product.isAuction);
}

export function minimumNextBid(currentBid: number): number {
  const increment = Math.max(500, Math.round((currentBid * 0.02) / 100) * 100);
  return currentBid + increment;
}

export interface PlaceBidResult {
  productId: string;
  currentBid: number;
  bidCount: number;
}

export async function placeBid(productId: string, amount: number): Promise<PlaceBidResult> {
  await delay(400);
  const product = products.find((item) => item.id === productId);
  if (!product) throw new Error("Auction not found");
  if (amount < minimumNextBid(product.currentBid ?? 0)) {
    throw new Error("Bid is below the minimum increment");
  }
  return { productId, currentBid: amount, bidCount: (product.bidCount ?? 0) + 1 };
}
