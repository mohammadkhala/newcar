"use client";

import { useEffect, useRef, useState } from "react";

export function useStoreHeaderNavState() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [openFeaturedId, setOpenFeaturedId] = useState<number | null>(null);

  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const shopRef = useRef<HTMLLIElement | null>(null);
  const featuredNavRef = useRef<HTMLElement | null>(null);
  const featuredCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (featuredCloseTimerRef.current) clearTimeout(featuredCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeAllDesktop = () => {
    setCategoriesDropdownOpen(false);
    setShopDropdownOpen(false);
    setOpenFeaturedId(null);
  };

  const anyDesktopOpen =
    categoriesDropdownOpen || shopDropdownOpen || openFeaturedId !== null;

  useEffect(() => {
    if (!anyDesktopOpen) return;

    // Sticky mega panels stay mounted while the page scrolls under them if the
    // pointer remains on the orange bar — first click then only dismisses the
    // panel. Close on scroll so content tiles respond on the first press.
    const onScroll = () => closeAllDesktop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAllDesktop();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, [anyDesktopOpen]);

  // Only one desktop dropdown should ever be open at a time — all three panels now
  // overlap the same screen position (absolute start-0/top-0 under the bar), so leaving
  // a previous one open while a second opens stacks them visibly on top of each other.
  const toggleCategories = () => {
    setShopDropdownOpen(false);
    setOpenFeaturedId(null);
    setCategoriesDropdownOpen((open) => !open);
  };

  const toggleShop = () => {
    setCategoriesDropdownOpen(false);
    setOpenFeaturedId(null);
    setShopDropdownOpen((open) => !open);
  };

  const toggleFeatured = (id: number) => {
    setCategoriesDropdownOpen(false);
    setShopDropdownOpen(false);
    setOpenFeaturedId((current) => (current === id ? null : id));
  };

  const openFeatured = (id: number) => {
    if (featuredCloseTimerRef.current) clearTimeout(featuredCloseTimerRef.current);
    setCategoriesDropdownOpen(false);
    setShopDropdownOpen(false);
    setOpenFeaturedId(id);
  };

  const scheduledCloseFeatured = () => {
    featuredCloseTimerRef.current = setTimeout(() => setOpenFeaturedId(null), 150);
  };

  const cancelCloseFeatured = () => {
    if (featuredCloseTimerRef.current) clearTimeout(featuredCloseTimerRef.current);
  };

  return {
    state: {
      menuOpen,
      categoriesDropdownOpen,
      shopDropdownOpen,
      openFeaturedId,
    },
    refs: {
      categoriesRef,
      shopRef,
      featuredNavRef,
    },
    actions: {
      setMenuOpen,
      toggleCategories,
      toggleShop,
      toggleFeatured,
      openFeatured,
      scheduledCloseFeatured,
      cancelCloseFeatured,
      closeAllDesktop,
    },
  };
}
