export type Risk = "ready" | "tell" | "hold";

const RISK: Record<Risk, { label: string; dot: string; text: string; bg: string }> = {
  ready: { label: "Ready to post", dot: "bg-sage", text: "text-sage", bg: "bg-sage/10" },
  tell: { label: "Tell the owner", dot: "bg-lamp", text: "text-lamp", bg: "bg-lamp/10" },
  hold: { label: "Hold for owner", dot: "bg-wine", text: "text-wine", bg: "bg-wine/10" },
};

export function RiskBadge({ risk, className = "" }: { risk: Risk; className?: string }) {
  const r = RISK[risk];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[3px] text-[11.5px] font-medium ${r.bg} ${r.text} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${r.dot}`} />
      {r.label}
    </span>
  );
}

export const RISK_LABEL = (risk: Risk) => RISK[risk].label;
