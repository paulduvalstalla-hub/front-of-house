"use client";

import Link from "next/link";
import { useState } from "react";

type Billing = "monthly" | "annual";

function price(monthly: number, billing: Billing) {
  return billing === "monthly" ? monthly : Math.round(monthly * 0.8);
}

function Check({ tone = "smoke" }: { tone?: "smoke" | "strong" }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-[3px] size-3.5 shrink-0 ${tone === "strong" ? "text-linen" : "text-smoke-2"}`} aria-hidden>
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Features({ items, tone }: { items: string[]; tone?: "smoke" | "strong" }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {items.map((f) => (
        <li key={f} className="flex gap-2.5 text-body leading-snug text-smoke">
          <Check tone={tone} />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const starter = price(29, billing);
  const pro = price(79, billing);

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-display-2 [text-wrap:balance]">
              Priced per restaurant, not per reply
            </h2>
            <p className="mt-3 max-w-[34rem] text-body text-smoke">
              Planned pricing: every plan will start with a 14‑day free trial. The live demo is open now, with no
              account or card.
            </p>
          </div>
          <div
            role="group"
            aria-label="Billing period"
            className="inline-flex self-start rounded-[10px] border border-line-strong bg-night-2 p-1 md:self-auto"
          >
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={billing === b}
                onClick={() => setBilling(b)}
                className={`rounded-md px-4 py-2.5 text-small transition ${
                  billing === b ? "bg-linen text-night" : "text-smoke hover:text-linen"
                }`}
              >
                {b === "monthly" ? "Monthly" : "Annual, save 20%"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1fr_1.25fr_1fr] lg:gap-0">
          {/* Starter: quiet column */}
          <div className="flex flex-col border-t border-line px-1 py-8 lg:border-y lg:border-l lg:border-line lg:px-8 lg:py-10">
            <h3 className="text-title font-semibold">Starter</h3>
            <p className="mt-1 text-small text-smoke-2">For a single restaurant getting started</p>
            <p className="mt-6 flex items-baseline gap-1.5">
              <span className="font-serif text-display-2 leading-none">${starter}</span>
              <span className="text-small text-smoke">a month</span>
            </p>
            <p className="mt-1.5 h-5 text-micro text-smoke-2">
              {billing === "annual" ? `Billed $${starter * 12} a year` : "Billed monthly"}
            </p>
            <Features
              items={[
                "1 location",
                "Google, Tripadvisor, Yelp and OpenTable",
                "150 reply drafts a month",
                "Risky reviews held for the owner",
                "Autopilot for safe 4- and 5-star replies",
              ]}
            />
            <div className="mt-auto pt-8">
              <Link
                href="/demo"
                className="block rounded-lg border border-line-strong px-5 py-2.5 text-center text-body font-medium transition hover:border-linen/40"
              >
                Try the live demo
              </Link>
            </div>
          </div>

          {/* Pro: the raised, lit panel */}
          <div className="relative flex flex-col rounded-[16px] border border-line-strong bg-night-2 px-6 py-8 sm:px-9 lg:-my-4 lg:py-12">
            <h3 className="relative text-title font-semibold">Pro</h3>
            <p className="relative mt-1 text-small text-smoke">For busy rooms and small groups</p>
            <p className="relative mt-6 flex items-baseline gap-1.5">
              <span className="font-serif text-display-2 leading-none text-linen">${pro}</span>
              <span className="text-small text-smoke">a month</span>
            </p>
            <p className="relative mt-1.5 h-5 text-micro text-smoke-2">
              {billing === "annual" ? `Billed $${pro * 12} a year` : "Billed monthly"}
            </p>
            <Features
              tone="strong"
              items={[
                "Everything in Starter",
                "Up to 3 locations",
                "Unlimited reply drafts",
                "Analytics on ratings, response time and themes",
                "Replies in any language your guests write in",
              ]}
            />
            <div className="relative mt-auto pt-8">
              <Link
                href="/demo"
                className="block rounded-lg bg-linen px-5 py-3 text-center text-body font-semibold text-night transition hover:bg-white"
              >
                Try the live demo
              </Link>
            </div>
          </div>

          {/* Group: quiet column */}
          <div className="flex flex-col border-t border-line px-1 py-8 lg:border-y lg:border-r lg:border-line lg:px-8 lg:py-10">
            <h3 className="text-title font-semibold">Group</h3>
            <p className="mt-1 text-small text-smoke-2">For restaurant groups</p>
            <p className="mt-6 font-serif text-display-3">Let&rsquo;s talk</p>
            <p className="mt-1.5 h-5 text-micro text-smoke-2">Pricing by number of locations</p>
            <Features
              items={["Everything in Pro", "4 or more locations", "Roles and permissions per site", "Single sign-on (SSO)", "Priority support"]}
            />
            <div className="mt-auto pt-8">
              <Link
                href="/demo"
                className="block rounded-lg border border-line-strong px-5 py-2.5 text-center text-body font-medium transition hover:border-linen/40"
              >
                Try the live demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
