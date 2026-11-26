"use client";

import { useChat } from "@ai-sdk/react";
import { useState, type FormEvent } from "react";
import { StatusIcon } from "@/components/status";
import type { DemoReview } from "@/lib/demo-reviews";
import type { ReplyDraft } from "@/lib/reply-tool";
import { useDesk, type DeskMessage } from "./desk-store";
import { CheckIcon, HoldIcon } from "./icons";
import { ListingPreview } from "./listing-preview";
import { riskMeta } from "./risk";
import { useNow } from "./use-now";

const REVISIONS = [
  { label: "Shorter", prompt: "Make the reply shorter." },
  { label: "Warmer", prompt: "Make the reply a little warmer and more personal." },
  { label: "More formal", prompt: "Make the reply more formal." },
  { label: "In French", prompt: "Rewrite the reply in French." },
];

type LooseDraft = Partial<Omit<ReplyDraft, "praised" | "problems">> & {
  praised?: (string | undefined)[];
  problems?: (string | undefined)[];
};

function latest(messages: DeskMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    let draft: LooseDraft | undefined;
    let text = "";
    for (const part of m.parts) {
      if (part.type === "tool-fileReply" && part.state !== "output-error") draft = (part.input ?? {}) as LooseDraft;
      if (part.type === "text") text += part.text;
    }
    return { draft, text: text.trim() };
  }
  return { draft: undefined, text: "" };
}

function lastInstruction(messages: DeskMessage[]) {
  const users = messages.filter((m) => m.role === "user");
  if (users.length < 2) return null;
  const last = users[users.length - 1];
  return last.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function Skeleton({ w }: { w: string }) {
  return <span className="skeleton block h-3 rounded-full" style={{ width: w }} />;
}

export function DraftPanel({ review }: { review: DemoReview }) {
  const desk = useDesk();
  const chat = desk.getChat(review.id);
  const { messages, status, sendMessage, stop } = useChat({ chat });
  const record = desk.records[review.id] ?? { status: "new" as const };
  const busy = status === "submitted" || status === "streaming";
  const now = useNow(1000);

  const live = latest(messages);
  const draft: LooseDraft | undefined = live.draft ?? record.draft;
  const note = live.text || record.note;
  const [edited, setEdited] = useState<{ base: string; text: string } | null>(null);
  const [ask, setAsk] = useState("");
  // An edit only applies to the draft it was made on; a new draft resets it.
  const replyText = edited && edited.base === draft?.reply ? edited.text : (draft?.reply ?? "");
  const words = replyText.trim() ? replyText.trim().split(/\s+/).length : 0;
  const instruction = lastInstruction(messages);

  function revise(text: string) {
    if (busy || !text.trim()) return;
    desk.holdAutoPost(review.id);
    sendMessage({ text: text.trim() });
    setAsk("");
  }
  function onAsk(e: FormEvent) {
    e.preventDefault();
    revise(ask);
  }

  // Already answered: show the reply as guests see it on the platform.
  if (record.status === "replied" && record.posted) {
    const auto = record.postedBy === "autopilot";
    return (
      <section aria-label="Posted reply" className="rounded-[var(--radius-window)] border border-line bg-night-2">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-line px-5 py-3 text-[13.5px]">
          <CheckIcon className="text-sage" />
          <span className="text-linen">Live on {review.platform}</span>
          <span className="text-smoke-2">
            {auto ? "Posted automatically by Front of House" : "Posted"}
            {record.postedAt
              ? `, ${new Date(record.postedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
              : ""}
          </span>
        </header>
        <div className="px-5 py-5">
          <ListingPreview
            review={review}
            reply={record.posted}
            postedAt={record.postedAt}
            now={now || record.postedAt || 0}
            workspace={desk.workspace}
          />
          <p className="mt-2.5 text-[12px] text-smoke-2">
            How the reply appears on {review.platform}. In this prototype the {review.platform} connection is simulated.
          </p>
        </div>
        <div className="border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() => desk.reopen(review.id)}
            className="rounded-lg px-3 py-1.5 text-[13.5px] text-smoke hover:bg-night-3 hover:text-linen"
          >
            Edit reply
          </button>
        </div>
      </section>
    );
  }

  // Nothing drafted yet, but the agent is on: it is next in the queue.
  if (!draft && !busy && !note && desk.agentOn && !record.error) {
    return (
      <section className="rounded-[var(--radius-window)] border border-line bg-night-2 px-5 py-4">
        <p className="flex items-center gap-2 text-[14px] text-linen">
          Front of House is reading this review
          <span className="dot-pulse inline-flex gap-1" aria-hidden>
            <span className="size-1 rounded-full bg-smoke" />
            <span className="size-1 rounded-full bg-smoke" />
            <span className="size-1 rounded-full bg-smoke" />
          </span>
        </p>
        <div className="mt-4 space-y-2.5 rounded-xl bg-night px-4 py-4">
          <Skeleton w="94%" />
          <Skeleton w="88%" />
          <Skeleton w="60%" />
        </div>
      </section>
    );
  }

  // Nothing drafted yet.
  if (!draft && !busy && !note) {
    return (
      <section className="rounded-[var(--radius-window)] border border-dashed border-line-strong px-6 py-8 text-center">
        <p className="font-serif text-[22px] tracking-[-0.01em]">No draft yet</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[14px] text-smoke">
          Front of House reads the review, checks it against your brand voice and reply policy, and drafts a reply for you
          to approve.
        </p>
        {record.error && <p className="mt-3 text-[13.5px] text-wine">{record.error}</p>}
        <button
          type="button"
          onClick={() => desk.draftReview(review.id)}
          className="mt-5 rounded-lg bg-linen px-5 py-2.5 text-[14px] font-medium text-night hover:bg-white"
        >
          Draft a reply
        </button>
      </section>
    );
  }

  // The agent answered in words (e.g. it declined) and there is no draft.
  if (!draft && !busy && note) {
    return (
      <section className="rounded-[var(--radius-window)] border border-line bg-night-2 px-5 py-4">
        <p className="text-[13px] text-smoke-2">Front of House</p>
        <p className="mt-1 font-serif text-[17px] leading-[1.55]">{note}</p>
      </section>
    );
  }

  const owner = desk.workspace.owner;
  const risk = draft?.risk ? riskMeta(draft.risk, owner) : null;
  const praised = (draft?.praised ?? []).filter(Boolean).slice(0, 4) as string[];
  const problems = (draft?.problems ?? []).filter(Boolean).slice(0, 4) as string[];
  const escalate = draft?.risk === "escalate";
  const withOwner = record.status === "with-owner";
  const secondsLeft =
    record.autoPostAt && record.status === "drafted" && !busy && now
      ? Math.max(0, Math.ceil((record.autoPostAt - now) / 1000))
      : null;

  return (
    <section aria-label="Draft reply" className="overflow-hidden rounded-[var(--radius-window)] border border-line bg-night-2">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-5 py-3">
        <span className="flex items-center gap-2 text-[14px] font-medium">
          {withOwner ? (
            <StatusIcon level="hold" size={15} />
          ) : risk ? (
            <StatusIcon level={risk.level} size={15} />
          ) : (
            <span className="size-2 rounded-full bg-smoke-2" />
          )}
          {withOwner ? `Waiting for ${owner}` : risk ? risk.label : "Drafting"}
          {busy && (
            <span className="dot-pulse ml-1 inline-flex gap-1" aria-hidden>
              <span className="size-1 rounded-full bg-smoke" />
              <span className="size-1 rounded-full bg-smoke" />
              <span className="size-1 rounded-full bg-smoke" />
            </span>
          )}
        </span>
        {draft?.riskReason && <span className="text-[13px] text-smoke">{draft.riskReason}</span>}
      </header>

      {secondsLeft !== null && draft?.reply && (
        <div
          aria-live="polite"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-sage/[0.07] px-5 py-2.5 text-[13.5px]"
        >
          <span className="relative flex size-2">
            <span className="live-ping absolute inline-flex size-full rounded-full bg-sage" />
            <span className="relative inline-flex size-2 rounded-full bg-sage" />
          </span>
          <span className="flex-1 text-linen">
            Autopilot posts this to {review.platform} in <span className="tabular-nums">{secondsLeft}</span> s
          </span>
          <button
            type="button"
            onClick={() => desk.approve(review.id, replyText)}
            className="rounded-lg bg-linen px-3 py-1 text-[13px] font-medium text-night hover:bg-white"
          >
            Post now
          </button>
          <button
            type="button"
            onClick={() => desk.holdAutoPost(review.id)}
            className="rounded-lg px-2.5 py-1 text-[13px] text-smoke hover:bg-night-3 hover:text-linen"
          >
            Stop, I&rsquo;ll check it
          </button>
        </div>
      )}

      <div className="space-y-5 px-5 py-4">
        {(praised.length > 0 || problems.length > 0) && (
          <dl aria-label="What the guest mentioned" className="space-y-1 text-[13px] leading-snug">
            {praised.length > 0 && (
              <div className="flex gap-2">
                <dt className="w-[78px] shrink-0 text-smoke-2">Praised</dt>
                <dd className="text-smoke">{praised.join(" · ")}</dd>
              </div>
            )}
            {problems.length > 0 && (
              <div className="flex gap-2">
                <dt className="w-[78px] shrink-0 text-smoke-2">Went wrong</dt>
                <dd className="text-linen">{problems.join(" · ")}</dd>
              </div>
            )}
          </dl>
        )}

        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-[12.5px] text-smoke-2">
            <label htmlFor={`reply-${review.id}`}>Reply{instruction ? ` (after "${instruction}")` : ""}</label>
            {words > 0 && <span className="tabular-nums">{words} words</span>}
          </div>
          {draft?.reply ? (
            <textarea
              id={`reply-${review.id}`}
              value={replyText}
              onChange={(e) => setEdited({ base: draft.reply ?? "", text: e.target.value })}
              onFocus={() => desk.holdAutoPost(review.id)}
              readOnly={busy}
              rows={Math.min(14, Math.max(6, Math.ceil(replyText.length / 72) + replyText.split("\n").length))}
              className="block w-full resize-y rounded-xl border border-transparent bg-night px-4 py-3 font-serif text-[17px] leading-[1.6] text-linen outline-none transition focus:border-line-strong"
            />
          ) : (
            <div className="space-y-2.5 rounded-xl bg-night px-4 py-4">
              <Skeleton w="94%" />
              <Skeleton w="88%" />
              <Skeleton w="72%" />
              <Skeleton w="40%" />
            </div>
          )}
        </div>

        {live.text && !busy && (
          <p className="rounded-xl bg-night px-4 py-3 text-[14px] leading-relaxed text-linen/90">
            <span className="text-smoke-2">Front of House: </span>
            {live.text}
          </p>
        )}

        {draft?.managerNote && (
          <aside className="rounded-xl border border-lamp/20 bg-lamp/[0.06] px-4 py-3">
            <p className="text-[12.5px] text-lamp">Private note for you, never posted</p>
            <p className="mt-1 text-[14px] leading-relaxed text-linen/90">{draft.managerNote}</p>
          </aside>
        )}
      </div>

      {!busy && draft?.reply && (
        <footer className="space-y-3 border-t border-line px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {escalate && !withOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => desk.sendToOwner(review.id)}
                  className="flex items-center gap-2 rounded-lg bg-wine px-4 py-2 text-[14px] font-medium text-night hover:bg-wine/90"
                >
                  <HoldIcon />
                  Send to {owner} for approval
                </button>
                <button
                  type="button"
                  onClick={() => desk.approve(review.id, replyText)}
                  className="rounded-lg border border-line-strong px-4 py-2 text-[14px] text-smoke hover:text-linen"
                >
                  Post anyway
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => desk.approve(review.id, replyText)}
                className="flex items-center gap-2 rounded-lg bg-linen px-4 py-2 text-[14px] font-medium text-night hover:bg-white"
              >
                <CheckIcon />
                {withOwner ? `${owner} approved: post to ${review.platform}` : `Approve and post to ${review.platform}`}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                desk.holdAutoPost(review.id);
                void desk.draftReview(review.id);
              }}
              className="rounded-lg px-3 py-2 text-[13.5px] text-smoke hover:bg-night-3 hover:text-linen"
            >
              Redraft
            </button>
          </div>

          <form onSubmit={onAsk} className="flex flex-wrap items-center gap-1.5">
            {REVISIONS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => revise(r.prompt)}
                className="rounded-lg border border-line px-3 py-1 text-[13px] text-smoke hover:border-line-strong hover:text-linen"
              >
                {r.label}
              </button>
            ))}
            <label htmlFor={`ask-${review.id}`} className="sr-only">
              Ask for a change
            </label>
            <input
              id={`ask-${review.id}`}
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ask for a change, e.g. mention the new brunch menu"
              className="min-w-[220px] flex-1 rounded-lg border border-line bg-night px-3.5 py-1.5 text-[13.5px] outline-none placeholder:text-smoke-2 focus:border-line-strong"
            />
          </form>
        </footer>
      )}

      {busy && (
        <footer className="border-t border-line px-5 py-3">
          <button type="button" onClick={() => stop()} className="text-[13.5px] text-smoke hover:text-linen">
            Stop
          </button>
        </footer>
      )}
    </section>
  );
}
