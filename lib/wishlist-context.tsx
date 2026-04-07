"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { bffFetch } from "@/lib/bff-client";

type ToggleResult = {
  ok: boolean;
  isFavorite: boolean;
  unauthorized?: boolean;
};

type WishlistContextValue = {
  ready: boolean;
  isAuthenticated: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<ToggleResult>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const loadWishlist = useCallback(async () => {
    const res = await bffFetch("customer/wish-list?limit=200&offset=1", {
      method: "GET",
      locale,
    });

    if (res.status === 401) {
      setIsAuthenticated(false);
      setFavoriteIds(new Set());
      setReady(true);
      return;
    }

    if (!res.ok) {
      setIsAuthenticated(false);
      setFavoriteIds(new Set());
      setReady(true);
      return;
    }

    type WishlistPayload = { products?: Array<{ id?: number | string }> };
    const data = (await res.json()) as WishlistPayload;
    const ids = new Set<number>();
    for (const p of data.products ?? []) {
      const n = Number(p.id);
      if (Number.isFinite(n) && n > 0) {
        ids.add(n);
      }
    }
    setFavoriteIds(ids);
    setIsAuthenticated(true);
    setReady(true);
  }, [locale]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      void (async () => {
        try {
          const sessionRes = await fetch("/api/auth/session", {
            credentials: "include",
          });
          const session = (await sessionRes.json()) as { authenticated?: boolean };
          if (!session.authenticated) {
            setIsAuthenticated(false);
            setFavoriteIds(new Set());
            setReady(true);
            return;
          }
          await loadWishlist();
        } catch {
          setIsAuthenticated(false);
          setFavoriteIds(new Set());
          setReady(true);
        }
      })();
    });
    return () => cancelAnimationFrame(raf);
  }, [loadWishlist]);

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.has(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (productId: number): Promise<ToggleResult> => {
      if (!isAuthenticated) {
        return { ok: false, isFavorite: false, unauthorized: true };
      }

      const currentlyFavorite = favoriteIds.has(productId);
      const res = await bffFetch(
        currentlyFavorite ? "customer/wish-list/remove" : "customer/wish-list/add",
        {
          method: currentlyFavorite ? "DELETE" : "POST",
          locale,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_ids: [productId] }),
        },
      );

      if (res.status === 401) {
        setIsAuthenticated(false);
        setFavoriteIds(new Set());
        return { ok: false, isFavorite: false, unauthorized: true };
      }

      if (!res.ok) {
        return { ok: false, isFavorite: currentlyFavorite };
      }

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFavorite) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      return { ok: true, isFavorite: !currentlyFavorite };
    },
    [favoriteIds, isAuthenticated, locale],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ready,
      isAuthenticated,
      isFavorite,
      toggleFavorite,
    }),
    [ready, isAuthenticated, isFavorite, toggleFavorite],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return ctx;
}
