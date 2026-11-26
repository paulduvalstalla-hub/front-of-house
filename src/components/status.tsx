import type { ReactNode } from "react";

/**
 * Review status, shown as a small line icon plus plain text (no tinted pill).
 * The icon carries the colour; the words stay neutral.
 *   ready → check, tell → exclamation, hold → pause.
 */
export type StatusLevel = "ready" | "tell" | "hold";

const TONE: Record<StatusLevel, string> = {
  ready: "text-sage",
  tell: "text-lamp",
  hold: "text-wine",
};

export function StatusIcon({ level, size = 14, className = "" }: { level: StatusLevel; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${TONE[level]} ${className}`}
    >
      <circle cx="8" cy="8" r="6.25" />
      {level === "ready" && <path d="M5.4 8.2 7.2 10l3.4-3.7" />}
      {level === "tell" && (
        <>
          <path d="M8 4.9v3.5" />
          <circle cx="8" cy="10.9" r="0.4" fill="currentColor" />
        </>
      )}
      {level === "hold" && <path d="M6.6 5.9v4.2M9.4 5.9v4.2" />}
    </svg>
  );
}

export function StatusLabel({
  level,
  children,
  className = "",
  size,
}: {
  level: StatusLevel;
  children: ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${className}`}>
      <StatusIcon level={level} size={size} />
      {children}
    </span>
  );
}
