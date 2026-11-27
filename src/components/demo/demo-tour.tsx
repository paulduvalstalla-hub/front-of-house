"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { startDemo } from "@/app/actions";
import { Logo, Stars } from "@/components/brand";
import { RiskBadge, type Risk } from "@/components/marketing/risk-badge";
import { PlatformLogo } from "@/components/platform-logo";
import { DEMO_REVIEWS } from "@/lib/demo-reviews";
import "@/components/marketing/marketing.css";

const review = (id: string) => {
  const r = DEMO_REVIEWS.find((x) => x.id === id);
  if (!r) throw new Error(`Missing sample review ${id}`);
  return r;
};

// The same three reviews, and the same decisions, as the landing page (taken from test runs of the live agent).
const EXAMPLES: { id: string; risk: Risk; why: string }[] = [
  { id: "g-sarah", risk: "ready", why: "Happy guest, nothing risky. Can post now." },
  { id: "y-mark", risk: "tell", why: "Posts, and Julien hears about the slow Saturday the same day." },
  { id: "y-kevin", risk: "hold", why: "Monday lunch, pizza, a parking lot: none of it exists here. Julien decides." },
];

const KNOWLEDGE = [
  "Dinner Tue–Sun, 5:30–10pm. Closed Mondays, no weekday lunch.",
  "Steak frites, duck confit, tarte tatin. Bouillabaisse on Fridays only.",
  "Never offer refunds or free meals in a public reply.",
  "Illness, allergies, discrimination or a likely fake: hold for Julien.",
];

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-window)] border border-line-strong bg-night-2/90 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function RestaurantPanel() {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-serif text-[22px] leading-tight">Petit Comptoir</p>
          <p className="text-micro text-smoke-2">French bistro · South End, Boston · 42 seats</p>
        </div>
        <div className="flex gap-1.5">
          <PlatformLogo platform="Google" size={18} />
          <PlatformLogo platform="TripAdvisor" size={18} />
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-line text-small">
        <div className="bg-night-2 px-5 py-3">
          <dt className="text-micro text-smoke-2">Replies signed by</dt>
          <dd className="mt-0.5">Camille, General Manager</dd>
        </div>
        <div className="bg-night-2 px-5 py-3">
          <dt className="text-micro text-smoke-2">Risky reviews go to</dt>
          <dd className="mt-0.5">Julien, the owner</dd>
        </div>
      </dl>
      <div className="border-t border-line px-5 py-4">
        <p className="text-micro text-smoke-2">From its knowledge file</p>
        <ul className="mt-2 space-y-1.5 text-small text-linen/90">
          {KNOWLEDGE.map((k) => (
            <li key={k} className="flex gap-2">
              <span aria-hidden className="mt-[9px] size-1 shrink-0 rounded-full bg-lamp" />
              {k}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function TriagePanel() {
  return (
    <Panel className="divide-y divide-line">
      {EXAMPLES.map(({ id, risk, why }) => {
        const r = review(id);
        return (
          <div key={id} className="px-5 py-4">
            <div className="flex items-center gap-2.5">
              <PlatformLogo platform={r.platform} size={16} />
              <span className="text-small font-medium">{r.author}</span>
              <Stars value={r.stars} className="text-micro" />
              <RiskBadge risk={risk} className="ml-auto" />
            </div>
            <p className="mt-2 line-clamp-2 font-serif text-[16px] leading-snug text-linen/85">&ldquo;{r.text}&rdquo;</p>
            <p className="mt-1.5 text-micro text-smoke">{why}</p>
          </div>
        );
      })}
    </Panel>
  );
}

function AutopilotPanel() {
  const r = review("g-sarah");
  return (
    <Panel>
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
        <span className="relative flex size-2">
          <span className="live-ping absolute inline-flex size-full rounded-full bg-sage" />
          <span className="relative inline-flex size-2 rounded-full bg-sage" />
        </span>
        <span className="text-small">Agent on</span>
        <span className="text-micro text-smoke-2">Watching Google and Tripadvisor</span>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <PlatformLogo platform={r.platform} size={16} />
          <span className="text-small font-medium">{r.author}</span>
          <Stars value={r.stars} className="text-micro" />
          <RiskBadge risk="ready" className="ml-auto" />
        </div>
        {/* Word for word from the live agent: test-runs/v3-product-live.txt, "happy" scenario. */}
        <p className="mt-3 font-serif text-[16px] leading-[1.55] text-linen/90">
          Hi Sarah, thank you so much. Happy 60th to your mom! It means a lot that the duck confit was perfect for the
          evening. Please tell Léa thank you from us&hellip;
        </p>
      </div>
      <div className="flex items-center gap-3 border-t border-line px-5 py-3.5">
        <span className="font-mono text-small tabular-nums text-lamp">0:12</span>
        <span className="flex-1 text-small text-smoke">Posting to Google unless someone steps in</span>
        <span className="rounded-lg border border-line-strong px-3 py-1 text-small text-linen">Stop</span>
      </div>
    </Panel>
  );
}

const STEPS: { kicker: string; title: string; body: ReactNode; panel: ReactNode }[] = [
  {
    kicker: "Your restaurant",
    title: "Tonight you’re Camille.",
    body: (
      <>
        <p>
          Camille runs the floor at Petit Comptoir, a fictional bistro in Boston. Guests review it on Google and
          Tripadvisor, and Front of House answers them for her.
        </p>
        <p>
          It knows the restaurant from a short knowledge file: hours, menu, who signs, and what never goes out
          unchecked. With your own account you build yours in five steps, or paste your menu.
        </p>
      </>
    ),
    panel: <RestaurantPanel />,
  },
  {
    kicker: "Triage",
    title: "Every review gets one of three labels.",
    body: (
      <>
        <p>
          The agent reads each review against the knowledge file, drafts a reply in Camille&rsquo;s voice, and decides
          how much a person needs to see it first.
        </p>
        <p>Ready replies can post. Anything about illness, allergies, discrimination or a likely fake waits for Julien.</p>
      </>
    ),
    panel: <TriagePanel />,
  },
  {
    kicker: "Autopilot",
    title: "Then it keeps going on its own.",
    body: (
      <>
        <p>
          While the inbox is open, new reviews land every half-minute and the agent drafts each one in seconds. A Ready
          reply to a happy 4- or 5-star review posts itself after a 12-second countdown you can stop.
        </p>
        <p>Everything else waits for a person. Posting is simulated: nothing reaches a real listing.</p>
      </>
    ),
    panel: <AutopilotPanel />,
  },
];

function StartButton({ children, variant }: { children: string; variant: "primary" | "link" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        variant === "primary"
          ? "rounded-lg bg-linen px-5 py-3 text-body font-semibold text-night transition hover:bg-white disabled:opacity-60"
          : "rounded-lg px-2 py-1.5 text-small text-smoke transition hover:text-linen disabled:opacity-60"
      }
    >
      {pending ? "Opening the inbox…" : children}
    </button>
  );
}

/** The demo's quick onboarding: three screens about the sample restaurant, then its live inbox. */
export function DemoTour() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="grain relative min-h-dvh overflow-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 70% 100%, rgb(242 182 109 / 0.16), transparent 75%), radial-gradient(90% 55% at 50% 0%, rgb(43 51 82 / 0.7), transparent 75%)",
        }}
      />
      <div className="relative z-[2] mx-auto flex min-h-dvh max-w-[1120px] flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Back to the Front of House home page" className="rounded-md">
            <Logo size={19} />
          </Link>
          <form action={startDemo}>
            <StartButton variant="link">Skip to the inbox</StartButton>
          </form>
        </header>

        <ol aria-label="Demo introduction progress" className="mt-8 grid max-w-[360px] grid-cols-3 gap-1.5">
          {STEPS.map((st, i) => (
            <li key={st.kicker}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className="block w-full py-1 text-left"
              >
                <span className={`block h-1 rounded-full ${i <= step ? "bg-linen/70" : "bg-night-4"}`} />
                <span className={`mt-2 block text-micro ${i === step ? "text-linen" : "text-smoke-2"}`}>
                  {i + 1}. {st.kicker}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div key={`copy-${step}`} className="foh-rise">
            <h1 className="font-serif text-display-2 text-linen [text-wrap:balance]">{s.title}</h1>
            <div className="mt-6 max-w-[48ch] space-y-4 text-lead text-smoke">{s.body}</div>
          </div>
          <div key={`panel-${step}`} className="foh-rise-late">
            {s.panel}
          </div>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-night/80 py-4 backdrop-blur lg:static lg:bg-transparent lg:backdrop-blur-none">
          <button
            type="button"
            onClick={() => setStep((n) => Math.max(0, n - 1))}
            disabled={step === 0}
            className="rounded-lg px-4 py-2 text-small text-smoke hover:text-linen disabled:invisible"
          >
            Back
          </button>
          {last ? (
            <form action={startDemo}>
              <StartButton variant="primary">Open Camille’s inbox</StartButton>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setStep((n) => n + 1)}
              className="rounded-lg bg-linen px-5 py-3 text-body font-semibold text-night transition hover:bg-white"
            >
              Continue
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
