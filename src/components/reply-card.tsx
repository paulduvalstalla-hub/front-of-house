"use client";

import { useState } from "react";
import type { ReplyDraft } from "@/lib/reply-tool";

// While the tool input streams in, any field (or array item) may still be missing.
export type LooseDraft = {
  [K in keyof ReplyDraft]?: ReplyDraft[K] extends (infer U)[] ? (U | undefined)[] : ReplyDraft[K];
};

const RISK = {
  ready: {
    label: "Ready to post",
    strip: "bg-sage",
    dot: "bg-sage-deep",
  },
  flag: {
    label: "Post it, and tell Julien",
    strip: "bg-butter",
    dot: "bg-butter-deep",
  },
  escalate: {
    label: "Hold — Julien sees this first",
    strip: "bg-rose",
    dot: "bg-rose-deep",
  },
} as const;

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5 stars`} className="tracking-[0.08em] text-ink">
      {"★".repeat(value)}
      <span className="text-line">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`block h-3.5 rounded-full bg-paper-deep ${className}`} />;
}

export function ReplyCard({
  draft,
  streaming,
}: {
  draft: LooseDraft;
  streaming: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const risk = draft.risk ? RISK[draft.risk] : null;
  const praised = (draft.praised ?? []).filter(Boolean) as string[];
  const problems = (draft.problems ?? []).filter(Boolean) as string[];
  const words = draft.reply ? draft.reply.trim().split(/\s+/).length : 0;

  async function copy() {
    if (!draft.reply) return;
    try {
      await navigator.clipboard.writeText(draft.reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[22px] border border-line bg-white">
      <header
        className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3.5 ${
          risk ? risk.strip : "bg-paper-deep"
        }`}
      >
        <span className="flex items-center gap-2 text-[14.5px] font-medium">
          <span className={`size-2 rounded-full ${risk ? risk.dot : "bg-ink-faint"}`} />
          {risk ? risk.label : "Drafting…"}
        </span>
        {draft.riskReason && (
          <span className="text-[13.5px] leading-snug text-ink-soft">{draft.riskReason}</span>
        )}
      </header>

      <div className="space-y-6 px-5 pb-5 pt-4 sm:px-6">
        <section aria-label="The read" className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-soft">
            {typeof draft.stars === "number" ? (
              <Stars value={draft.stars} />
            ) : draft.stars === null ? (
              <span>No rating</span>
            ) : null}
            {draft.platform && <span>{draft.platform}</span>}
            {draft.language && <span>{draft.language}</span>}
            {draft.sentiment && (
              <span className="rounded-full border border-line px-2 py-0.5 text-[12.5px] capitalize">
                {draft.sentiment}
              </span>
            )}
          </div>
          {(praised.length > 0 || problems.length > 0) && (
            <ul className="flex flex-wrap gap-1.5">
              {praised.map((p, i) => (
                <li key={`p${i}`} className="rounded-full bg-sage px-2.5 py-1 text-[13px]">
                  {p}
                </li>
              ))}
              {problems.map((p, i) => (
                <li key={`x${i}`} className="rounded-full bg-rose px-2.5 py-1 text-[13px]">
                  {p}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Draft reply">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-faint">
              Draft reply
            </h3>
            {words > 0 && <span className="text-[12.5px] text-ink-faint">{words} words</span>}
          </div>
          {draft.reply ? (
            <p className="whitespace-pre-wrap font-serif text-[18px] leading-[1.62] tracking-[-0.005em] text-ink">
              {draft.reply}
            </p>
          ) : (
            <div className="space-y-2.5 py-1">
              <Skeleton className="w-[92%]" />
              <Skeleton className="w-[86%]" />
              <Skeleton className="w-[64%]" />
            </div>
          )}
          {!streaming && draft.reply && (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={copy}
                className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-paper transition hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {copied ? "Copied" : "Copy reply"}
              </button>
              <span className="text-[13px] text-ink-faint">You post it — nothing is published automatically.</span>
            </div>
          )}
        </section>

        {(draft.managerNote || streaming) && (
          <section aria-label="Note for the manager" className="rounded-2xl bg-butter-soft px-4 py-3.5">
            <h3 className="mb-1 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">
              For Camille only · not posted
            </h3>
            {draft.managerNote ? (
              <p className="text-[14.5px] leading-relaxed text-ink">{draft.managerNote}</p>
            ) : (
              <Skeleton className="mt-2 w-3/4 bg-butter" />
            )}
          </section>
        )}
      </div>
    </article>
  );
}
