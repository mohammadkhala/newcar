"use client";

import { useState } from "react";

type Props = {
  name: string;
  options: { id: string | number; label: string }[];
  defaultValue: string[];
};

export function MultiSelectPills({ name, options, defaultValue }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultValue));

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  return (
    <div>
      <input type="hidden" name={name} value={Array.from(selected).join(",")} />
      <div className="flex flex-wrap gap-2 pt-1">
        {options.map((opt) => {
          const id = String(opt.id);
          const isSelected = selected.has(id);
          return (
            <button
              key={id}
              type="button"
              suppressHydrationWarning
              onClick={() => toggle(id)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold transition-colors focus:outline-none focus-visible:ring-2 ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border-soft bg-surface-muted text-secondary hover:border-primary/40 hover:bg-white"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
