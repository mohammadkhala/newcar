"use client";

import { useState } from "react";

type FaqItem = { question: string; answer: string };

export function FaqsAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <div className="store-card py-16 text-center text-secondary/40">
        <div className="mb-3 text-4xl">🔍</div>
        <p className="text-sm font-semibold">لا توجد أسئلة شائعة حالياً</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <li key={i} className={`overflow-hidden rounded-2xl border transition-all duration-200 ${open ? "border-primary/30 shadow-md" : "border-border-soft bg-white shadow-sm"}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className={`flex w-full items-center gap-4 px-5 py-4 text-start transition-colors ${open ? "bg-primary/5" : "bg-white hover:bg-gray-50"}`}
            >
              {/* Number badge */}
              <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition-colors ${open ? "bg-primary text-black" : "bg-surface-muted text-secondary/50"}`}>
                {i + 1}
              </span>
              <span className={`flex-1 text-sm font-bold leading-snug ${open ? "text-primary" : "text-secondary"}`}>
                {item.question}
              </span>
              <span className={`shrink-0 text-xl leading-none transition-transform duration-200 ${open ? "rotate-45 text-primary" : "text-secondary/30"}`}>
                +
              </span>
            </button>
            {open && (
              <div className="border-t border-primary/10 bg-white px-5 pb-5 pt-4">
                <div
                  className="prose prose-sm max-w-none text-secondary/70 [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:ps-5"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
