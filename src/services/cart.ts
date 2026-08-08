import type { CartLine } from "@/lib/types";

/** Mock cart persistence. Swap for user-scoped backend cart later. */

const STORAGE_KEY = "haven.cart";

export const SHIPPING_FLAT_RATE = 499;
export const FREE_SHIPPING_THRESHOLD = 25000;

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
