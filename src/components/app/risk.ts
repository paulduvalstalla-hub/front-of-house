import type { ReplyDraft } from "@/lib/reply-tool";

export const RISK_META: Record<
  ReplyDraft["risk"],
  { label: string; short: string; dot: string; text: string; strip: string }
> = {
  ready: {
    label: "Ready to post",
    short: "Ready",
    dot: "bg-sage",
    text: "text-sage",
    strip: "bg-sage/[0.09] border-sage/25",
  },
  flag: {
    label: "Post it, then tell Julien",
    short: "Tell Julien",
    dot: "bg-lamp",
    text: "text-lamp",
    strip: "bg-lamp/[0.08] border-lamp/25",
  },
  escalate: {
    label: "Hold for Julien",
    short: "Hold",
    dot: "bg-wine",
    text: "text-wine",
    strip: "bg-wine/[0.09] border-wine/30",
  },
};
