"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { CategoryTreeNode } from "@/lib/types";

type Props = {
  items: CategoryTreeNode[];
  initialId: number;
  onNavigate: () => void;
};

export function FeaturedPanel({ items, initialId, onNavigate }: Props) {
  const [hoveredL2Id, setHoveredL2Id] = useState<number | null>(null);

  useEffect(() => {
    setHoveredL2Id(null);
  }, [initialId]);

  const activeNode = items.find((n) => n.id === initialId);
  const l2Children = activeNode?.children ?? [];
  const hoveredL2 = l2Children.find((c) => c.id === hoveredL2Id);
  const l3Children = hoveredL2?.children ?? [];

  return (
    <div className="flex overflow-hidden rounded-2xl border border-border-soft bg-white shadow-2xl">
      {/* Level 2 — direct children */}
      {l2Children.length > 0 && (
        <ul className="min-w-[14rem] divide-y divide-gray-100">
          {l2Children.map((item) => {
            const hasKids = item.children.length > 0;
            const isActive = item.id === hoveredL2Id;
            return (
              <li key={item.id}>
                <Link
                  href={`/shop/categories/${item.id}`}
                  onClick={onNavigate}
                  onMouseEnter={() => setHoveredL2Id(hasKids ? item.id : null)}
                  className={`flex min-h-[3rem] items-center justify-between gap-3 px-5 text-[0.95rem] font-semibold transition-colors ${
                    isActive
                      ? "bg-amber-50 text-primary"
                      : "text-secondary hover:bg-gray-50"
                  }`}
                >
                  <span className="flex-1 truncate">{item.name}</span>
                  {hasKids && (
                    <span aria-hidden className="shrink-0 text-base leading-none text-secondary/30">
                      ‹
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Level 3 — shown when a L2 item with children is hovered */}
      {l3Children.length > 0 && (
        <ul className="min-w-[14rem] divide-y divide-gray-100 border-s border-gray-100">
          {l3Children.map((item) => (
            <li key={item.id}>
              <Link
                href={`/shop/categories/${item.id}`}
                onClick={onNavigate}
                className="flex min-h-[3rem] items-center justify-between gap-3 px-5 text-[0.95rem] font-semibold text-secondary transition-colors hover:bg-gray-50"
              >
                <span className="flex-1 truncate">{item.name}</span>
                {item.children.length > 0 && (
                  <span aria-hidden className="shrink-0 text-base leading-none text-secondary/30">
                    ‹
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Fallback: top-level link when no children */}
      {l2Children.length === 0 && (
        <div className="bg-white px-5 py-4 text-sm text-secondary/40">
          <Link
            href={`/shop/categories/${activeNode?.id ?? ""}`}
            onClick={onNavigate}
            className="font-semibold text-primary hover:underline"
          >
            تصفح الكل
          </Link>
        </div>
      )}
    </div>
  );
}
