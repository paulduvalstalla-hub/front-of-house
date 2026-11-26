"use client";

import { useChat } from "@ai-sdk/react";
import type { UIDataTypes, UIMessage } from "ai";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { ReplyDraft } from "@/lib/reply-tool";
import { REVISIONS, SAMPLE_REVIEWS, type SampleReview } from "@/lib/samples";
import { ReplyCard, type LooseDraft } from "./reply-card";

type DeskTools = {
  fileReply: { input: ReplyDraft; output: { status: string } };
};
type DeskMessage = UIMessage<never, UIDataTypes, DeskTools>;

const TONE: Record<SampleReview["tone"], { border: string; head: string }> = {
  sage: { border: "border-sage-deep/45", head: "bg-sage" },
  butter: { border: "border-butter-deep/60", head: "bg-butter" },
  rose: { border: "border-rose-deep/40", head: "bg-rose" },
};

function textOf(message: DeskMessage) {
  return message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function WindowDots() {
  return (
    <span className="flex gap-1.5" aria-hidden>
      <span className="size-2.5 rounded-full bg-rose-deep/35" />
      <span className="size-2.5 rounded-full bg-butter-deep/55" />
      <span className="size-2.5 rounded-full bg-sage-deep/45" />
    </span>
  );
}

export function ReviewDesk() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, error, regenerate, setMessages } =
    useChat<DeskMessage>();
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  const busy = status === "submitted" || status === "streaming";
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const hasDraft = lastAssistant?.parts.some((p) => p.type === "tool-fileReply") ?? false;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    sendMessage({ text: clean });
    setInput("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  function clear() {
    stop();
    setMessages([]);
    setInput("");
    field.current?.focus();
  }

  return (
    <div className="flex h-[min(820px,calc(100dvh-7rem))] min-h-[600px] flex-col overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-[0_24px_60px_-30px_rgba(40,40,80,0.35)]">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <WindowDots />
        <span className="rounded-lg bg-paper px-3 py-1 text-[13px] text-ink-soft">Review desk</span>
        <button
          type="button"
          onClick={clear}
          disabled={messages.length === 0}
          className="rounded-full px-2.5 py-1 text-[13px] text-ink-soft transition hover:bg-paper disabled:invisible"
        >
          Clear
        </button>
      </div>

      {/* conversation */}
      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-6 sm:px-7">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-[640px] pt-4">
            <h2 className="font-serif text-[30px] leading-[1.1] tracking-[-0.025em] sm:text-[34px]">
              Paste a review to start.
            </h2>
            <p className="mt-3 max-w-[520px] text-[15.5px] leading-relaxed text-ink-soft">
              Copy any guest review from Google, Yelp or TripAdvisor into the box below. Or start with one
              of these from last week:
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {SAMPLE_REVIEWS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => send(s.text)}
                    className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 bg-white text-left transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${TONE[s.tone].border}`}
                  >
                    <span className={`px-3.5 py-2.5 text-[12.5px] font-medium text-ink-soft ${TONE[s.tone].head}`}>
                      {s.meta}
                    </span>
                    <span className="flex flex-1 flex-col gap-2 px-3.5 py-3">
                      <span className="font-serif text-[18px] leading-tight tracking-[-0.01em]">{s.title}</span>
                      <span className="line-clamp-3 text-[13px] leading-snug text-ink-soft">{s.text}</span>
                      <span className="mt-auto pt-1 text-[13px] font-medium text-ink underline-offset-4 group-hover:underline">
                        Draft a reply →
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="mx-auto flex max-w-[680px] flex-col gap-6">
            {messages.map((m, mi) => {
              if (m.role === "user") {
                const text = textOf(m);
                const isReview = text.length > 140;
                return (
                  <li key={m.id} className="flex flex-col items-end">
                    {isReview ? (
                      <figure className="w-full max-w-[600px]">
                        <figcaption className="mb-1.5 text-right text-[12px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                          Guest review
                        </figcaption>
                        <blockquote className="rounded-2xl border border-line bg-paper px-5 py-4 font-serif text-[16.5px] italic leading-relaxed text-ink-soft">
                          {text}
                        </blockquote>
                      </figure>
                    ) : (
                      <p className="max-w-[85%] rounded-2xl bg-paper-deep px-4 py-2.5 text-[15px]">{text}</p>
                    )}
                  </li>
                );
              }

              const isLast = mi === messages.length - 1;
              return (
                <li key={m.id} className="flex flex-col gap-4">
                  {m.parts.map((part, i) => {
                    if (part.type === "text" && part.text.trim()) {
                      return (
                        <div key={i} className="max-w-[600px]">
                          <p className="mb-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                            Front of House
                          </p>
                          <p className="whitespace-pre-wrap font-serif text-[18px] leading-[1.55]">{part.text}</p>
                        </div>
                      );
                    }
                    if (part.type === "tool-fileReply") {
                      if (part.state === "output-error") {
                        return (
                          <p key={i} className="rounded-2xl bg-rose px-4 py-3 text-[14.5px]">
                            The draft came back malformed. Try sending the review again.
                          </p>
                        );
                      }
                      return (
                        <ReplyCard
                          key={part.toolCallId}
                          draft={(part.input ?? {}) as LooseDraft}
                          streaming={isLast && busy}
                        />
                      );
                    }
                    return null;
                  })}
                </li>
              );
            })}

            {status === "submitted" && (
              <li className="flex items-center gap-2 text-[14px] text-ink-faint" aria-live="polite">
                Reading the review
                <span className="dot-pulse flex gap-1" aria-hidden>
                  <span className="size-1.5 rounded-full bg-ink-faint" />
                  <span className="size-1.5 rounded-full bg-ink-faint" />
                  <span className="size-1.5 rounded-full bg-ink-faint" />
                </span>
              </li>
            )}

            {error && (
              <li className="flex flex-wrap items-center gap-3 rounded-2xl bg-rose px-4 py-3 text-[14.5px]">
                <span>Front of House couldn&rsquo;t answer just now.</span>
                <button
                  type="button"
                  onClick={() => regenerate()}
                  className="rounded-full bg-ink px-3.5 py-1.5 text-[13.5px] font-medium text-paper"
                >
                  Try again
                </button>
              </li>
            )}
          </ol>
        )}
      </div>

      {/* composer */}
      <form onSubmit={onSubmit} className="border-t border-line bg-white px-4 pb-4 pt-3 sm:px-7">
        <div className="mx-auto max-w-[680px]">
          {hasDraft && !busy && (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {REVISIONS.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => send(r.prompt)}
                  className="rounded-full border border-line px-3 py-1 text-[13px] text-ink-soft transition hover:border-ink-faint hover:text-ink"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
          <div className="rounded-2xl border border-line bg-paper/60 transition focus-within:border-periwinkle-deep focus-within:bg-white focus-within:ring-4 focus-within:ring-periwinkle/70">
            <label htmlFor="review-input" className="sr-only">
              Paste a guest review, or ask for a change to the draft
            </label>
            <textarea
              id="review-input"
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={hasDraft ? 1 : 3}
              maxLength={6000}
              placeholder={hasDraft ? "Ask for a change, or paste the next review…" : "Paste a guest review here…"}
              className="block w-full resize-none bg-transparent px-4 pt-3 text-[15.5px] leading-relaxed outline-none placeholder:text-ink-faint"
            />
            <div className="flex items-center justify-between gap-3 px-3 pb-2.5 pt-1">
              <span className="hidden pl-1 text-[12.5px] text-ink-faint sm:inline">
                Enter to send · Shift + Enter for a new line
              </span>
              {busy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="ml-auto rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="ml-auto rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-paper transition hover:bg-ink/85 disabled:bg-ink/25"
                >
                  {hasDraft ? "Send" : "Draft reply"}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
