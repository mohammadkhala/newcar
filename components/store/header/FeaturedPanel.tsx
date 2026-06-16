"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { CategoryTreeNode } from "@/lib/types";

type Props = {
  node: CategoryTreeNode;
  onNavigate: () => void;
};

export function FeaturedPanel({ node, onNavigate }: Props) {
  const [selectedPath, setSelectedPath] = useState<number[]>([]);

  const listItemClass =
    "flex min-h-[3.2rem] w-full items-center justify-between gap-2 px-5 py-2 text-[1.06rem] font-semibold tracking-tight transition-colors";

  const columns: Array<{
    level: number;
    title: string;
    items: CategoryTreeNode[];
    selectedId: number | null;
  }> = [];

  let cursor = node.children;
  let title = node.name;
  let level = 0;
  while (cursor.length > 0 && level < 5) {
    const selectedId = selectedPath[level] ?? null;
    columns.push({
      level,
      title,
      items: cursor,
      selectedId,
    });
    if (!selectedId) break;
    const selectedNode = cursor.find((it) => it.id === selectedId);
    if (!selectedNode || selectedNode.children.length === 0) break;
    title = selectedNode.name;
    cursor = selectedNode.children;
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
    <div className="w-[min(96vw,74rem)] overflow-x-auto border border-border-soft bg-white shadow-lg">
      <div className="flex min-w-max divide-x divide-border-soft rtl:divide-x-reverse">
        {columns.map((col) => (
          <section key={col.level} className="min-w-[22rem]">
            <div className="border-b border-border-soft px-5 py-3.5">
              <p className="inline-flex items-center gap-2 text-[1.25rem] font-black text-secondary">
                <span aria-hidden className="text-sm">
                  ↖
                </span>
                <span>اذهب إلى {col.title}</span>
              </p>
            </div>
            <ul className="max-h-[24rem] overflow-y-auto">
              {col.items.map((item) => {
                const active = col.selectedId === item.id;
                const hasChildren = item.children.length > 0;
                if (hasChildren) {
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`${listItemClass} ${
                          active
                            ? "text-[#EAB308]"
                            : "text-secondary/45 hover:bg-surface-muted hover:text-secondary/80"
                        }`}
                        onClick={() => selectAtLevel(col.level, item.id)}
                      >
                        <span className="truncate">{item.name}</span>
                        <span
                          aria-hidden
                          className={active ? "text-[#EAB308]" : "text-secondary/40"}
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
                      className={`${listItemClass} text-secondary/45 hover:bg-surface-muted hover:text-secondary/80`}
                      onClick={onNavigate}
                    >
                      <span className="truncate">{item.name}</span>
                      <span aria-hidden className="text-secondary/40">
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
