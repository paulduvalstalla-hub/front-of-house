"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Stars } from "@/components/brand";
import { PlatformLogo } from "@/components/platform-logo";
import { StatusLabel } from "@/components/status";
import { PLATFORMS, ageHours, reviewAge, type DemoReview, type Platform } from "@/lib/demo-reviews";
import { LISTING_STATS } from "@/lib/live-reviews";
import { AUTO_POST_MIN_STARS, useDesk, type ReviewRecord } from "./desk-store";
import { AddReviewDialog } from "./add-review";
import { DraftPanel } from "./draft-panel";
import { CheckIcon, HoldIcon, LayersIcon } from "./icons";
import { riskMeta } from "./risk";
import { useNow } from "./use-now";

type Tab = "reply" | "hold" | "replied" | "all";

function tabOf(rec: ReviewRecord | undefined): Exclude<Tab, "all"> {
  if (!rec) return "reply";
  if (rec.status === "replied") return "replied";
  if (rec.status === "with-owner" || rec.draft?.risk === "escalate") return "hold";
  return "reply";
}

const tabsFor = (owner: string): { id: Tab; label: string }[] => [
  { id: "reply", label: "To reply" },
  { id: "hold", label: `Held for ${owner}` },
  { id: "replied", label: "Replied" },
  { id: "all", label: "All" },
];

function RowStatus({ rec, owner, now }: { rec?: ReviewRecord; owner: string; now: number }) {
  if (!rec) return null;
  if (rec.status === "replied")
    return (
      <span className="flex items-center gap-1 text-[12px] text-smoke-2">
        <CheckIcon width={13} height={13} className={rec.postedBy === "autopilot" ? "text-sage" : ""} />
        {rec.postedBy === "autopilot" ? "Auto-posted" : "Replied"}
      </span>
    );
  if (rec.autoPostAt && rec.status === "drafted" && now)
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-sage">
        <span className="size-1.5 rounded-full bg-sage" />
        Posting in <span className="tabular-nums">{Math.max(0, Math.ceil((rec.autoPostAt - now) / 1000))}</span> s
      </span>
    );
  if (rec.status === "with-owner")
    return (
      <span className="flex items-center gap-1 text-[12px] text-wine">
        <HoldIcon width={13} height={13} /> With {owner}
      </span>
    );
  if (rec.draft) {
    const m = riskMeta(rec.draft.risk, owner);
    return (
      <StatusLabel level={m.level} size={13} className="text-[12px] text-smoke">
        {m.short}
      </StatusLabel>
    );
  }
  return <span className="text-[12px] text-smoke-2">New</span>;
}

export function Inbox() {
  const desk = useDesk();
  const owner = desk.workspace.owner;
  const [tab, setTab] = useState<Tab>("reply");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const now = useNow(1000);
  // Minute resolution is enough for the order; it keeps the list stable between ticks.
  const minute = Math.floor(now / 60_000) * 60_000;

  const sorted = useMemo(
    () => [...desk.reviews].sort((a, b) => ageHours(a, minute) - ageHours(b, minute)),
    [desk.reviews, minute],
  );
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

  // Reviews handed over by onboarding are drafted as soon as the inbox opens
  // (the agent does this on its own when it is on).
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!desk.ready || !desk.autoTriage || autoStarted.current) return;
    autoStarted.current = true;
    desk.clearAutoTriage();
    if (!desk.agentOn) void desk.triageAll();
  }, [desk]);

  // Keep the open review in place when new ones arrive at the top of the list.
  const firstVisible = visible[0]?.id;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pin the review shown by default once there is one
    if (desk.ready && !selected && firstVisible) setSelected(firstVisible);
  }, [desk.ready, selected, firstVisible]);

  // A notification was clicked: open that review in the tab it belongs to.
  const { focusId, focusReview } = desk;
  useEffect(() => {
    if (!focusId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow a one-off request from a notification
    setSelected(focusId);
    setTab("all");
    setPlatform("all");
    focusReview(null);
  }, [focusId, focusReview]);

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
        <div className="min-w-0">
          <h1 className="font-serif text-[30px] leading-none tracking-[-0.025em]">Inbox</h1>
          {desk.workspace.mode === "sample" && connectedPlatforms.length > 0 ? (
            <ul aria-label="Public listings" className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13.5px]">
              {connectedPlatforms.map((p) => {
                const stats = LISTING_STATS[p.id];
                if (!stats) return null;
                const total = stats.total + desk.reviews.filter((r) => r.platform === p.id && r.receivedAt).length;
                return (
                  <li key={p.id} className="flex items-center gap-2">
                    <PlatformLogo platform={p.id} size={16} />
                    <span className="font-medium tabular-nums text-linen">{stats.rating.toFixed(1)}</span>
                    <span className="text-lamp">★</span>
                    <span className="tabular-nums text-smoke">{total.toLocaleString("en-US")} reviews</span>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/dashboard/integrations"
                  className="text-smoke underline decoration-line-strong underline-offset-4 hover:text-linen hover:decoration-linen"
                >
                  Manage
                </Link>
              </li>
            </ul>
          ) : (
            <p className="mt-2 text-[14px] text-smoke">
              {counts.reply} to reply, {counts.hold} held for {owner}, from {connectedPlatforms.length} connected{" "}
              {connectedPlatforms.length === 1 ? "platform" : "platforms"}.{" "}
              <Link href="/dashboard/integrations" className="text-linen underline decoration-line-strong underline-offset-4 hover:decoration-linen">
                Manage
              </Link>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg border border-line-strong px-4 py-2 text-[14px] text-linen hover:bg-night-2"
          >
            Add a review
          </button>
          {!desk.agentOn && (
            <button
              type="button"
              onClick={() => desk.triageAll()}
              disabled={desk.triage.running || untriaged === 0}
              className="flex items-center gap-2 rounded-lg bg-linen px-4 py-2 text-[14px] font-medium text-night transition hover:bg-white disabled:bg-night-3 disabled:text-smoke disabled:shadow-none"
            >
              <LayersIcon />
              {desk.triage.running
                ? `Drafting ${Math.min(desk.triage.done + 1, desk.triage.total)} of ${desk.triage.total}`
                : untriaged > 0
                  ? `Triage ${untriaged} new ${untriaged === 1 ? "review" : "reviews"}`
                  : "Everything is triaged"}
            </button>
          )}
        </div>
      </div>

      <AgentBar now={now} />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-2.5 lg:px-8">
        <div role="tablist" aria-label="Filter reviews" className="flex gap-1 overflow-x-auto">
          {tabsFor(owner).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSelected(null);
              }}
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
              <PlatformLogo platform={p.id} size={18} />
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
          ) : sorted.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <p className="font-serif text-[20px] tracking-[-0.01em]">No reviews yet</p>
              <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] text-smoke">
                Paste one of your latest reviews and Front of House drafts the reply in your voice.
              </p>
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="mt-4 rounded-lg bg-linen px-4 py-2 text-[14px] font-medium text-night hover:bg-white"
              >
                Add a review
              </button>
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
                    } ${r.receivedAt && (!now || now - r.receivedAt < 4000) ? "row-arrive" : ""}`}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-linen" />}
                    <span className="flex items-center gap-2.5">
                      <PlatformLogo platform={r.platform} size={16} />
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{r.author}</span>
                      <span className="text-[12px] tabular-nums text-smoke-2">{reviewAge(r, now)}</span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-3">
                      <Stars value={r.stars} className="text-[12px]" />
                      {drafting ? (
                        <span className="dot-pulse flex gap-1" aria-label="Drafting">
                          <span className="size-1 rounded-full bg-smoke" />
                          <span className="size-1 rounded-full bg-smoke" />
                          <span className="size-1 rounded-full bg-smoke" />
                        </span>
                      ) : (
                        <RowStatus rec={rec} owner={owner} now={now} />
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
                <PlatformLogo platform={current.platform} size={40} tile />
                <div className="min-w-0">
                  <h2 className="font-serif text-[24px] leading-tight tracking-[-0.015em]">{current.author}</h2>
                  <p className="flex flex-wrap items-center gap-x-3 text-[13px] text-smoke">
                    <Stars value={current.stars} />
                    <span>{current.platform}</span>
                    {current.meta && <span>{current.meta}</span>}
                    <span>{reviewAge(current, now)}</span>
                  </p>
                </div>
              </header>
              {current.title && (
                <p className="mt-5 font-serif text-[21px] font-medium leading-snug tracking-[-0.01em]">{current.title}</p>
              )}
              <blockquote
                className={`${current.title ? "mt-2" : "mt-5"} max-w-[64ch] border-l-2 border-line-strong pl-5 font-serif text-[19px] leading-[1.6] text-linen/90`}
              >
                {current.text}
              </blockquote>
              {current.visit && <p className="mt-2 pl-5 text-[12.5px] text-smoke-2">{current.visit}</p>}
              <Timeline review={current} rec={desk.records[current.id]} />
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

      {adding && (
        <AddReviewDialog
          onClose={() => setAdding(false)}
          onAdded={(id) => {
            setTab("reply");
            setPlatform("all");
            setSelected(id);
            void desk.draftReview(id);
          }}
        />
      )}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-[13px] text-smoke hover:text-linen disabled:opacity-40"
    >
      <span
        aria-hidden
        className={`relative h-[18px] w-[30px] rounded-full transition-colors ${checked ? "bg-sage/80" : "bg-night-4"}`}
      >
        <span
          className={`absolute top-[2px] size-[14px] rounded-full bg-linen transition-[left] ${checked ? "left-[14px]" : "left-[2px]"}`}
        />
      </span>
      {label}
    </button>
  );
}

/** What the agent is doing right now, and the two switches that control it. */
function AgentBar({ now }: { now: number }) {
  const desk = useDesk();
  const watching = PLATFORMS.filter((p) => desk.connections[p.id]).map((p) => p.id);
  const drafting = Object.values(desk.drafting).filter(Boolean).length;
  const posting = Object.values(desk.records).filter((r) => r.autoPostAt && r.status === "drafted").length;

  // Today's numbers come from the inbox itself.
  const today = desk.reviews.filter((r) => ageHours(r, now) < 24);
  const autoPosted = Object.values(desk.records).filter((r) => r.postedBy === "autopilot").length;
  const times = desk.reviews
    .map((r) => {
      const rec = desk.records[r.id];
      return r.receivedAt && rec?.postedAt ? (rec.postedAt - r.receivedAt) / 1000 : null;
    })
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);
  const median = times.length ? times[Math.floor(times.length / 2)] : null;

  let activity: string;
  if (!desk.agentOn) activity = "Paused. New reviews wait in the inbox until you triage them.";
  else if (drafting > 0) activity = `Drafting ${drafting} ${drafting === 1 ? "reply" : "replies"}…`;
  else if (posting > 0) activity = `${posting} ${posting === 1 ? "reply" : "replies"} about to post.`;
  else activity = `Watching ${watching.join(" and ") || "no platforms"} for new reviews.`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-night-2/60 px-5 py-2.5 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5 text-[13.5px]">
        <span className="relative flex size-2 shrink-0">
          {desk.agentOn && <span className="live-ping absolute inline-flex size-full rounded-full bg-sage" />}
          <span className={`relative inline-flex size-2 rounded-full ${desk.agentOn ? "bg-sage" : "bg-smoke-2"}`} />
        </span>
        <span className="whitespace-nowrap font-medium text-linen">{desk.agentOn ? "Agent on" : "Agent paused"}</span>
        <span className="truncate text-smoke" aria-live="polite">
          {activity}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-[12.5px] tabular-nums text-smoke-2">
          {today.length} new today · {autoPosted} auto-posted
          {median !== null ? ` · median ${median < 90 ? `${Math.round(median)} s` : `${Math.round(median / 60)} min`} to reply` : ""}
        </span>
        <Switch checked={desk.agentOn} onChange={desk.setAgentOn} label="Draft new reviews" />
        <Switch
          checked={desk.autoPost && desk.agentOn}
          disabled={!desk.agentOn}
          onChange={desk.setAutoPost}
          label={`Auto-post ${AUTO_POST_MIN_STARS}–5★ Ready replies`}
        />
      </div>
    </div>
  );
}

function clock(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Received → drafted → posted, for reviews the agent handled in this session. */
function Timeline({ review, rec }: { review: DemoReview; rec?: ReviewRecord }) {
  if (!review.receivedAt) return null;
  const steps: string[] = [`Received from ${review.platform} at ${clock(review.receivedAt)}`];
  if (rec?.draftMs) steps.push(`drafted by Front of House in ${(rec.draftMs / 1000).toFixed(1)} s`);
  if (rec?.status === "replied" && rec.postedAt)
    steps.push(`${rec.postedBy === "autopilot" ? "posted automatically" : "posted"} at ${clock(rec.postedAt)}`);
  else if (rec?.autoPostAt) steps.push("Autopilot is about to post it");
  return <p className="mt-4 text-[12.5px] text-smoke-2">{steps.join(" · ")}</p>;
}
