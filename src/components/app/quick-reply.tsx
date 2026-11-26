"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Stars } from "@/components/brand";
import { useDesk, type DeskMessage } from "./desk-store";
import { riskMeta } from "./risk";

const STARTERS = [
  {
    label: "A 5-star birthday review",
    text: "Google, 5 stars, from Sarah M.: Came for my mom's 60th birthday. The duck confit was perfect and our server Léa remembered it was a celebration and brought a candle in the crème brûlée. Cosy room, great wine list. We'll definitely be back!",
  },
  {
    label: "A review forwarded by email",
    text: "Forwarded from our website contact form, 3 stars: Lovely room and the onion soup was great, but we waited 25 minutes for the bill on a quiet Tuesday. — Grace",
  },
];

function textOf(m: DeskMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function QuickReply() {
  const desk = useDesk();
  // One shared conversation, kept by the dashboard so it survives switching pages.
  const chat = desk.getChat("quick-reply");
  const { messages, sendMessage, status, stop, error, regenerate, setMessages } = useChat({ chat });
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const busy = status === "submitted" || status === "streaming";
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, status]);

  function send(text: string) {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() });
    setInput("");
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[820px] flex-col px-5 py-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[30px] leading-none tracking-[-0.025em]">Quick reply</h1>
          <p className="mt-3 max-w-[60ch] text-[14.5px] text-smoke">
            Paste a review from anywhere, such as an email, Facebook or a platform you haven&rsquo;t connected, or ask
            Front of House for a change to a draft.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              stop();
              setMessages([]);
            }}
            className="rounded-full border border-line px-3.5 py-1.5 text-[13.5px] text-smoke hover:border-line-strong hover:text-linen"
          >
            Start over
          </button>
        )}
      </div>

      <div className="mt-8 flex-1 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => send(s.text)}
                className="rounded-full border border-line px-3.5 py-1.5 text-[13.5px] text-smoke hover:border-line-strong hover:text-linen"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[88%] whitespace-pre-wrap rounded-2xl bg-night-3 px-4 py-3 text-[15px] leading-relaxed text-linen/90">
                  {textOf(m)}
                </p>
              </div>
            );
          }
          return (
            <div key={m.id} className="space-y-3">
              {m.parts.map((part, i) => {
                if (part.type === "text" && part.text.trim()) {
                  return (
                    <div key={i}>
                      <p className="text-[12.5px] text-smoke-2">Front of House</p>
                      <p className="mt-1 whitespace-pre-wrap font-serif text-[18px] leading-[1.55]">{part.text}</p>
                    </div>
                  );
                }
                if (part.type === "tool-fileReply" && part.state !== "output-error") {
                  const d = part.input ?? {};
                  const risk = d.risk ? riskMeta(d.risk, desk.workspace.owner) : null;
                  const streaming = part.state === "input-streaming";
                  return (
                    <article key={part.toolCallId} className="overflow-hidden rounded-[var(--radius-window)] border border-line bg-night-2">
                      <header className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-3 ${risk ? risk.strip : "border-line"}`}>
                        <span className="flex items-center gap-2 text-[14px] font-medium">
                          <span className={`size-2 rounded-full ${risk ? risk.dot : "bg-smoke-2"}`} />
                          {risk ? risk.label : "Drafting"}
                        </span>
                        {d.riskReason && <span className="text-[13px] text-smoke">{d.riskReason}</span>}
                      </header>
                      <div className="space-y-4 px-5 py-4">
                        <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-smoke">
                          {typeof d.stars === "number" && <Stars value={d.stars} />}
                          {d.platform && d.platform !== "Unknown" && <span>{d.platform}</span>}
                          {d.language && <span>{d.language}</span>}
                        </p>
                        {d.reply ? (
                          <p className="whitespace-pre-wrap rounded-xl bg-night px-4 py-3 font-serif text-[17px] leading-[1.6]">
                            {d.reply}
                          </p>
                        ) : (
                          <div className="space-y-2.5 rounded-xl bg-night px-4 py-4">
                            <span className="skeleton block h-3 w-[92%] rounded-full" />
                            <span className="skeleton block h-3 w-[78%] rounded-full" />
                            <span className="skeleton block h-3 w-[46%] rounded-full" />
                          </div>
                        )}
                        {d.managerNote && (
                          <p className="rounded-xl border border-lamp/20 bg-lamp/[0.06] px-4 py-3 text-[14px] leading-relaxed">
                            <span className="block text-[12.5px] text-lamp">Private note for you, never posted</span>
                            {d.managerNote}
                          </p>
                        )}
                        {!streaming && d.reply && (
                          <button
                            type="button"
                            onClick={() =>
                              navigator.clipboard
                                ?.writeText(d.reply ?? "")
                                .then(() => {
                                  setCopied(part.toolCallId);
                                  setTimeout(() => setCopied(null), 1600);
                                })
                                .catch(() => {})
                            }
                            className="rounded-full bg-lamp px-4 py-2 text-[14px] font-medium text-night hover:bg-lamp/90"
                          >
                            {copied === part.toolCallId ? "Copied" : "Copy reply"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                }
                return null;
              })}
            </div>
          );
        })}

        {status === "submitted" && (
          <p className="flex items-center gap-2 text-[14px] text-smoke" aria-live="polite">
            Reading
            <span className="dot-pulse flex gap-1" aria-hidden>
              <span className="size-1.5 rounded-full bg-smoke" />
              <span className="size-1.5 rounded-full bg-smoke" />
              <span className="size-1.5 rounded-full bg-smoke" />
            </span>
          </p>
        )}
        {error && (
          <p className="flex flex-wrap items-center gap-3 rounded-xl bg-wine/[0.12] px-4 py-3 text-[14px]">
            Front of House couldn&rsquo;t reach the model.
            <button type="button" onClick={() => regenerate()} className="rounded-full bg-linen px-3 py-1 text-[13px] font-medium text-night">
              Try again
            </button>
          </p>
        )}
        <div ref={end} />
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-4 mt-8">
        <div className="rounded-2xl border border-line-strong bg-night-2/95 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur focus-within:border-lamp/50">
          <label htmlFor="quick-input" className="sr-only">
            Paste a review or ask Front of House
          </label>
          <textarea
            id="quick-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={3}
            maxLength={6000}
            placeholder="Paste a review, or ask for a change to the draft"
            className="block w-full resize-none bg-transparent px-4 pt-3 text-[15px] leading-relaxed outline-none placeholder:text-smoke-2"
          />
          <div className="flex items-center justify-between gap-3 px-3 pb-2.5">
            <span className="pl-1 text-[12.5px] text-smoke-2 max-sm:hidden">Enter to send, Shift + Enter for a new line</span>
            {busy ? (
              <button type="button" onClick={() => stop()} className="ml-auto rounded-full border border-line px-4 py-1.5 text-[14px]">
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="ml-auto rounded-full bg-lamp px-4 py-1.5 text-[14px] font-medium text-night disabled:bg-night-4 disabled:text-smoke-2"
              >
                Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
