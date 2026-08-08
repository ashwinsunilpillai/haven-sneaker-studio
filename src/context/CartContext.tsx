import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { CartLine, Product } from "@/lib/types";
import { calcShipping, calcSubtotal, persistCart, readCart } from "@/services/cart";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (product: Product, size: number, quantity?: number) => void;
  removeLine: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) persistCart(lines);
  }, [lines, hydrated]);

  const addToCart = useCallback((product: Product, size: number, quantity = 1) => {
    setLines((prev) => {
      const id = `${product.id}-${size}`;
      const existing = prev.find((line) => line.id === id);
      if (existing) {
        return prev.map((line) =>
          line.id === id ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }
      return [
        ...prev,
        {
          id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          image: product.image,
          price: product.price,
          size,
          quantity,
        },
      ];
    });
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((prev) =>
      prev.flatMap((line) =>
        line.id === id ? (quantity <= 0 ? [] : [{ ...line, quantity }]) : [line],
      ),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = calcSubtotal(lines);
    const shipping = calcShipping(subtotal);
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      addToCart,
      removeLine,
      setQuantity,
      clearCart,
    };
  }, [lines, addToCart, removeLine, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
