"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { HeaderNavLabels, NavCategoryItem } from "@/components/store/header/types";
import type { CategoryTreeNode, LanguageOption, VehicleBrandsResponse } from "@/lib/types";

type Props = {
  menuOpen: boolean;
  labels: HeaderNavLabels;
  languageOptions: LanguageOption[] | null;
  navCategories: NavCategoryItem[];
  featuredNavItems: CategoryTreeNode[];
  vehicleBrands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
  onClose: () => void;
};

const ROW =
  "flex min-h-[3.25rem] w-full items-center justify-between gap-3 border-b border-gray-100 px-5 text-[0.95rem] font-semibold text-secondary transition-colors hover:bg-gray-50 active:bg-gray-100";

export function StoreHeaderMobileDrawer({
  menuOpen,
  labels,
  featuredNavItems,
  onClose,
}: Props) {
  const [activeTabId, setActiveTabId] = useState<number | null>(
    featuredNavItems[0]?.id ?? null,
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!menuOpen) return null;

  const activeNode = featuredNavItems.find((n) => n.id === activeTabId);

  return (
    <div className="fixed inset-0 z-[400] md:hidden" id="store-mobile-nav">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={labels.closeMenu}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute inset-y-0 start-0 flex w-[min(100%,22rem)] flex-col shadow-2xl">
        {/* Yellow tab bar */}
        <div className="flex shrink-0 overflow-x-auto bg-[#EAB308] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredNavItems.map((node) => {
            const active = activeTabId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  setActiveTabId(node.id);
                  setExpandedId(null);
                }}
                className={`flex min-w-[5rem] flex-1 shrink-0 items-center justify-center px-4 py-3.5 text-sm font-black transition-colors ${
                  active
                    ? "bg-black/15 text-white"
                    : "text-yellow-950/70 hover:text-yellow-950"
                }`}
              >
                {node.name}
              </button>
            );
          })}
          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.closeMenu}
            className="shrink-0 px-4 py-3 text-lg font-bold text-yellow-950/60 hover:text-yellow-950"
          >
            ✕
          </button>
        </div>

        {/* White content list */}
        <div className="flex-1 overflow-y-auto bg-white">
          {activeNode ? (
            <ul>
              {activeNode.children.map((item) => {
                const hasChildren = item.children.length > 0;
                const expanded = expandedId === item.id;

                if (hasChildren) {
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : item.id)
                        }
                        className={`${ROW} ${expanded ? "text-[#EAB308]" : ""}`}
                      >
                        <span
                          aria-hidden
                          className={`shrink-0 text-lg leading-none transition-transform ${
                            expanded
                              ? "rotate-90 text-[#EAB308]"
                              : "text-secondary/30"
                          }`}
                        >
                          ‹
                        </span>
                        <span className="flex-1 truncate text-end">
                          {item.name}
                        </span>
                      </button>
                      {expanded && (
                        <ul className="bg-gray-50">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/shop/categories/${child.id}`}
                                onClick={onClose}
                                className="flex min-h-[2.75rem] items-center justify-end border-b border-gray-100 px-8 text-sm text-secondary/80 hover:text-primary"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Link
                      href={`/shop/categories/${item.id}`}
                      onClick={onClose}
                      className={ROW}
                    >
                      <span
                        aria-hidden
                        className="shrink-0 text-lg leading-none text-secondary/30"
                      >
                        ‹
                      </span>
                      <span className="flex-1 truncate text-end">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center text-sm text-secondary/40">
              {labels.allCategories}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
