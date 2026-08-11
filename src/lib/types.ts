export type Category = "lifestyle" | "basketball" | "running" | "collectible";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  image: string;
  gallery?: string[];
  sizes: number[];
  category: Category;
  isNew?: boolean;
  isAuction?: boolean;
  currentBid?: number;
  bidCount?: number;
  auctionStatus?: "scheduled" | "live" | "ended" | "cancelled";
  auctionId?: string;
  auctionStartsAt?: string;
  /** ISO string — replaced by server time when a backend is connected. */
  auctionEndsAt?: string;
}

export interface CartLine {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  size: number;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Bid {
  productId: string;
  amount: number;
  userId: string;
  createdAt: string;
}
