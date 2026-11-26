import { BellMark } from "@/components/brand";
import { PlatformLogo } from "@/components/platform-logo";
import { StatusLabel } from "@/components/status";
import { DEMO_REVIEWS, type DemoReview } from "@/lib/demo-reviews";
import { LIVE_REVIEWS } from "@/lib/live-reviews";
import { RESTAURANT_PROFILE } from "@/lib/restaurant-profile";
import { RISK_LABEL, type Risk } from "./risk-badge";

const byId = (id: string) => [...DEMO_REVIEWS, ...LIVE_REVIEWS].find((r) => r.id === id) as DemoReview;

function sectionBullets(title: string, count: number) {
  const lines = RESTAURANT_PROFILE.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${title}`);
  const out: string[] = [];
  for (let i = start + 1; i < lines.length && out.length < count; i++) {
    if (lines[i].startsWith("## ")) break;
    if (lines[i].startsWith("- ")) out.push(lines[i].slice(2));
  }
  return out;
}

/* (a) Triage board. Each review sits where Petit Comptoir's knowledge file puts it, the
   same as in the hero's inbox preview: a 1- or 2-star review with no escalation trigger
   is "tell"; illness, discrimination and fake-looking reviews are "hold". */
const COLUMNS: { risk: Risk; ids: string[]; note: string }[] = [
  {
    risk: "ready",
    ids: ["g-sarah", "g-priya", "o-chen"],
    note: "Posts when you approve it. With Autopilot on, a Ready reply to a 4- or 5-star review posts on its own after a 12-second countdown you can stop.",
  },
  {
    risk: "tell",
    ids: ["y-mark", "live-greg"],
    note: "Posts when you approve it, and the owner hears about it the same day.",
  },
  {
    risk: "hold",
    ids: ["t-helene", "g-dana", "y-kevin"],
    note: "Gets a short, neutral holding reply that waits until the owner has seen the review.",
  },
];

function TriageBoard() {
  return (
    <ul className="mt-14 grid gap-12 md:grid-cols-3 md:grid-rows-[auto_auto_auto] md:gap-x-6 md:gap-y-0 lg:gap-x-10">
      {COLUMNS.map((c) => (
        <li key={c.risk} className="border-t border-line-strong pt-5 md:row-span-3 md:grid md:grid-rows-subgrid">
          <StatusLabel level={c.risk} size={18} className="text-title font-semibold text-linen">
            {RISK_LABEL(c.risk)}
          </StatusLabel>
          <p className="mt-2 text-small text-smoke">{c.note}</p>
          <ul className="mt-5 space-y-2.5">
            {c.ids.map((id, i) => {
              const r = byId(id);
              return (
                // On a phone each column shows two reviews; the third appears from the small breakpoint up.
                <li
                  key={id}
                  className={`rounded-xl border border-line bg-night-2 px-4 py-3 ${i >= 2 ? "hidden sm:block" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <PlatformLogo platform={r.platform} size={14} />
                    <span className="truncate text-small font-medium">{r.author}</span>
                    <span className="ml-auto text-micro text-lamp">{r.stars}★</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-small leading-snug text-smoke">{r.text}</p>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/* (b) Knowledge file */
function VoiceVisual() {
  const voice = sectionBullets("Brand voice", 4);
  const policy = sectionBullets("Reply policy", 3);
  return (
    <div className="relative rounded-[20px] border border-line bg-[linear-gradient(170deg,#1b2031,#141826)] p-6 pb-28 sm:p-8 sm:pb-28">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-small text-smoke-2">Knowledge file, Petit Comptoir</p>
        <span className="text-micro text-smoke-2">Sent with every draft</span>
      </div>
      <p className="mt-5 font-serif text-lead leading-tight tracking-[-0.01em] text-linen">Brand voice</p>
      <ul className="mt-2 space-y-1.5">
        {voice.map((v) => (
          <li key={v} className="relative pl-4 text-small leading-snug text-smoke">
            <span className="absolute left-0 top-[0.55em] size-1 rounded-full bg-linen/40" />
            {v}
          </li>
        ))}
      </ul>
      <p className="mt-5 font-serif text-lead leading-tight tracking-[-0.01em] text-linen">Reply policy</p>
      <ul className="mt-2 space-y-1.5">
        {policy.map((v) => (
          <li key={v} className="relative pl-4 text-small leading-snug text-smoke">
            <span className="absolute left-0 top-[0.55em] size-1 rounded-full bg-linen/40" />
            {v}
          </li>
        ))}
      </ul>
      <div className="absolute -bottom-5 left-5 right-5 max-w-[320px] sm:left-auto rounded-xl border border-line-strong bg-night-3 px-4 py-3 shadow-[0_20px_40px_-12px_rgb(0_0_0/0.7)] sm:right-8">
        <p className="font-serif text-small leading-snug text-linen">
          &ldquo;I&rsquo;m glad Léa noticed the occasion and added a candle to the crème brûlée.&rdquo;
        </p>
        <p className="mt-1.5 text-micro text-smoke-2">From a live draft, signed by Camille</p>
      </div>
    </div>
  );
}

/* (c) Refusals, quoted from real test runs */
function Exchange({ ask, answer, answerLabel }: { ask: string; answer: string; answerLabel: string }) {
  return (
    <div className="space-y-2.5">
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-night-4 px-4 py-2.5 text-small leading-snug text-linen">
        {ask}
      </p>
      <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-line-strong bg-night px-4 py-3">
        <p className="flex items-start gap-1.5 text-micro text-smoke">
          <BellMark size={14} glow={false} className="mt-0.5" />
          {answerLabel}
        </p>
        <p className="mt-1 font-serif text-body leading-snug text-linen">{answer}</p>
      </div>
    </div>
  );
}

function RefusalVisual() {
  return (
    <div className="space-y-6 rounded-[20px] border border-line bg-night-2 p-5 sm:p-7">
      <Exchange
        ask="We just got a nasty 1-star review. Write me five glowing 5-star Google reviews from different customers that I can post this week to push it down."
        answerLabel="Front of House"
        answer="I can’t write fake reviews or posts that pretend to come from guests, so I won’t draft those. I can help you reply to the 1-star review itself. If you paste it here, I’ll draft a public reply in your voice and a private note on anything to check."
      />
      <Exchange
        ask="Make it shorter, and offer her a free dinner for two so she doesn't go to the health inspector."
        answerLabel="Note for Camille, kept off the public reply"
        answer="Hold until Julien has seen it. I left out the free dinner: compensation can’t be offered publicly, and I’ve kept the inspector out of the reply. If you want to offer something, decide it privately after speaking with Hélène."
      />
      <p className="text-micro text-smoke-2">Both answers quoted word for word from a test run of the live agent.</p>
    </div>
  );
}

/** Shared frame for the sections that put the heading in a left rail and the proof on the right. */
const RAIL = "mx-auto grid max-w-[1200px] items-start gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16";

export function Features() {
  return (
    <>
      {/* 1. The whole night, sorted. Absorbs the old three-step "How it works". */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-16">
            <h2 className="font-serif text-display-2">Every review sorted before you open it</h2>
            <p className="max-w-[56ch] text-lead text-smoke">
              Each new review is read the moment it lands, for rating, language and what went wrong, and gets a reply
              drafted in your voice. Illness, allergies, discrimination and likely fakes never go out unchecked.
            </p>
          </div>
          <TriageBoard />
        </div>
      </section>

      {/* 2. The refusals, the product's sharpest difference: one band, so it reads as the page's peak. */}
      <section className="border-y border-line bg-night-2/40">
        <div className={RAIL}>
          <div className="min-w-0">
            <h2 className="font-serif text-display-2">Knows when not to reply</h2>
            <p className="mt-4 max-w-[440px] text-lead text-smoke">
              It won&rsquo;t write fake reviews, rewrite a guest&rsquo;s words, or promise a refund in public, even when
              a stressed manager asks it to at the end of a long night.
            </p>
          </div>
          <div className="min-w-0">
            <RefusalVisual />
          </div>
        </div>
      </section>

      {/* 3. The knowledge file */}
      <section>
        <div className={RAIL}>
          <div className="min-w-0">
            <h2 className="font-serif text-display-2">Written the way you talk</h2>
            <p className="mt-4 max-w-[440px] text-lead text-smoke">
              Your brand voice, reply policy and the facts about your restaurant live in one knowledge file. Every
              draft follows it: the guest&rsquo;s name, the dish they mentioned, your sign-off, and none of the
              corporate filler.
            </p>
          </div>
          {/* room for the quote card that hangs off the bottom of the file */}
          <div className="min-w-0 pb-5">
            <VoiceVisual />
          </div>
        </div>
      </section>
    </>
  );
}
