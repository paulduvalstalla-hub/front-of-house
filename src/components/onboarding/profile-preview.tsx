"use client";

import { useEffect, useMemo, useRef } from "react";

type Block = { kind: "text" | "bullets"; lines: string[] };
type Section = { title: string; blocks: Block[] };

function parse(md: string): { title: string; sections: Section[] } {
  const sections: Section[] = [];
  let title = "";
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (raw.startsWith("# ")) {
      title = raw.slice(2).trim();
      continue;
    }
    if (raw.startsWith("## ")) {
      sections.push({ title: raw.slice(3).trim(), blocks: [] });
      continue;
    }
    const section = sections[sections.length - 1];
    if (!section || !line) continue;
    const kind = line.startsWith("- ") ? "bullets" : "text";
    const text = kind === "bullets" ? line.slice(2) : line;
    const last = section.blocks[section.blocks.length - 1];
    if (last && last.kind === kind) last.lines.push(text);
    else section.blocks.push({ kind, lines: [text] });
  }
  return { title, sections };
}

/** The knowledge file as it is being built, with the sections the current step writes highlighted. */
export function ProfilePreview({ markdown, focus, done }: { markdown: string; focus: string[]; done: boolean }) {
  const { title, sections } = useMemo(() => parse(markdown), [markdown]);
  const scroller = useRef<HTMLDivElement>(null);
  const focusKey = focus.join("|");

  useEffect(() => {
    const el = scroller.current?.querySelector<HTMLElement>("[data-focus='true']");
    el?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [focusKey]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-window)] border border-line bg-night-2 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9)]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-linen/10" />
          <span className="size-2.5 rounded-full bg-linen/10" />
          <span className="size-2.5 rounded-full bg-linen/10" />
        </span>
        <span className="truncate rounded-md bg-night-3 px-2.5 py-0.5 text-[12.5px] text-smoke">restaurant-profile.md</span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-smoke-2">
          <span className={`size-1.5 rounded-full ${done ? "bg-sage" : "animate-pulse bg-lamp"}`} />
          {done ? "Ready" : "Building"}
        </span>
      </div>
      <div ref={scroller} className="pane-scroll flex-1 overflow-y-auto px-6 py-5" aria-live="polite">
        <p className="font-serif text-[22px] leading-tight tracking-[-0.015em]">{title}</p>
        <div className="mt-4 space-y-3">
          {sections.map((s) => {
            const on = focus.includes(s.title);
            return (
              <section
                key={s.title}
                data-focus={on ? "true" : undefined}
                className={`scroll-mt-4 rounded-xl border px-4 py-3 transition-colors duration-300 ${
                  on ? "border-lamp/40 bg-lamp/[0.05]" : "border-transparent"
                }`}
              >
                <h3 className={`text-[13.5px] font-medium ${on ? "text-lamp" : "text-linen/85"}`}>{s.title}</h3>
                <div className="mt-1.5 space-y-1.5">
                  {s.blocks.map((b, i) =>
                    b.kind === "text" ? (
                      <p key={i} className="text-[12.5px] leading-snug text-smoke">
                        {b.lines.join(" ")}
                      </p>
                    ) : (
                      <ul key={i} className="space-y-1">
                        {b.lines.map((l, j) => (
                          <li key={j} className="relative pl-3 text-[12.5px] leading-snug text-smoke">
                            <span className="absolute left-0 top-[0.55em] size-1 rounded-full bg-smoke-2" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
