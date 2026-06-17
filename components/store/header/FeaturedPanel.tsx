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
  const [activeId, setActiveId] = useState(initialId);

  useEffect(() => {
    setActiveId(initialId);
  }, [initialId]);

  const activeNode = items.find((n) => n.id === activeId);

  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft shadow-2xl">
      {/* Yellow tab bar */}
      <div className="flex overflow-x-auto bg-[#EAB308] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((node) => {
          const active = node.id === activeId;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveId(node.id)}
              className={`flex min-w-[6rem] flex-1 shrink-0 items-center justify-center px-4 py-3 text-sm font-black transition-colors ${
                active
                  ? "bg-black/15 text-white"
                  : "text-yellow-950/70 hover:text-yellow-950"
              }`}
            >
              {node.name}
            </button>
          );
        })}
      </div>

      {/* White item list */}
      {activeNode && activeNode.children.length > 0 ? (
        <ul className="max-h-[22rem] overflow-y-auto bg-white divide-y divide-gray-100 [scrollbar-color:var(--color-border-soft)_transparent] [scrollbar-width:thin]">
          {activeNode.children.map((item) => (
            <li key={item.id}>
              <Link
                href={`/shop/categories/${item.id}`}
                onClick={onNavigate}
                className="flex min-h-[3rem] items-center justify-between gap-3 px-5 text-[0.95rem] font-semibold text-secondary transition-colors hover:bg-gray-50"
              >
                <span aria-hidden className="shrink-0 text-base leading-none text-secondary/30">
                  ‹
                </span>
                <span className="flex-1 truncate text-end">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
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
