"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Link to the home page that also works from the home page itself: Next treats
 * "/" → "/" (or "/#pricing" → "/") as a no-op, so we scroll back to the top and
 * drop the section hash. Cmd/Ctrl-click still opens a new tab.
 */
export function HomeLink({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Front of House home"
      className={className}
      onNavigate={(e) => {
        if (window.location.pathname !== "/") return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        if (window.location.hash) window.history.replaceState(null, "", "/");
      }}
    >
      {children}
    </Link>
  );
}
