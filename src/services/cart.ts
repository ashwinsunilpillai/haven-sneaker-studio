import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "haven.cart";
const API_BASE_URL = "http://localhost:4000/api";

export const SHIPPING_FLAT_RATE = 499;
export const FREE_SHIPPING_THRESHOLD = 25000;

export interface CartSnapshot {
  id?: string;
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
}

interface CartResponse {
  cart: CartSnapshot;
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

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function persistCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function calcSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function calcShipping(subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FLAT_RATE;
}

export function createCartSnapshot(lines: CartLine[]): CartSnapshot {
  const subtotal = calcSubtotal(lines);
  const shipping = calcShipping(subtotal);

  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

export async function getCart(): Promise<CartSnapshot> {
  const data = await request<CartResponse>("/cart");
  return data.cart;
}

export async function addCartItem(
  productId: string,
  size: number,
  quantity = 1,
): Promise<CartSnapshot> {
  const data = await request<CartResponse>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, size, quantity }),
  });

  return data.cart;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartSnapshot> {
  const data = await request<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });

  return data.cart;
}

export async function removeCartItem(itemId: string): Promise<CartSnapshot> {
  const data = await request<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });

  return data.cart;
}

export async function clearBackendCart(): Promise<CartSnapshot> {
  const data = await request<CartResponse>("/cart", {
    method: "DELETE",
  });

  return data.cart;
}
