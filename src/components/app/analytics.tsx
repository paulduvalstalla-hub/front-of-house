"use client";

import { useMemo, useState } from "react";
import { PLATFORM_COLOR, PlatformMark } from "@/components/brand";
import type { Platform } from "@/lib/demo-reviews";
import { useDesk } from "./desk-store";

// Sample history for the chart (the inbox itself is live demo data).
const ORDER: Platform[] = ["Google", "Yelp", "TripAdvisor", "OpenTable"];
const WEEKS = ["Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9", "Nov 16", "Nov 23"];
const HISTORY: Record<Platform, number[]> = {
  Google: [9, 11, 8, 12, 14, 10, 13, 15],
  Yelp: [4, 3, 5, 4, 6, 5, 4, 6],
  TripAdvisor: [3, 4, 3, 5, 4, 6, 5, 4],
  OpenTable: [2, 3, 2, 3, 3, 2, 4, 3],
};

function Tile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[13px] text-smoke">{label}</p>
      <p className="mt-1.5 font-serif text-[34px] leading-none tracking-[-0.02em] tabular-nums">{value}</p>
      <p className="mt-2 text-[12.5px] text-smoke-2">{detail}</p>
    </div>
  );
}

function WeeklyChart() {
  const [hover, setHover] = useState<{ w: number; p: Platform } | null>(null);
  const [asTable, setAsTable] = useState(false);
  const totals = WEEKS.map((_, w) => ORDER.reduce((s, p) => s + HISTORY[p][w], 0));
  const max = Math.ceil(Math.max(...totals) / 10) * 10;
  const W = 640;
  const H = 240;
  const pad = { l: 28, r: 8, t: 12, b: 26 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const band = plotW / WEEKS.length;
  const barW = Math.min(36, band * 0.5);
  const y = (v: number) => pad.t + plotH - (v / max) * plotH;
  const ticks = [0, max / 2, max];

  return (
    <section className="rounded-[var(--radius-window)] border border-line bg-night-2 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium">New reviews per week, by platform</h2>
          <p className="mt-0.5 text-[12.5px] text-smoke-2">Last 8 weeks. Sample history for this prototype.</p>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((t) => !t)}
          className="rounded-lg border border-line px-2.5 py-1 text-[12.5px] text-smoke hover:text-linen"
        >
          {asTable ? "Show chart" : "Show table"}
        </button>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-smoke" aria-label="Legend">
        {ORDER.map((p) => (
          <li key={p} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px]" style={{ background: PLATFORM_COLOR[p] }} />
            {p}
          </li>
        ))}
      </ul>

      {asTable ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[13px] tabular-nums">
            <thead>
              <tr className="text-smoke-2">
                <th className="py-1.5 pr-3 text-left font-normal">Week of</th>
                {ORDER.map((p) => (
                  <th key={p} className="px-2 py-1.5 text-right font-normal">
                    {p}
                  </th>
                ))}
                <th className="py-1.5 pl-2 text-right font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((wk, w) => (
                <tr key={wk} className="border-t border-line">
                  <td className="py-1.5 pr-3">{wk}</td>
                  {ORDER.map((p) => (
                    <td key={p} className="px-2 py-1.5 text-right text-smoke">
                      {HISTORY[p][w]}
                    </td>
                  ))}
                  <td className="py-1.5 pl-2 text-right">{totals[w]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Stacked bar chart of new reviews per week by platform">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(243 238 228 / 0.07)" />
                <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#737a8e">
                  {t}
                </text>
              </g>
            ))}
            {WEEKS.map((wk, w) => {
              const cx = pad.l + band * w + band / 2;
              let acc = 0;
              const topIndex = ORDER.reduce((last, p, i) => (HISTORY[p][w] > 0 ? i : last), 0);
              return (
                <g key={wk}>
                  {ORDER.map((p, i) => {
                    const v = HISTORY[p][w];
                    const y0 = y(acc);
                    acc += v;
                    const y1 = y(acc);
                    const h = Math.max(0, y0 - y1 - (i === 0 ? 0 : 2)); // 2px surface gap between segments
                    const dim = hover && !(hover.w === w && hover.p === p);
                    const isTop = i === topIndex;
                    return (
                      <g key={p}>
                        <path
                          d={
                            isTop
                              ? `M${cx - barW / 2},${y1 + h} V${y1 + 4} Q${cx - barW / 2},${y1} ${cx - barW / 2 + 4},${y1} H${cx + barW / 2 - 4} Q${cx + barW / 2},${y1} ${cx + barW / 2},${y1 + 4} V${y1 + h} Z`
                              : `M${cx - barW / 2},${y1} h${barW} v${h} h${-barW} Z`
                          }
                          fill={PLATFORM_COLOR[p]}
                          opacity={dim ? 0.45 : 1}
                        />
                        {/* Larger invisible hit target for hover */}
                        <rect
                          x={cx - band / 2}
                          y={y1}
                          width={band}
                          height={Math.max(h, 6)}
                          fill="transparent"
                          onMouseEnter={() => setHover({ w, p })}
                          onMouseLeave={() => setHover(null)}
                        />
                      </g>
                    );
                  })}
                  <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill="#737a8e">
                    {wk}
                  </text>
                </g>
              );
            })}
          </svg>
          {hover && (
            <div
              className="pointer-events-none absolute top-2 rounded-lg border border-line-strong bg-night px-3 py-2 text-[12.5px] shadow-lg"
              style={{ left: `${((pad.l + band * hover.w + band / 2) / W) * 100}%`, transform: "translateX(-50%)" }}
            >
              <p className="text-smoke-2">Week of {WEEKS[hover.w]}</p>
              <p className="mt-0.5 flex items-center gap-1.5">
                <span className="size-2 rounded-[2px]" style={{ background: PLATFORM_COLOR[hover.p] }} />
                {hover.p}: <span className="tabular-nums">{HISTORY[hover.p][hover.w]}</span>
              </p>
              <p className="text-smoke-2">Total: {totals[hover.w]}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function Analytics() {
  const desk = useDesk();
  const stats = useMemo(() => {
    const recs = desk.reviews.map((r) => desk.records[r.id]);
    const replied = recs.filter((r) => r?.status === "replied").length;
    const held = desk.reviews.filter(
      (r) => desk.records[r.id]?.status === "with-owner" || desk.records[r.id]?.draft?.risk === "escalate",
    ).length;
    const avg = desk.reviews.reduce((s, r) => s + r.stars, 0) / Math.max(1, desk.reviews.length);
    const ratings = [5, 4, 3, 2, 1].map((n) => ({ n, count: desk.reviews.filter((r) => r.stars === n).length }));
    const praised = new Map<string, number>();
    const problems = new Map<string, number>();
    for (const r of recs) {
      for (const p of r?.draft?.praised ?? []) praised.set(p.toLowerCase(), (praised.get(p.toLowerCase()) ?? 0) + 1);
      for (const p of r?.draft?.problems ?? []) problems.set(p.toLowerCase(), (problems.get(p.toLowerCase()) ?? 0) + 1);
    }
    const top = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      replied,
      held,
      avg,
      ratings,
      praised: top(praised),
      problems: top(problems),
      rate: desk.reviews.length ? Math.round((replied / desk.reviews.length) * 100) : 0,
    };
  }, [desk.reviews, desk.records]);
  const maxRating = Math.max(1, ...stats.ratings.map((r) => r.count));

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8 lg:px-10">
      <h1 className="font-serif text-[30px] leading-none tracking-[-0.025em]">Analytics</h1>
      <p className="mt-3 text-[14.5px] text-smoke">How {desk.workspace.restaurant} is answering its guests, across every connected platform.</p>

      <div className="mt-8 grid grid-cols-2 divide-line rounded-[var(--radius-window)] border border-line max-md:divide-y md:grid-cols-4 md:divide-x">
        <Tile label="Response rate" value={`${stats.rate}%`} detail={`${stats.replied} of ${desk.reviews.length} reviews answered`} />
        <Tile label="Average rating" value={stats.avg.toFixed(1)} detail={`Across ${desk.reviews.length} reviews in your inbox`} />
        <Tile label={`Held for ${desk.workspace.owner}`} value={String(stats.held)} detail="Illness, allergies, discrimination, likely fakes" />
        <Tile label="Drafts written" value={String(desk.drafts)} detail="By Front of House in this trial" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <WeeklyChart />

        <section className="rounded-[var(--radius-window)] border border-line bg-night-2 p-5">
          <h2 className="text-[15px] font-medium">Rating mix</h2>
          <p className="mt-0.5 text-[12.5px] text-smoke-2">Reviews currently in your inbox</p>
          <ul className="mt-5 space-y-3">
            {stats.ratings.map((r) => (
              <li key={r.n} className="grid grid-cols-[44px_1fr_24px] items-center gap-3 text-[13px]">
                <span className="text-smoke">{r.n} star{r.n === 1 ? "" : "s"}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-night-4">
                  <span
                    className="block h-full rounded-full bg-lamp"
                    style={{ width: `${(r.count / maxRating) * 100}%` }}
                    title={`${r.count} reviews`}
                  />
                </span>
                <span className="text-right tabular-nums">{r.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-[var(--radius-window)] border border-line bg-night-2 p-5">
        <h2 className="text-[15px] font-medium">What guests mention</h2>
        <p className="mt-0.5 text-[12.5px] text-smoke-2">Pulled from every review Front of House has read</p>
        {stats.praised.length + stats.problems.length === 0 ? (
          <p className="mt-5 text-[14px] text-smoke">Triage your inbox and the themes guests mention will appear here.</p>
        ) : (
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {(
              [
                ["Praised", stats.praised, "bg-sage/[0.12] text-sage"],
                ["Went wrong", stats.problems, "bg-wine/[0.12] text-wine"],
              ] as const
            ).map(([title, list, cls]) => (
              <div key={title}>
                <h3 className="text-[13px] text-smoke">{title}</h3>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {list.map(([theme, n]) => (
                    <li key={theme} className={`rounded-full px-2.5 py-1 text-[13px] ${cls}`}>
                      {theme}
                      {n > 1 && <span className="ml-1.5 tabular-nums opacity-75">{n}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 flex flex-wrap items-center gap-2 text-[12.5px] text-smoke-2">
        Connected:
        {ORDER.filter((p) => desk.connections[p]).map((p) => (
          <PlatformMark key={p} platform={p} size={18} />
        ))}
      </p>
    </div>
  );
}
