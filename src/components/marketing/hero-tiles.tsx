import type { CSSProperties, ReactNode } from "react";
import styles from "./marketing.module.css";

/**
 * Small illustrated tiles that sit between the words of the hero headline,
 * the way Mobbin sets app icons inside its headline.
 */
function Tile({
  children,
  tilt,
  delay,
  label,
  tone = "night",
}: {
  children: ReactNode;
  tilt: number;
  delay: number;
  label: string;
  tone?: "night" | "lamp";
}) {
  const style = { "--tilt": `${tilt}deg`, animationDelay: `${delay}s` } as CSSProperties;
  return (
    <span
      role="img"
      aria-label={label}
      style={style}
      className={`${styles.tile} relative mx-[0.08em] inline-grid size-[0.8em] translate-y-[-0.06em] rotate-[var(--tilt)] place-items-center rounded-[0.2em] border align-middle ${
        tone === "lamp"
          ? "border-lamp/40 bg-[linear-gradient(160deg,#2f2a2a,#1c1a22)] shadow-[0_0_0.5em_rgb(242_182_109/0.35)]"
          : "border-line-strong bg-[linear-gradient(160deg,#252b3f,#161a28)] shadow-[0_0.18em_0.5em_rgb(0_0_0/0.45)]"
      }`}
    >
      {children}
    </span>
  );
}

export function StarTile({ delay = 0.25 }: { delay?: number }) {
  return (
    <Tile tilt={-7} delay={delay} label="a five-star rating">
      <svg viewBox="0 0 40 40" className="size-[64%]" aria-hidden>
        <path
          d="M20 5.5l4.3 9.1 9.9 1.2-7.3 6.8 1.9 9.8L20 27.6l-8.8 4.8 1.9-9.8-7.3-6.8 9.9-1.2z"
          fill="#f2b66d"
        />
        <path d="M20 5.5l4.3 9.1 9.9 1.2-7.3 6.8" fill="none" stroke="#ffd9a6" strokeWidth="1.2" opacity="0.7" />
      </svg>
    </Tile>
  );
}

export function ReplyTile({ delay = 0.38 }: { delay?: number }) {
  return (
    <Tile tilt={5} delay={delay} label="a reply">
      <svg viewBox="0 0 40 40" className="size-[68%]" aria-hidden>
        <path
          d="M8 10.5h24a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H18.5L12 33v-5.5H8a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3z"
          fill="#f3eee4"
        />
        <rect x="10" y="15.5" width="17" height="2.4" rx="1.2" fill="#10131c" opacity="0.55" />
        <rect x="10" y="20.5" width="12" height="2.4" rx="1.2" fill="#10131c" opacity="0.35" />
      </svg>
    </Tile>
  );
}

export function LampTile({ delay = 0.51 }: { delay?: number }) {
  return (
    <Tile tilt={-4} delay={delay} label="a pendant lamp" tone="lamp">
      <svg viewBox="0 0 40 40" className="size-[74%]" aria-hidden>
        <defs>
          <radialGradient id="lampGlow" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#ffd9a6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f2b66d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <line x1="20" y1="2" x2="20" y2="11" stroke="#a3a8b8" strokeWidth="1.4" />
        <path d="M10 21c0-5.5 4.5-10 10-10s10 4.5 10 10z" fill="#f2b66d" />
        <ellipse cx="20" cy="31" rx="13" ry="8" fill="url(#lampGlow)" />
        <circle cx="20" cy="22.5" r="2.4" fill="#fff3df" />
      </svg>
    </Tile>
  );
}
