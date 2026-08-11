import { socket } from "@/lib/socket";
import type { Product } from "@/lib/types";

const API_BASE_URL = "http://localhost:4000/api";

export interface AuctionRealtimeState {
  auctionId: string;
  productId: string;
  currentBid: number;
  bidCount: number;
  auctionStatus: Product["auctionStatus"];
  auctionStartsAt: string;
  auctionEndsAt: string;
  updatedAt: string;
}

export interface PlaceBidResult {
  auctionId: string;
  productId: string;
  currentBid: number;
  bidCount: number;
  status?: string;
}

interface AuctionsResponse {
  auctions: Product[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // Some successful responses may not contain JSON.
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : "Something went wrong.";

    throw new Error(message);
  }

  return data as T;
}

export async function getAuctions(): Promise<Product[]> {
  const data = await request<AuctionsResponse>("/auctions");
  return data.auctions;
}

export function getAuctionsSync(): Product[] {
  return [];
}

export function minimumNextBid(currentBid: number): number {
  const increment = Math.max(500, Math.round((currentBid * 0.02) / 100) * 100);
  return currentBid + increment;
}

export async function placeBid(auctionId: string, amount: number): Promise<PlaceBidResult> {
  return request<PlaceBidResult>(`/auctions/${encodeURIComponent(auctionId)}/bids`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export function connectAuctionSocket(onState: (state: AuctionRealtimeState) => void) {
  if (!socket.connected) {
    socket.connect();
  }

  const handleState = (payload: AuctionRealtimeState) => onState(payload);

  socket.on("auction:state", handleState);
  socket.on("bid:placed", handleState);
  socket.on("auction:started", handleState);
  socket.on("auction:ended", handleState);

  return () => {
    socket.off("auction:state", handleState);
    socket.off("bid:placed", handleState);
    socket.off("auction:started", handleState);
    socket.off("auction:ended", handleState);
  };
}

export function joinAuctionRoom(auctionId: string) {
  if (!auctionId) return;
  socket.emit("auction:join", { auctionId });
}

export function leaveAuctionRoom(auctionId: string) {
  if (!auctionId) return;
  socket.emit("auction:leave", { auctionId });
}
