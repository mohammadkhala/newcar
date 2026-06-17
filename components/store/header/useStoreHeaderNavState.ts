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

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        categoriesDropdownOpen &&
        categoriesRef.current &&
        !categoriesRef.current.contains(target)
      ) {
        setCategoriesDropdownOpen(false);
      }

      // shopDropdownOpen's panel now renders as a sibling of the trigger button inside
      // featuredNavRef's wrapper (see StoreHeaderSectionsNav), not inside shopRef's <li>,
      // so check against featuredNavRef to avoid closing the panel on clicks inside it.
      if (
        shopDropdownOpen &&
        featuredNavRef.current &&
        !featuredNavRef.current.contains(target)
      ) {
        setShopDropdownOpen(false);
      }

      if (openFeaturedId !== null && featuredNavRef.current && !featuredNavRef.current.contains(target)) {
        setOpenFeaturedId(null);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [categoriesDropdownOpen, shopDropdownOpen, openFeaturedId]);

  const closeAllDesktop = () => {
    setCategoriesDropdownOpen(false);
    setShopDropdownOpen(false);
    setOpenFeaturedId(null);
  };

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
      closeAllDesktop,
    },
  };
}
