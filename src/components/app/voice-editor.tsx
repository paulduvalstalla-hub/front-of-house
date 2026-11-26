"use client";

import Link from "next/link";
import { useState } from "react";
import { RESTAURANT_PROFILE } from "@/lib/restaurant-profile";
import { useDesk } from "./desk-store";

const LIMIT = 9000;

type Section = { title: string; body: string };

function split(md: string): { head: string; sections: Section[] } {
  const parts = md.split(/\n(?=## )/);
  const head = parts[0].trim();
  const sections = parts.slice(1).map((p) => {
    const [first, ...rest] = p.split("\n");
    return { title: first.replace(/^##\s*/, "").trim(), body: rest.join("\n").trim() };
  });
  return { head, sections };
}

function join(head: string, sections: Section[]) {
  return `${head}\n\n${sections.map((s) => `## ${s.title}\n${s.body}`).join("\n\n")}\n`;
}

const HINTS: Record<string, string> = {
  "The basics": "Facts the agent may state: hours, dishes, prices, contact. Anything not here, it won't claim.",
  "Brand voice": "How replies should sound: person, length, words to avoid, the sign-off.",
  "Reply policy": "What a public reply may and may not do.",
  "Tell the owner after posting": "Reviews that can be posted, but the owner should hear about the same day.",
  "Escalate to the owner before replying": "Reviews that are held until the owner has seen them.",
};

export function VoiceEditor() {
  const desk = useDesk();
  const { head, sections } = split(desk.profile);
  const [active, setActive] = useState(0);
  const current = sections[Math.min(active, sections.length - 1)];
  const isDefault = desk.profile === RESTAURANT_PROFILE;
  const over = desk.profile.length > LIMIT;

  function update(body: string) {
    const next = sections.map((s, i) => (i === active ? { ...s, body } : s));
    desk.setProfile(join(head, next));
  }

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] leading-none tracking-[-0.025em]">Brand voice</h1>
          <p className="mt-3 max-w-[62ch] text-[14.5px] text-smoke">
            This is everything Front of House knows about Petit Comptoir. It is sent with every draft, and the agent may only
            use these facts and the review itself.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <span className={over ? "text-wine" : "text-smoke-2"}>
            {desk.profile.length.toLocaleString()} of {LIMIT.toLocaleString()} characters
            {over && ", too long to send: the default file will be used"}
          </span>
          <button
            type="button"
            disabled={isDefault}
            onClick={() => desk.setProfile(RESTAURANT_PROFILE)}
            className="rounded-full border border-line px-3.5 py-1.5 text-smoke hover:border-line-strong hover:text-linen disabled:opacity-40"
          >
            Reset to default
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Sections" className="flex gap-1 overflow-x-auto lg:flex-col">
          {sections.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActive(i)}
              aria-current={i === active ? "true" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-[14px] lg:whitespace-normal ${
                i === active ? "bg-night-3 text-linen" : "text-smoke hover:bg-night-2 hover:text-linen"
              }`}
            >
              {s.title}
            </button>
          ))}
        </nav>

        {current && (
          <section className="rounded-[var(--radius-window)] border border-line bg-night-2">
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-serif text-[21px] tracking-[-0.015em]">{current.title}</h2>
              {HINTS[current.title] && <p className="mt-1 text-[13.5px] text-smoke">{HINTS[current.title]}</p>}
            </header>
            <label htmlFor="voice-body" className="sr-only">
              {current.title}
            </label>
            <textarea
              id="voice-body"
              value={current.body}
              onChange={(e) => update(e.target.value)}
              spellCheck
              rows={Math.max(10, current.body.split("\n").length + 3)}
              className="block w-full resize-y bg-transparent px-5 py-4 text-[14.5px] leading-[1.7] text-linen outline-none"
            />
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 text-[13px] text-smoke-2">
              <span>Saved in this browser as you type.</span>
              <Link href="/dashboard" className="text-linen underline decoration-line-strong underline-offset-4">
                Try it: redraft a review in the inbox
              </Link>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
}
