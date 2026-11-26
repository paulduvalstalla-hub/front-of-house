"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Stars } from "@/components/brand";
import { PlatformLogo } from "@/components/platform-logo";
import { StatusIcon } from "@/components/status";
import { useDesk, type DeskEvent } from "./desk-store";
import { CloseIcon } from "./icons";

const VISIBLE = 3;
const LIFETIME_MS = 6500;

function Toast({ event }: { event: DeskEvent }) {
  const desk = useDesk();
  const router = useRouter();
  const review = desk.findReview(event.reviewId);
  const record = desk.records[event.reviewId];
  const { dismissEvent } = desk;

  useEffect(() => {
    const timer = window.setTimeout(() => dismissEvent(event.key), LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, [event.key, dismissEvent]);

  if (!review) return null;

  let title: string;
  let detail: string;
  let icon;
  if (event.kind === "arrived") {
    title = `New ${review.platform} review`;
    detail = review.text;
    icon = <PlatformLogo platform={review.platform} size={18} />;
  } else if (event.kind === "posted") {
    title = `Reply posted to ${review.platform}`;
    detail = `Autopilot replied to ${review.author.replace(/\.$/, "")} on ${review.platform}`;
    icon = <StatusIcon level="ready" size={18} />;
  } else {
    title = `Held for ${desk.workspace.owner}`;
    detail = record?.draft?.riskReason ?? `${review.author}'s review needs the owner.`;
    icon = <StatusIcon level="hold" size={18} />;
  }

  return (
    <li className="toast-in pointer-events-auto relative w-[348px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-line-strong bg-night-2/95 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.8)] backdrop-blur">
      <button
        type="button"
        onClick={() => {
          desk.focusReview(event.reviewId);
          dismissEvent(event.key);
          router.push("/dashboard");
        }}
        className="flex w-full gap-3 px-4 py-3 pr-10 text-left hover:bg-night-3"
      >
        <span className="mt-0.5">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium text-linen">{title}</span>
          <span className="mt-0.5 flex items-center gap-2 text-[12.5px] text-smoke">
            <span className="truncate">{review.author}</span>
            <Stars value={review.stars} className="shrink-0 text-[11px]" />
          </span>
          <span className="mt-1 line-clamp-1 text-[12.5px] leading-snug text-smoke-2">{detail}</span>
        </span>
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismissEvent(event.key)}
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-md text-smoke-2 hover:bg-night-4 hover:text-linen"
      >
        <CloseIcon width={13} height={13} />
      </button>
    </li>
  );
}

/**
 * Notifications for what the agent sees and does: a review lands, a reply is posted, one is held.
 * On wide screens they sit over the review list, so they never cover the reply being read.
 */
export function AgentToasts() {
  const { events } = useDesk();
  const shown = events.slice(-VISIBLE).reverse();
  return (
    <ol
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 lg:left-[252px] lg:right-auto"
    >
      {shown.map((e) => (
        <Toast key={e.key} event={e} />
      ))}
    </ol>
  );
}
