"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlatformMark } from "@/components/brand";
import { PLATFORMS, type Platform } from "@/lib/demo-reviews";
import { useDesk } from "./desk-store";

/** Paste a real review into the inbox (platform connections are simulated in this prototype). */
export function AddReviewDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (id: string) => void }) {
  const desk = useDesk();
  const ref = useRef<HTMLDialogElement>(null);
  const [platform, setPlatform] = useState<Platform>("Google");
  const [author, setAuthor] = useState("");
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) return;
    const id = desk.addReview({
      platform,
      author: author.trim().slice(0, 60) || "A guest",
      stars,
      text: text.trim().slice(0, 4000),
    });
    onAdded(id);
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[var(--radius-window)] border border-line-strong bg-night-2 p-0 text-linen shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] backdrop:bg-black/60"
    >
      <form onSubmit={submit}>
        <div className="border-b border-line px-5 py-4">
          <p className="text-[15px] font-medium">Add a review</p>
          <p className="mt-0.5 text-[13px] text-smoke-2">
            Paste a review from any platform. Front of House drafts a reply as soon as you add it.
          </p>
        </div>
        <div className="space-y-4 px-5 py-5">
          <fieldset>
            <legend className="text-[13px] text-smoke">Where was it posted?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={platform === p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13.5px] ${
                    platform === p.id ? "border-line-strong bg-night-3 text-linen" : "border-line text-smoke hover:text-linen"
                  }`}
                >
                  <PlatformMark platform={p.id} size={18} /> {p.id}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-[13px] text-smoke">Guest name</span>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Maya R."
                className="mt-1.5 block w-full rounded-xl border border-line bg-night px-3.5 py-2 text-[14.5px] outline-none placeholder:text-smoke-2 focus:border-line-strong"
              />
            </label>
            <fieldset>
              <legend className="text-[13px] text-smoke">Rating</legend>
              <div className="mt-1.5 flex gap-0.5" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={stars === n}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    onClick={() => setStars(n)}
                    className={`grid size-9 place-items-center rounded-lg text-[18px] ${n <= stars ? "text-lamp" : "text-linen/20"} hover:bg-night-3`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <label className="block">
            <span className="text-[13px] text-smoke">Review</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              required
              minLength={10}
              placeholder="Paste the review text"
              className="mt-1.5 block w-full resize-y rounded-xl border border-line bg-night px-3.5 py-2.5 text-[14.5px] leading-relaxed outline-none placeholder:text-smoke-2 focus:border-line-strong"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button type="button" onClick={() => ref.current?.close()} className="rounded-full px-4 py-2 text-[14px] text-smoke hover:text-linen">
            Cancel
          </button>
          <button
            type="submit"
            disabled={text.trim().length < 10}
            className="rounded-full bg-lamp px-4 py-2 text-[14px] font-medium text-night disabled:bg-night-4 disabled:text-smoke-2"
          >
            Add and draft a reply
          </button>
        </div>
      </form>
    </dialog>
  );
}
