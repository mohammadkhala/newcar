"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { CategoryTreeNode } from "@/lib/types";

type Props = {
  node: CategoryTreeNode;
  onNavigate: () => void;
};

const ROW =
  "flex min-h-[3rem] w-full items-center justify-between gap-2 px-5 py-2 text-[1rem] font-semibold tracking-tight transition-colors";

export function FeaturedPanel({ node, onNavigate }: Props) {
  const [selectedPath, setSelectedPath] = useState<number[]>([]);

  const columns: Array<{
    level: number;
    title: string;
    parentId: number;
    items: CategoryTreeNode[];
    selectedId: number | null;
  }> = [];

  let cursor = node.children;
  let title = node.name;
  let parentId = node.id;
  let level = 0;
  while (cursor.length > 0 && level < 5) {
    const selectedId = selectedPath[level] ?? null;
    columns.push({ level, title, parentId, items: cursor, selectedId });
    if (!selectedId) break;
    const selected = cursor.find((it) => it.id === selectedId);
    if (!selected || selected.children.length === 0) break;
    title = selected.name;
    parentId = selected.id;
    cursor = selected.children;
    level += 1;
  }

  const selectAtLevel = (targetLevel: number, itemId: number) => {
    setSelectedPath((prev) => {
      const next = prev.slice(0, targetLevel);
      next[targetLevel] = itemId;
      return next;
    });
  };

  return (
    <div className="w-[min(96vw,64rem)] overflow-hidden border border-border-soft bg-white shadow-2xl">
      <div className="flex divide-x divide-border-soft rtl:divide-x-reverse">
        {columns.map((col) => (
          <section
            key={col.level}
            className={col.level === 0 ? "w-60 shrink-0" : "min-w-[13rem] flex-1"}
          >
            {/* Column header */}
            <div className="flex min-h-[3rem] items-center justify-between gap-2 border-b border-border-soft px-5 py-2.5">
              <Link
                href={`/shop/categories/${col.parentId}`}
                onClick={onNavigate}
                className="text-sm font-black text-secondary hover:text-primary transition-colors"
              >
                {col.title}
              </Link>
              {col.level > 0 && (
                <Link
                  href={`/shop/categories/${col.parentId}`}
                  onClick={onNavigate}
                  className="shrink-0 rounded bg-[#EAB308] px-2.5 py-1 text-xs font-bold text-black transition hover:brightness-105"
                >
                  تسوق الكل
                </Link>
              )}
            </div>

            {/* Items list */}
            <ul className="max-h-[22rem] overflow-y-auto [scrollbar-color:var(--color-border-soft)_transparent] [scrollbar-width:thin]">
              {col.items.map((item) => {
                const active = col.selectedId === item.id;
                const hasChildren = item.children.length > 0;

                if (hasChildren) {
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selectAtLevel(col.level, item.id)}
                        className={`${ROW} ${
                          active
                            ? "text-[#EAB308]"
                            : "text-secondary/60 hover:bg-surface-muted hover:text-secondary"
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        <span
                          aria-hidden
                          className={`shrink-0 text-base leading-none ${
                            active ? "text-[#EAB308]" : "text-secondary/30"
                          }`}
                        >
                          ‹
                        </span>
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Link
                      href={`/shop/categories/${item.id}`}
                      onClick={onNavigate}
                      className={`${ROW} text-secondary/60 hover:bg-surface-muted hover:text-secondary`}
                    >
                      <span className="truncate">{item.name}</span>
                      <span aria-hidden className="shrink-0 text-base leading-none text-secondary/30">
                        ‹
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
