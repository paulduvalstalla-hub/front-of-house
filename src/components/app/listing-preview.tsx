"use client";

import type { DemoReview } from "@/lib/demo-reviews";
import type { Workspace } from "@/lib/workspace";

/*
 * A posted reply, drawn the way guests see it on the public listing: light
 * card, the platform's rating marks, the owner's response under the review.
 * This is a preview inside Front of House (the connection is simulated in the
 * prototype), so it is labelled as one wherever it is shown.
 */

const AVATAR = ["#1a73e8", "#e8710a", "#188038", "#d93025", "#9334e6", "#007b83", "#c5221f", "#1967d2"];

function avatarColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR[h % AVATAR.length];
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-medium text-white"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.42 }}
    >
      {name.trim().slice(0, 1).toUpperCase()}
    </span>
  );
}

function ago(ms: number) {
  const min = Math.floor(Math.max(0, ms) / 60_000);
  if (min < 1) return "just now";
  if (min === 1) return "a minute ago";
  if (min < 60) return `${min} minutes ago`;
  const h = Math.floor(min / 60);
  if (h === 1) return "an hour ago";
  if (h < 24) return `${h} hours ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "a day ago" : `${d} days ago`;
}

function GoogleStars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5 stars`} className="text-[15px] leading-none tracking-[0.02em]">
      <span className="text-[#fbbc04]">{"★".repeat(value)}</span>
      <span className="text-[#dadce0]">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function Bubbles({ value }: { value: number }) {
  return (
    <span aria-label={`${value} of 5 bubbles`} className="flex gap-[3px]">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="size-[13px] rounded-full border-[1.5px] border-[#00aa6c]"
          style={{ background: i < value ? "#00aa6c" : "transparent" }}
        />
      ))}
    </span>
  );
}

export function ListingPreview({
  review,
  reply,
  postedAt,
  now,
  workspace,
}: {
  review: DemoReview;
  reply: string;
  postedAt?: number;
  now: number;
  workspace: Workspace;
}) {
  const reviewAge = review.receivedAt ? now - review.receivedAt : review.hoursAgo * 3_600_000;
  const replyAge = postedAt ? now - postedAt : 0;

  if (review.platform === "TripAdvisor") {
    return (
      <div className="rounded-xl bg-white p-5 text-[#000a12] [font-family:Arial,Helvetica,sans-serif]">
        <div className="flex items-center gap-3">
          <Avatar name={review.author} size={40} />
          <div className="min-w-0">
            <p className="text-[14px] font-bold">{review.author}</p>
            {review.meta && <p className="text-[12.5px] text-[#545454]">{review.meta}</p>}
          </div>
        </div>
        <div className="mt-3">
          <Bubbles value={review.stars} />
        </div>
        {review.title && <p className="mt-2 text-[16px] font-bold leading-snug">{review.title}</p>}
        {review.visit && <p className="mt-1 text-[12.5px] text-[#545454]">{review.visit}</p>}
        <p className="mt-2 text-[14px] leading-[1.55]">{review.text}</p>
        <div className="mt-4 rounded-lg bg-[#f2f2f2] p-4">
          <p className="text-[13px] font-bold">
            Response from {workspace.manager}, {workspace.role} at {workspace.restaurant}
          </p>
          <p className="text-[12px] text-[#545454]">Responded {replyAge < 86_400_000 ? "today" : ago(replyAge)}</p>
          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.55]">{reply}</p>
        </div>
      </div>
    );
  }

  // Google (and the other platforms, which follow the same shape).
  return (
    <div className="rounded-xl bg-white p-5 text-[#202124] [font-family:Roboto,Arial,sans-serif]">
      <div className="flex items-center gap-3">
        <Avatar name={review.author} />
        <div className="min-w-0">
          <p className="text-[14.5px] font-medium">{review.author}</p>
          {review.meta && <p className="text-[12.5px] text-[#70757a]">{review.meta}</p>}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <GoogleStars value={review.stars} />
        <span className="text-[12.5px] text-[#70757a]">{ago(reviewAge)}</span>
      </div>
      {review.visit && <p className="mt-1.5 text-[12.5px] text-[#70757a]">{review.visit.split(" · ").join(" | ")}</p>}
      <p className="mt-2 text-[14px] leading-[1.55]">{review.text}</p>
      <div className="mt-4 rounded-lg bg-[#f1f3f4] p-4">
        <p className="text-[13px]">
          <span className="font-medium">Response from the owner</span>{" "}
          <span className="text-[#70757a]">{ago(replyAge)}</span>
        </p>
        <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-[1.55]">{reply}</p>
      </div>
    </div>
  );
}
