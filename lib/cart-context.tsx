"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StoreProductListItem } from "@/lib/types";

export type CartLine = {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  image?: unknown;
};

type CartApi = {
  lines: CartLine[];
  add: (product: StoreProductListItem, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);

const STORAGE_KEY = "nc_cart_v1";

function readStoredLines(): CartLine[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((row) => {
        if (
          row &&
          typeof row === "object" &&
          "productId" in row &&
          "quantity" in row
        ) {
          const r = row as Record<string, unknown>;
          return {
            productId: Number(r.productId),
            quantity: Number(r.quantity) || 1,
            name: String(r.name ?? ""),
            price: Number(r.price) || 0,
            image: r.image,
          };
        }
        return null;
      })
      .filter(Boolean) as CartLine[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setLines(readStoredLines());
      setHydrated(true);
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setLines(readStoredLines());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore quota */
    }
  }, [lines, hydrated]);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      add(product, qty = 1) {
        setLines((prev) => {
          const idx = prev.findIndex((l) => l.productId === product.id);
          const snap = {
            name: product.name,
            price: product.price,
            image: product.image,
          };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              quantity: next[idx].quantity + qty,
              ...snap,
            };
            return next;
          }
          return [
            ...prev,
            {
              productId: product.id,
              quantity: qty,
              ...snap,
            },
          ];
        });
      },
      remove(productId) {
        setLines((prev) => prev.filter((l) => l.productId !== productId));
      },
      setQty(productId, qty) {
        setLines((prev) =>
          prev.map((l) =>
            l.productId === productId
              ? { ...l, quantity: Math.max(1, qty) }
              : l,
          ),
        );
      },
      clear() {
        setLines([]);
      },
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
