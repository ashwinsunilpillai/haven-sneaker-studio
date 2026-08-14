import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import type { CartLine, Product } from "@/lib/types";
import {
  addCartItem,
  clearBackendCart,
  createCartSnapshot,
  getCart,
  persistCart,
  readCart,
  removeCartItem,
  updateCartItem,
  type CartSnapshot,
} from "@/services/cart";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (product: Product, size: number, quantity?: number) => Promise<void>;
  removeLine: (id: string) => Promise<void>;
  setQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [serverTotals, setServerTotals] = useState<Omit<CartSnapshot, "lines"> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { isAuthenticated, isReady } = useAuth();

  const applySnapshot = useCallback((cart: CartSnapshot) => {
    setLines(cart.lines);
    setServerTotals({
      id: cart.id,
      count: cart.count,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateCart() {
      if (!isReady) return;

      if (!isAuthenticated) {
        setLines(readCart());
        setServerTotals(null);
        setHydrated(true);
        return;
      }

      try {
        const cart = await getCart();
        if (!cancelled) applySnapshot(cart);
      } catch {
        if (!cancelled) applySnapshot(createCartSnapshot([]));
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void hydrateCart();

    return () => {
      cancelled = true;
    };
  }, [applySnapshot, isAuthenticated, isReady]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) persistCart(lines);
  }, [lines, hydrated, isAuthenticated]);

  const addToCart = useCallback(
    async (product: Product, size: number, quantity = 1) => {
      if (isAuthenticated) {
        applySnapshot(await addCartItem(product.id, size, quantity));
        return;
      }

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
    },
    [applySnapshot, isAuthenticated],
  );

  const removeLine = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        applySnapshot(await removeCartItem(id));
        return;
      }

      setLines((prev) => prev.filter((line) => line.id !== id));
    },
    [applySnapshot, isAuthenticated],
  );

  const setQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (isAuthenticated) {
        if (quantity <= 0) {
          applySnapshot(await removeCartItem(id));
        } else {
          applySnapshot(await updateCartItem(id, quantity));
        }
        return;
      }

      setLines((prev) =>
        prev.flatMap((line) =>
          line.id === id ? (quantity <= 0 ? [] : [{ ...line, quantity }]) : [line],
        ),
      );
    },
    [applySnapshot, isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      applySnapshot(await clearBackendCart());
      return;
    }

    setLines([]);
  }, [applySnapshot, isAuthenticated]);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      applySnapshot(await getCart());
    } catch {
      applySnapshot(createCartSnapshot([]));
    }
  }, [applySnapshot, isAuthenticated]);

  const value = useMemo<CartContextValue>(() => {
    const localSnapshot = createCartSnapshot(lines);
    const subtotal = serverTotals?.subtotal ?? localSnapshot.subtotal;
    const shipping = serverTotals?.shipping ?? localSnapshot.shipping;
    const total = serverTotals?.total ?? localSnapshot.total;
    const count = serverTotals?.count ?? localSnapshot.count;

    return {
      lines,
      count,
      subtotal,
      shipping,
      total,
      addToCart,
      removeLine,
      setQuantity,
      clearCart,
      refreshCart,
    };
  }, [lines, serverTotals, addToCart, removeLine, setQuantity, clearCart, refreshCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
