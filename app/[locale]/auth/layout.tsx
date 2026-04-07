import type { ReactNode } from "react";

/**
 * Centers auth forms in a card and reserves space above the mobile bottom tab bar.
 */
export default function AuthSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 pt-8 max-md:pb-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:pt-12 md:py-16">
      <div className="store-card border-border-soft p-6 shadow-md sm:p-8">{children}</div>
    </div>
  );
}
