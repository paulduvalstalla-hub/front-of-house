"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The phone menu. A native <details>, so it opens without JavaScript; once hydrated it
 * also closes when a link inside it is tapped, on Escape (focus returns to the button),
 * and on a tap anywhere outside it.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const close = () => {
      menu.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !menu.open) return;
      close();
      menu.querySelector("summary")?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (menu.open && !menu.contains(e.target as Node)) close();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    menu.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      menu.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <details ref={ref} className="relative md:hidden">
      {children}
    </details>
  );
}
