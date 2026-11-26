import type { Platform } from "@/lib/demo-reviews";

/**
 * The service bell: a review rings, the restaurant answers. Drawn on a 48-unit
 * grid; the same geometry is in app/icon.svg, the favicon and the share image.
 * The plunger is the brand's one warm light.
 */
export function BellMark({ size = 24, glow = true, className = "" }: { size?: number; glow?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={`shrink-0 ${className}`}>
      <rect x="5" y="37" width="38" height="5" rx="2.5" className="fill-linen" />
      <path d="M9 35 A15 15 0 0 1 39 35 Z" className="fill-linen" />
      <rect x="22.5" y="15" width="3" height="6" className="fill-linen" />
      <circle
        cx="24"
        cy="13"
        r="4"
        className="fill-lamp"
        style={glow ? { filter: "drop-shadow(0 0 3px rgb(242 182 109 / 0.75))" } : undefined}
      />
      <path d="M12.5 8 L16 11.5 M35.5 8 L32 11.5" className="stroke-lamp" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Wordmark: the bell sits on the baseline beside the serif name. */
export function Logo({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <span
      className={`inline-flex items-baseline gap-[0.34em] whitespace-nowrap font-serif tracking-[-0.03em] text-linen ${className}`}
      style={{ fontSize: size }}
    >
      {/* An inline SVG's baseline is its bottom edge; the drawing leaves 6/48 empty below the
          bell's base, so shift it down by that much to set the base on the text baseline. */}
      <BellMark size={Math.round(size * 1.32)} className="translate-y-[0.16em]" />
      Front of House
    </span>
  );
}

// One colour per platform everywhere (badges and charts). The chart hues are a
// validated categorical set on the night surface: blue, orange, aqua, yellow.
export const PLATFORM_COLOR: Record<Platform, string> = {
  Google: "#3987e5",
  Yelp: "#d95926",
  TripAdvisor: "#199e70",
  OpenTable: "#c98500",
};

const PLATFORM_STYLE: Record<Platform, { letter: string; tint: string; ink: string }> = {
  Google: { letter: "G", tint: "rgb(57 135 229 / 0.18)", ink: "#86b6ef" },
  TripAdvisor: { letter: "T", tint: "rgb(25 158 112 / 0.18)", ink: "#5fd0a6" },
  Yelp: { letter: "Y", tint: "rgb(217 89 38 / 0.2)", ink: "#f2936b" },
  OpenTable: { letter: "O", tint: "rgb(201 133 0 / 0.2)", ink: "#e8b54a" },
};

/** Neutral monogram badge for a review platform (not the platform's logo). */
export function PlatformMark({ platform, size = 22 }: { platform: Platform; size?: number }) {
  const s = PLATFORM_STYLE[platform];
  return (
    <span
      aria-label={platform}
      title={platform}
      className="inline-grid shrink-0 place-items-center rounded-[7px] font-sans font-semibold"
      style={{ width: size, height: size, background: s.tint, color: s.ink, fontSize: size * 0.5 }}
    >
      {s.letter}
    </span>
  );
}

export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const v = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <span aria-label={`${v} out of 5 stars`} className={`tracking-[0.06em] ${className}`}>
      <span className="text-lamp">{"★".repeat(v)}</span>
      <span className="text-linen/15">{"★".repeat(5 - v)}</span>
    </span>
  );
}
