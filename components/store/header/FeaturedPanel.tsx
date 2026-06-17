"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { CategoryTreeNode } from "@/lib/types";

type Props = {
  items: CategoryTreeNode[];
  initialId: number;
  onNavigate: () => void;
};

// Arrow pointing RIGHT (›) — in RTL this visually points toward the submenu
// which opens on the start side (right side of the screen)
const SubArrow = () => (
  <span aria-hidden className="shrink-0 text-base leading-none">›</span>
);

type ColProps = {
  items: CategoryTreeNode[];
  activeId: number | null;
  onHover: (id: number | null, hasKids: boolean) => void;
  onNavigate: () => void;
  bordered?: boolean;
};

function MenuColumn({ items, activeId, onHover, onNavigate, bordered }: ColProps) {
  return (
    <ul className={`min-w-[14rem] divide-y divide-gray-100 ${bordered ? "border-s border-gray-100" : ""}`}>
      {items.map((item) => {
        const hasKids = item.children.length > 0;
        const isActive = item.id === activeId;
        return (
          <li key={item.id}>
            <Link
              href={`/shop/categories/${item.id}`}
              onClick={onNavigate}
              onMouseEnter={() => onHover(item.id, hasKids)}
              className={`flex min-h-[3rem] items-center justify-between gap-3 px-5 text-[0.95rem] font-semibold transition-colors ${
                isActive
                  ? "bg-amber-50 text-primary"
                  : "text-secondary hover:bg-gray-50"
              }`}
            >
              <span className="flex-1 truncate">{item.name}</span>
              {hasKids && (
                <span className={isActive ? "text-primary" : "text-secondary/30"}>
                  <SubArrow />
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function FeaturedPanel({ items, initialId, onNavigate }: Props) {
  const [hoveredL2Id, setHoveredL2Id] = useState<number | null>(null);
  const [hoveredL3Id, setHoveredL3Id] = useState<number | null>(null);

  useEffect(() => {
    setHoveredL2Id(null);
    setHoveredL3Id(null);
  }, [initialId]);

  const activeNode = items.find((n) => n.id === initialId);
  const l2Items = activeNode?.children ?? [];
  const hoveredL2 = l2Items.find((c) => c.id === hoveredL2Id);
  const l3Items = hoveredL2?.children ?? [];
  const hoveredL3 = l3Items.find((c) => c.id === hoveredL3Id);
  const l4Items = hoveredL3?.children ?? [];

  return (
    <div className="flex overflow-hidden rounded-2xl border border-border-soft bg-white shadow-2xl">
      {/* Level 2 */}
      {l2Items.length > 0 && (
        <MenuColumn
          items={l2Items}
          activeId={hoveredL2Id}
          onHover={(id, hasKids) => {
            setHoveredL2Id(hasKids ? id : null);
            setHoveredL3Id(null);
          }}
          onNavigate={onNavigate}
        />
      )}

      {/* Level 3 */}
      {l3Items.length > 0 && (
        <MenuColumn
          items={l3Items}
          activeId={hoveredL3Id}
          onHover={(id, hasKids) => setHoveredL3Id(hasKids ? id : null)}
          onNavigate={onNavigate}
          bordered
        />
      )}

      {/* Level 4 */}
      {l4Items.length > 0 && (
        <MenuColumn
          items={l4Items}
          activeId={null}
          onHover={() => {}}
          onNavigate={onNavigate}
          bordered
        />
      )}

      {/* Fallback when no children */}
      {l2Items.length === 0 && (
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
