"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlatformMark, Stars } from "@/components/brand";
import { PLATFORMS, timeAgo, type DemoReview, type Platform } from "@/lib/demo-reviews";
import { useDesk, type ReviewRecord } from "./desk-store";
import { DraftPanel } from "./draft-panel";
import { CheckIcon, HoldIcon, LayersIcon } from "./icons";
import { RISK_META } from "./risk";

type Tab = "reply" | "hold" | "replied" | "all";

function tabOf(rec: ReviewRecord | undefined): Exclude<Tab, "all"> {
  if (!rec) return "reply";
  if (rec.status === "replied") return "replied";
  if (rec.status === "with-owner" || rec.draft?.risk === "escalate") return "hold";
  return "reply";
}

const TABS: { id: Tab; label: string }[] = [
  { id: "reply", label: "To reply" },
  { id: "hold", label: "Held for Julien" },
  { id: "replied", label: "Replied" },
  { id: "all", label: "All" },
];

function RowStatus({ rec }: { rec?: ReviewRecord }) {
  if (!rec) return null;
  if (rec.status === "replied")
    return (
      <span className="flex items-center gap-1 text-[12px] text-smoke-2">
        <CheckIcon width={13} height={13} /> Replied
      </span>
    );
  if (rec.status === "with-owner")
    return (
      <span className="flex items-center gap-1 text-[12px] text-wine">
        <HoldIcon width={13} height={13} /> With Julien
      </span>
    );
  if (rec.draft) {
    const m = RISK_META[rec.draft.risk];
    return (
      <span className={`flex items-center gap-1.5 text-[12px] ${m.text}`}>
        <span className={`size-1.5 rounded-full ${m.dot}`} />
        {m.short}
      </span>
    );
  }
  return <span className="text-[12px] text-smoke-2">New</span>;
}

export function Inbox() {
  const desk = useDesk();
  const [tab, setTab] = useState<Tab>("reply");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const sorted = useMemo(() => [...desk.reviews].sort((a, b) => a.hoursAgo - b.hoursAgo), [desk.reviews]);
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { reply: 0, hold: 0, replied: 0, all: sorted.length };
    for (const r of sorted) c[tabOf(desk.records[r.id])]++;
    return c;
  }, [sorted, desk.records]);

  const visible = sorted.filter(
    (r) => (tab === "all" || tabOf(desk.records[r.id]) === tab) && (platform === "all" || r.platform === platform),
  );
  const current: DemoReview | undefined =
    visible.find((r) => r.id === selected) ?? sorted.find((r) => r.id === selected) ?? visible[0];
  const untriaged = sorted.filter((r) => desk.records[r.id]?.status === "new" && !desk.records[r.id]?.draft).length;

  // J / K to move through the list, like an email client.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key !== "j" && e.key !== "k") return;
      const i = visible.findIndex((r) => r.id === current?.id);
      const next = visible[Math.min(visible.length - 1, Math.max(0, i + (e.key === "j" ? 1 : -1)))];
      if (next) setSelected(next.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, current?.id]);

  const connectedPlatforms = PLATFORMS.filter((p) => desk.connections[p.id]);

  return (
    <div className="flex h-dvh flex-col max-lg:h-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 pb-4 pt-6 lg:px-8">
        <div>
          <h1 className="font-serif text-[30px] leading-none tracking-[-0.025em]">Inbox</h1>
          <p className="mt-2 text-[14px] text-smoke">
            {counts.reply} to reply, {counts.hold} held for Julien, from {connectedPlatforms.length} connected{" "}
            {connectedPlatforms.length === 1 ? "platform" : "platforms"}.{" "}
            <Link href="/dashboard/integrations" className="text-linen underline decoration-line-strong underline-offset-4 hover:decoration-linen">
              Manage
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={() => desk.triageAll()}
          disabled={desk.triage.running || untriaged === 0}
          className="flex items-center gap-2 rounded-full bg-lamp px-4 py-2 text-[14px] font-medium text-night shadow-[0_0_28px_-8px_rgb(242_182_109/0.8)] transition hover:bg-lamp/90 disabled:bg-night-3 disabled:text-smoke disabled:shadow-none"
        >
          <LayersIcon />
          {desk.triage.running
            ? `Drafting ${Math.min(desk.triage.done + 1, desk.triage.total)} of ${desk.triage.total}`
            : untriaged > 0
              ? `Triage ${untriaged} new ${untriaged === 1 ? "review" : "reviews"}`
              : "Everything is triaged"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-2.5 lg:px-8">
        <div role="tablist" aria-label="Filter reviews" className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13.5px] transition-colors ${
                tab === t.id ? "bg-night-3 text-linen" : "text-smoke hover:text-linen"
              }`}
            >
              {t.label} <span className="tabular-nums text-smoke-2">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1" aria-label="Filter by platform">
          <button
            type="button"
            onClick={() => setPlatform("all")}
            aria-pressed={platform === "all"}
            className={`rounded-lg px-2.5 py-1 text-[13px] ${platform === "all" ? "bg-night-3 text-linen" : "text-smoke hover:text-linen"}`}
          >
            All platforms
          </button>
          {connectedPlatforms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              aria-pressed={platform === p.id}
              title={p.name}
              className={`rounded-lg p-1 ${platform === p.id ? "bg-night-3" : "opacity-70 hover:opacity-100"}`}
            >
              <PlatformMark platform={p.id} size={22} />
            </button>
          ))}
        </div>
      </div>

      {/* List + detail */}
      <div className="flex min-h-0 flex-1 max-lg:flex-col">
        <ul
          aria-label="Reviews"
          className="pane-scroll w-full shrink-0 overflow-y-auto border-line lg:w-[380px] lg:border-r max-lg:max-h-[46dvh] max-lg:border-b"
        >
          {!desk.ready ? (
            <li className="space-y-2 p-5">
              <span className="skeleton block h-14 rounded-lg" />
              <span className="skeleton block h-14 rounded-lg" />
            </li>
          ) : visible.length === 0 ? (
            <li className="px-6 py-10 text-center text-[14px] text-smoke">
              {tab === "reply" ? "Every review has a reply. Nice work." : "Nothing here right now."}
            </li>
          ) : (
            visible.map((r) => {
              const active = r.id === current?.id;
              const rec = desk.records[r.id];
              const drafting = desk.drafting[r.id] ?? false;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(r.id)}
                    aria-current={active ? "true" : undefined}
                    className={`relative block w-full border-b border-line px-5 py-3.5 text-left transition-colors ${
                      active ? "bg-night-3" : "hover:bg-night-2"
                    }`}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-lamp" />}
                    <span className="flex items-center gap-2.5">
                      <PlatformMark platform={r.platform} size={20} />
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{r.author}</span>
                      <span className="text-[12px] text-smoke-2">{timeAgo(r.hoursAgo)}</span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-3">
                      <Stars value={r.stars} className="text-[12px]" />
                      {drafting ? (
                        <span className="dot-pulse flex gap-1" aria-label="Drafting">
                          <span className="size-1 rounded-full bg-lamp" />
                          <span className="size-1 rounded-full bg-lamp" />
                          <span className="size-1 rounded-full bg-lamp" />
                        </span>
                      ) : (
                        <RowStatus rec={rec} />
                      )}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-smoke">{r.text}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="pane-scroll min-w-0 flex-1 overflow-y-auto">
          {current ? (
            <article className="mx-auto max-w-[760px] px-5 py-7 lg:px-10">
              <header className="flex flex-wrap items-center gap-3">
                <PlatformMark platform={current.platform} size={30} />
                <div className="min-w-0">
                  <h2 className="font-serif text-[24px] leading-tight tracking-[-0.015em]">{current.author}</h2>
                  <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-smoke">
                    <Stars value={current.stars} />
                    <span>{current.platform}</span>
                    <span>{timeAgo(current.hoursAgo)}</span>
                  </p>
                </div>
              </header>
              <blockquote className="mt-5 max-w-[64ch] border-l-2 border-line-strong pl-5 font-serif text-[19px] leading-[1.6] text-linen/90">
                {current.text}
              </blockquote>
              <div className="mt-8">
                <DraftPanel key={current.id} review={current} />
              </div>
              <p className="mt-6 text-[12.5px] text-smoke-2 max-lg:hidden">Press J and K to move between reviews.</p>
            </article>
          ) : (
            <div className="grid h-full place-items-center px-6 py-16 text-center text-[14px] text-smoke">
              Connect a platform to start receiving reviews.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
