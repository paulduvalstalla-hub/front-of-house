import { RESTAURANT_PROFILE } from "@/lib/restaurant-profile";

type Block = { kind: "text" | "bullets"; lines: string[] };
type Section = { title: string; blocks: Block[] };

// Keeps paragraphs and bullet lists in the order they appear in the file.
function parseProfile(md: string): Section[] {
  const sections: Section[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.trim();
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
  return sections;
}

export function ProfilePanel() {
  const sections = parseProfile(RESTAURANT_PROFILE);

  return (
    <aside className="flex max-h-[min(820px,calc(100dvh-7rem))] min-h-0 flex-col overflow-hidden rounded-[26px] border border-black/5 bg-peach shadow-[0_24px_60px_-34px_rgba(120,70,30,0.35)]">
      <div className="flex items-center gap-2 border-b border-peach-deep/50 px-4 py-3">
        <span className="rounded-lg bg-white/70 px-3 py-1 font-mono text-[12.5px] text-ink-soft">
          restaurant-profile.md
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-soft">Knowledge file</p>
        <h2 className="mt-1.5 font-serif text-[26px] leading-[1.1] tracking-[-0.02em]">
          What Front of House knows
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Sent with every request. The agent may only use these facts and the review itself, nothing it
          makes up.
        </p>

        <div className="mt-5 space-y-3">
          {sections.map((s) => (
            <details
              key={s.title}
              open={s.title === "Reply policy" || s.title.startsWith("Escalate")}
              className="group rounded-2xl bg-white/75 px-4 py-3 open:bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-serif text-[17.5px] tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {s.title}
                <span aria-hidden className="text-[15px] text-ink-faint transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-2 space-y-2">
                {s.blocks.map((b, i) =>
                  b.kind === "text" ? (
                    <p key={i} className="text-[13.5px] leading-snug text-ink-soft">
                      {b.lines.join(" ")}
                    </p>
                  ) : (
                    <ul key={i} className="space-y-1.5">
                      {b.lines.map((line) => (
                        <li key={line} className="relative pl-3.5 text-[13.5px] leading-snug text-ink-soft">
                          <span className="absolute left-0 top-[0.55em] size-1 rounded-full bg-ink-faint" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </aside>
  );
}
