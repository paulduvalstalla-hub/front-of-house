import type { StatusLevel } from "@/components/status";
import type { ReplyDraft } from "@/lib/reply-tool";

type Risk = ReplyDraft["risk"];

// The agent's risk levels map onto the shared status icons (check, exclamation, pause).
const LEVEL: Record<Risk, StatusLevel> = {
  ready: "ready",
  flag: "tell",
  escalate: "hold",
};

/** Labels name the restaurant's own owner (e.g. "Hold for Julien"). */
export function riskMeta(risk: Risk, owner: string) {
  const labels: Record<Risk, { label: string; short: string }> = {
    ready: { label: "Ready to post", short: "Ready" },
    flag: { label: `Post it, then tell ${owner}`, short: `Tell ${owner}` },
    escalate: { label: `Hold for ${owner}`, short: "Hold" },
  };
  return { level: LEVEL[risk], ...labels[risk] };
}
