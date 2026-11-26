"use client";

import { useEffect, useRef, useState } from "react";
import { PlatformMark } from "@/components/brand";
import { DEMO_REVIEWS, PLATFORMS, type Platform } from "@/lib/demo-reviews";
import { useDesk } from "./desk-store";
import { CheckIcon } from "./icons";

type Step = "consent" | "importing" | "done";

function ConnectDialog({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  const desk = useDesk();
  const [step, setStep] = useState<Step>("consent");
  const ref = useRef<HTMLDialogElement>(null);
  const meta = PLATFORMS.find((p) => p.id === platform)!;
  const count = DEMO_REVIEWS.filter((r) => r.platform === platform).length;

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  function allow() {
    setStep("importing");
    window.setTimeout(() => {
      desk.connect(platform);
      setStep("done");
    }, 1400);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-[var(--radius-window)] border border-line-strong bg-night-2 p-0 text-linen shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] backdrop:bg-black/60"
    >
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <PlatformMark platform={platform} size={28} />
        <div>
          <p className="text-[15px] font-medium">Connect {meta.name}</p>
          <p className="text-[12.5px] text-smoke-2">Demo connector: no real account is contacted</p>
        </div>
      </div>

      {step === "consent" && (
        <div className="px-5 py-5">
          <p className="text-[14px] text-smoke">Front of House will be able to:</p>
          <ul className="mt-3 space-y-2.5 text-[14px]">
            <li className="flex gap-2.5">
              <CheckIcon className="mt-0.5 shrink-0 text-sage" /> Read new reviews for {desk.workspace.restaurant}
            </li>
            <li className="flex gap-2.5">
              <CheckIcon className="mt-0.5 shrink-0 text-sage" /> Post replies, only after you approve each one
            </li>
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-smoke-2">
            In this prototype the connection is simulated and {count} sample reviews are imported. Drafting replies to
            them uses the real AI agent.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="rounded-full px-4 py-2 text-[14px] text-smoke hover:text-linen"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={allow}
              className="rounded-full bg-lamp px-4 py-2 text-[14px] font-medium text-night hover:bg-lamp/90"
            >
              Allow and connect
            </button>
          </div>
        </div>
      )}

      {step === "importing" && (
        <div className="px-5 py-8 text-center" aria-live="polite">
          <p className="text-[15px]">Importing reviews from {meta.name}</p>
          <div className="mx-auto mt-4 h-1 w-48 overflow-hidden rounded-full bg-night-4">
            <div className="skeleton h-full w-full" />
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="px-5 py-6" aria-live="polite">
          <p className="flex items-center gap-2 text-[15px]">
            <CheckIcon className="text-sage" /> {meta.name} is connected
          </p>
          <p className="mt-2 text-[14px] text-smoke">
            {count} reviews were added to your inbox. Use Triage in the inbox to draft replies to all of them at once.
          </p>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="rounded-full bg-linen px-4 py-2 text-[14px] font-medium text-night"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function Integrations() {
  const desk = useDesk();
  const [connecting, setConnecting] = useState<Platform | null>(null);

  return (
    <div className="mx-auto max-w-[880px] px-5 py-8 lg:px-10">
      <h1 className="font-serif text-[30px] leading-none tracking-[-0.025em]">Integrations</h1>
      <p className="mt-3 max-w-[60ch] text-[14.5px] text-smoke">
        Connect the platforms your guests review you on. New reviews land in one inbox, and approved replies go back to
        the platform they came from.
      </p>
      <p className="mt-3 inline-flex rounded-lg border border-lamp/25 bg-lamp/[0.06] px-3 py-1.5 text-[13px] text-lamp">
        Prototype: these connectors are simulated with sample reviews.
      </p>

      <ul className="mt-8 divide-y divide-line rounded-[var(--radius-window)] border border-line">
        {PLATFORMS.map((p) => {
          const on = desk.connections[p.id];
          const count = DEMO_REVIEWS.filter((r) => r.platform === p.id).length;
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <PlatformMark platform={p.id} size={36} />
              <div className="min-w-[180px] flex-1">
                <p className="text-[15px] font-medium">{p.name}</p>
                <p className="text-[13px] text-smoke-2">{p.detail}</p>
              </div>
              <div className="text-[13px]">
                {on ? (
                  <span className="flex items-center gap-1.5 text-sage">
                    <span className="size-1.5 rounded-full bg-sage" /> Connected, {count} reviews
                  </span>
                ) : (
                  <span className="text-smoke-2">Not connected</span>
                )}
              </div>
              {on ? (
                <button
                  type="button"
                  onClick={() => desk.disconnect(p.id)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-[13.5px] text-smoke hover:border-line-strong hover:text-linen"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConnecting(p.id)}
                  className="rounded-full bg-linen px-3.5 py-1.5 text-[13.5px] font-medium text-night hover:bg-linen/90"
                >
                  Connect
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 font-serif text-[21px] tracking-[-0.015em]">Not in this prototype yet</h2>
      <ul className="mt-3 space-y-2 text-[14px] text-smoke">
        <li>Slack: a message to {desk.workspace.owner} whenever a review is held for them.</li>
        <li>Weekly email digest: ratings, response time and what guests mention most.</li>
        <li>Resy and SevenRooms guest notes, so replies can mention a regular by name.</li>
      </ul>

      {connecting && <ConnectDialog platform={connecting} onClose={() => setConnecting(null)} />}
    </div>
  );
}
