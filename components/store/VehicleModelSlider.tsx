"use client";

import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import type { VehicleModelRow } from "@/lib/types";

type Props = {
  models: VehicleModelRow[];
  activeModelId?: string;
  /** Other active query params to preserve (vehicle_brand_id, sort_by, etc.) when switching models. */
  baseQuery: Record<string, string | undefined>;
};

function modelHref(
  baseQuery: Record<string, string | undefined>,
  modelId: number | null,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(baseQuery)) {
    if (v && k !== "vehicle_model_id" && k !== "vehicle_year_id" && k !== "offset") {
      q.set(k, v);
    }
  }
  if (modelId !== null) {
    q.set("vehicle_model_id", String(modelId));
  }
  q.set("offset", "1");
  return `/shop/search?${q.toString()}`;
}

/**
 * Generic car silhouette placeholder — vehicle models have no uploaded photo in the API,
 * so this stands in for every model card instead of a broken/missing image.
 */
function CarGlyph() {
  return (
    <svg viewBox="0 0 64 40" aria-hidden className="h-10 w-16 text-secondary/40">
      <path
        fill="currentColor"
        d="M8 28a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm40 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM4 26l4-10c1-3 4-6 8-6h20c4 0 7 2 9 5l5 9 6 1c2 .5 4 2 4 5v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a4 4 0 0 1 2-4Zm14-16-3 8h13v-8H18Zm14 0v8h11l-4-6c-1-1.5-3-2-5-2h-2Z"
      />
    </svg>
  );
}

/**
 * Horizontal scrollable strip of vehicle models for the active brand (e.g. all Mercedes
 * model lines) — quick shortcuts to refine the product search by model.
 */
export function VehicleModelSlider({ models, activeModelId, baseQuery }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (models.length === 0) {
    return null;
  }

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="store-card relative overflow-hidden p-3 md:p-4">
      <button
        type="button"
        onClick={() => scrollBy(-280)}
        aria-hidden
        tabIndex={-1}
        className="absolute start-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white text-secondary shadow-sm hover:bg-surface-muted md:flex"
      >
        ‹
      </button>
      <div
        ref={scrollerRef}
        className="flex snap-x gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {models.map((model) => {
          const active = activeModelId === String(model.id);
          return (
            <Link
              key={model.id}
              href={modelHref(baseQuery, active ? null : model.id)}
              className={`flex shrink-0 snap-start flex-col items-center gap-1 rounded-xl border px-4 py-2 transition-colors ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border-soft bg-white hover:border-primary/30"
              }`}
            >
              <CarGlyph />
              <span
                className={`whitespace-nowrap text-xs font-semibold ${
                  active ? "text-primary" : "text-secondary"
                }`}
              >
                {model.name}
              </span>
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(280)}
        aria-hidden
        tabIndex={-1}
        className="absolute end-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white text-secondary shadow-sm hover:bg-surface-muted md:flex"
      >
        ›
      </button>
    </div>
  );
}
