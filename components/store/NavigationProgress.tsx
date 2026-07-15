"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Thin top bar so soft navigations (especially /shop/search) feel responsive.
 * Without feedback, slow RSC transitions often feel like "I need to click twice".
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };

  useEffect(() => {
    clearTimers();
    setVisible(false);
    setWidth(0);
    return clearTimers;
  }, [pathname]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      let next: URL;
      try {
        next = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (next.origin !== window.location.origin) return;

      const current = `${window.location.pathname}${window.location.search}`;
      const destination = `${next.pathname}${next.search}`;
      if (current === destination) return;

      clearTimers();
      setVisible(true);
      setWidth(18);
      timers.current.push(window.setTimeout(() => setWidth(55), 80));
      timers.current.push(window.setTimeout(() => setWidth(78), 400));
      timers.current.push(
        window.setTimeout(() => {
          setWidth(100);
          timers.current.push(
            window.setTimeout(() => {
              setVisible(false);
              setWidth(0);
            }, 220),
          );
        }, 8000),
      );
    };

    document.addEventListener("click", onClickCapture, true);
    return () => {
      document.removeEventListener("click", onClickCapture, true);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
