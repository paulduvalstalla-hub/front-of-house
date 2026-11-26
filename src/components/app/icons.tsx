import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const InboxIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2 9.5 3.6 3.6A1.5 1.5 0 0 1 5 2.5h6a1.5 1.5 0 0 1 1.4 1.1L14 9.5" />
    <path d="M2 9.5h3.2l1 1.6h3.6l1-1.6H14V12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12Z" />
  </svg>
);
export const ChartIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2.5 13.5h11" />
    <path d="M4.5 11V7.5M8 11V4M11.5 11V8.5" />
  </svg>
);
export const PlugIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 2v3M10 2v3M4.5 5h7v2.5a3.5 3.5 0 0 1-7 0Z" />
    <path d="M8 11v3" />
  </svg>
);
export const VoiceIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 3.5h10v7H7.5L4.5 13v-2.5H3Z" />
    <path d="M5.5 6.2h5M5.5 8.2h3" />
  </svg>
);
export const QuillIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 3c-4 0-7.5 3-8.5 8L3 13.5" />
    <path d="M13 3c0 3.5-2.5 6.5-6.8 7.4" />
    <path d="M6.6 7.6h3.6" />
  </svg>
);
export const CardIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
    <path d="M2 6.5h12M4.5 10h2.5" />
  </svg>
);
export const ExitIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6.5 13.5h-3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6.5" />
  </svg>
);
export const LayersIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m8 2.5 5.5 3L8 8.5l-5.5-3Z" />
    <path d="m2.5 8 5.5 3 5.5-3M2.5 10.5l5.5 3 5.5-3" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);
export const HoldIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M6.5 5.8v4.4M9.5 5.8v4.4" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
);
