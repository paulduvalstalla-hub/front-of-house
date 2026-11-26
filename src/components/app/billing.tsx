"use client";

import Link from "next/link";
import { useDesk } from "./desk-store";
import { CheckIcon } from "./icons";

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    features: ["1 location", "All four platforms", "150 AI drafts a month", "Risk triage and owner alerts"],
  },
  {
    name: "Pro",
    price: "$79",
    features: ["Up to 3 locations", "Unlimited drafts", "Owner approval workflow", "Analytics and themes", "Replies in any language"],
    current: true,
  },
  {
    name: "Group",
    price: "Let's talk",
    features: ["4+ locations", "Roles and permissions", "Single sign-on", "Priority support"],
  },
];

export function Billing() {
  const desk = useDesk();
  return (
    <div className="mx-auto max-w-[960px] px-5 py-8 lg:px-10">
      <h1 className="font-serif text-[30px] leading-none tracking-[-0.025em]">Billing</h1>

      <section className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-window)] border border-line bg-line md:grid-cols-[1.3fr_1fr]">
        <div className="bg-night-2 p-6">
          <p className="text-[13px] text-smoke">Current plan</p>
          <p className="mt-1 font-serif text-[28px] tracking-[-0.02em]">Pro, free trial</p>
          <p className="mt-2 text-[14px] text-smoke">
            {desk.trialDaysLeft} days left. After the trial, Pro is $79 a month per restaurant group, billed monthly.
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-night-4">
            <div className="h-full rounded-full bg-lamp" style={{ width: `${(desk.trialDaysLeft / 14) * 100}%` }} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled
              aria-describedby="payments-note"
              className="cursor-not-allowed rounded-full bg-night-4 px-4 py-2 text-[14px] text-smoke"
            >
              Add a payment method
            </button>
            <span id="payments-note" className="text-[13px] text-smoke-2">
              Payments aren&rsquo;t enabled in this prototype.
            </span>
          </div>
        </div>
        <div className="bg-night-2 p-6">
          <p className="text-[13px] text-smoke">Usage this month</p>
          <p className="mt-1 font-serif text-[28px] tabular-nums tracking-[-0.02em]">{desk.drafts} drafts</p>
          <p className="mt-2 text-[14px] text-smoke">Unlimited on Pro. Starter includes 150 a month.</p>
          <p className="mt-4 text-[13px] text-smoke-2">
            Each draft costs about $0.0005 in AI usage with Claude Haiku 5.5.
          </p>
        </div>
      </section>

      <h2 className="mt-12 font-serif text-[21px] tracking-[-0.015em]">Plans</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`rounded-[var(--radius-window)] p-5 ${
              p.current ? "border border-lamp/50 bg-lamp/[0.05]" : "border border-line"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <p className="text-[15px] font-medium">{p.name}</p>
              {p.current && <span className="text-[12.5px] text-lamp">Your trial</span>}
            </div>
            <p className="mt-2 font-serif text-[26px] tracking-[-0.02em]">
              {p.price}
              {p.price.startsWith("$") && <span className="font-sans text-[13px] text-smoke"> a month</span>}
            </p>
            <ul className="mt-4 space-y-2 text-[13.5px] text-smoke">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <CheckIcon className="mt-0.5 shrink-0 text-smoke-2" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="mt-12 border-t border-line pt-6">
        <h2 className="text-[15px] font-medium">Restaurant</h2>
        <p className="mt-1 text-[13.5px] text-smoke">
          You&rsquo;re working as {desk.workspace.restaurant}
          {desk.workspace.mode === "sample" ? ", the sample restaurant." : "."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/onboarding"
            className="rounded-full border border-line px-4 py-1.5 text-[13.5px] text-smoke hover:border-line-strong hover:text-linen"
          >
            Set up a restaurant
          </Link>
          {desk.workspace.mode !== "sample" && (
            <button
              type="button"
              onClick={() => desk.startSample()}
              className="rounded-full border border-line px-4 py-1.5 text-[13.5px] text-smoke hover:border-line-strong hover:text-linen"
            >
              Switch to the sample restaurant
            </button>
          )}
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-[15px] font-medium">Reset the demo</h2>
        <p className="mt-1 text-[13.5px] text-smoke">
          Clears your restaurant, drafts, replies, connections and brand-voice edits saved in this browser, and starts
          onboarding again.
        </p>
        <button
          type="button"
          onClick={() => desk.resetDemo()}
          className="mt-3 rounded-full border border-line px-4 py-1.5 text-[13.5px] text-smoke hover:border-line-strong hover:text-linen"
        >
          Reset demo data
        </button>
      </section>
    </div>
  );
}
