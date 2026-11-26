import type { ReplyDraft } from "@/lib/reply-tool";

type Risk = ReplyDraft["risk"];

const STYLE: Record<Risk, { dot: string; text: string; strip: string }> = {
  ready: { dot: "bg-sage", text: "text-sage", strip: "bg-sage/[0.09] border-sage/25" },
  flag: { dot: "bg-lamp", text: "text-lamp", strip: "bg-lamp/[0.08] border-lamp/25" },
  escalate: { dot: "bg-wine", text: "text-wine", strip: "bg-wine/[0.09] border-wine/30" },
};

/** Labels name the restaurant's own owner (e.g. "Hold for Julien"). */
export function riskMeta(risk: Risk, owner: string) {
  const labels: Record<Risk, { label: string; short: string }> = {
    ready: { label: "Ready to post", short: "Ready" },
    flag: { label: `Post it, then tell ${owner}`, short: `Tell ${owner}` },
    escalate: { label: `Hold for ${owner}`, short: "Hold" },
  };
  return { ...STYLE[risk], ...labels[risk] };
}
