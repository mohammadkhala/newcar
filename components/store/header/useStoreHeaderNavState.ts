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
      setCategoriesDropdownOpen,
      setShopDropdownOpen,
      setOpenFeaturedId,
      closeAllDesktop,
    },
  };
}
