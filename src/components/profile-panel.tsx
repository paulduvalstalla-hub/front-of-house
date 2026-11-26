import { RESTAURANT_PROFILE } from "@/lib/restaurant-profile";

type Section = { title: string; intro: string[]; bullets: string[] };

function parseProfile(md: string): Section[] {
  const sections: Section[] = [];
  for (const line of md.split("\n")) {
    if (line.startsWith("## ")) {
      sections.push({ title: line.slice(3).trim(), intro: [], bullets: [] });
    } else if (sections.length > 0 && line.startsWith("- ")) {
      sections[sections.length - 1].bullets.push(line.slice(2).trim());
    } else if (sections.length > 0 && line.trim()) {
      sections[sections.length - 1].intro.push(line.trim());
    }
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
                <span
                  aria-hidden
                  className="text-[15px] text-ink-faint transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              {s.intro.length > 0 && (
                <p className="mt-2 text-[13.5px] text-ink-soft">{s.intro.join(" ")}</p>
              )}
              <ul className="mt-2 space-y-1.5">
                {s.bullets.map((b) => (
                  <li key={b} className="relative pl-3.5 text-[13.5px] leading-snug text-ink-soft">
                    <span className="absolute left-0 top-[0.55em] size-1 rounded-full bg-ink-faint" />
                    {b}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </aside>
  );
}
