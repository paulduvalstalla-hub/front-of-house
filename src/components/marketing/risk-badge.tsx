import { StatusLabel } from "@/components/status";

export type Risk = "ready" | "tell" | "hold";

const LABEL: Record<Risk, string> = {
  ready: "Ready to post",
  tell: "Tell the owner",
  hold: "Hold for owner",
};

/** Review status for the marketing mocks: icon plus plain text, same as the app. */
export function RiskBadge({ risk, className = "", size = 13 }: { risk: Risk; className?: string; size?: number }) {
  return (
    <StatusLabel level={risk} size={size} className={`text-micro text-smoke ${className}`}>
      {LABEL[risk]}
    </StatusLabel>
  );
}

export const RISK_LABEL = (risk: Risk) => LABEL[risk];
