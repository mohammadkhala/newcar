import type { ReactNode } from "react";
import "./globals.css";

type Props = {
  children: ReactNode;
};

/**
 * Root pass-through: locale-specific html/body live under app/[locale]/layout.tsx (next-intl).
 * Globals are imported here too so the stylesheet is always in the document module graph.
 */
export default function RootLayout({ children }: Props) {
  return children;
}
