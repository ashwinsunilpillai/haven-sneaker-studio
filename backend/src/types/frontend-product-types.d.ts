declare module "@/lib/types" {
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
    auctionEndsAt?: string;
  }
}
