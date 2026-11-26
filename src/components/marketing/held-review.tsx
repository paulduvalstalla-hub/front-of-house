import { Stars } from "@/components/brand";
import { PlatformLogo } from "@/components/platform-logo";
import { StatusIcon, type StatusLevel } from "@/components/status";
import { DEMO_REVIEWS, timeAgo, type DemoReview } from "@/lib/demo-reviews";

const byId = (id: string) => DEMO_REVIEWS.find((r) => r.id === id) as DemoReview;

// The night's inbox at Petit Comptoir. Statuses follow the knowledge file and match
// the triage board further down the page.
const TONIGHT: Record<string, StatusLevel> = {
  "g-sarah": "ready",
  "t-helene": "hold",
  "y-mark": "tell",
  "g-priya": "ready",
  "o-chen": "ready",
  "g-dana": "hold",
  "y-kevin": "hold",
  "t-james": "ready",
};
const count = (level: StatusLevel) => Object.values(TONIGHT).filter((l) => l === level).length;
const SUMMARY: { level: StatusLevel; label: string }[] = [
  { level: "ready", label: "ready" },
  { level: "tell", label: "tell the owner" },
  { level: "hold", label: "held" },
];

// The review the hero opens on: a 1-star that describes a restaurant that doesn't exist.
const REVIEW = byId("y-kevin");

// The phrases the agent caught, and the line of Petit Comptoir's knowledge file each one contradicts.
const CHECKS = [
  { phrase: "lunch on Monday", fact: "Closed Mondays. No weekday lunch." },
  { phrase: "pizza", fact: "Dishes we don’t serve (pizza, sushi, burgers)." },
  { phrase: "parking lot", fact: "Street parking only." },
];

// Copied from the live agent's output for this review: test-runs/v3-product-live.txt, "fake" scenario.
const RISK_REASON =
  "The review describes a Monday lunch, pizza and a parking lot, which we don’t offer, so it may be fake and needs Julien’s review before posting.";
const REPLY =
  "Thank you for taking the time to write to us. I’m sorry you felt this way about your visit, and I am taking your feedback seriously. Please email me directly at hello@petitcomptoir.example so I can follow up with you personally.";
const NOTE =
  "Send to Julien before posting. The Monday lunch, pizza and parking lot details don’t match our hours or menu, so do not dispute them publicly. Check Resy and our reservation records for that party before deciding how to respond.";

function MarkedText({ text }: { text: string }) {
  const pattern = new RegExp(`(${CHECKS.map((c) => c.phrase).join("|")})`, "g");
  // Set straight apostrophes as typographic ones for the display quote (the data keeps the guest's text).
  return text.replace(/'/g, "’").split(pattern).map((part, i) =>
    CHECKS.some((c) => c.phrase === part) ? (
      <mark
        key={i}
        className="bg-transparent text-linen underline decoration-wine underline-offset-[0.16em] [text-decoration-thickness:max(2px,0.06em)]"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** Hero artefact: one held review from tonight's inbox, and what the agent did with it. */
export function HeldReview() {
  return (
    <figure className="text-left">
      <div className="overflow-hidden rounded-window border border-line-strong bg-night/95 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8)]">
        {/* the night so far */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line px-5 py-3 sm:px-8">
          <p className="text-small">
            <span className="font-medium text-linen">Petit Comptoir</span>
            <span className="ml-2.5 text-smoke-2">11:48 pm, {Object.keys(TONIGHT).length} new reviews</span>
          </p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-smoke sm:ml-auto">
            {SUMMARY.map((s) => (
              <li key={s.level} className="inline-flex items-center gap-1.5">
                <StatusIcon level={s.level} size={15} />
                <span className="tabular-nums text-linen">{count(s.level)}</span> {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid lg:grid-cols-2">
          {/* the guest */}
          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex items-center gap-3">
              <PlatformLogo platform={REVIEW.platform} size={36} tile />
              <div className="min-w-0">
                <p className="text-small font-medium text-linen">{REVIEW.author}</p>
                <p className="text-micro text-smoke-2">Yelp review, {timeAgo(REVIEW.hoursAgo)}</p>
              </div>
              <Stars value={REVIEW.stars} className="ml-auto text-small" />
            </div>
            <blockquote className="mt-6 font-serif text-display-3 text-linen">
              &ldquo;<MarkedText text={REVIEW.text} />&rdquo;
            </blockquote>
            <div className="mt-8 border-t border-line pt-5">
              <p className="text-micro text-smoke-2">Checked against Petit Comptoir&rsquo;s knowledge file</p>
              <dl className="mt-3 space-y-3 text-small sm:space-y-2">
                {CHECKS.map((c) => (
                  <div key={c.phrase} className="grid gap-x-4 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                    <dt className="text-smoke">&ldquo;{c.phrase}&rdquo;</dt>
                    <dd className="text-linen">{c.fact}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* the agent */}
          <div className="border-t border-line bg-night-2 px-5 py-7 sm:px-8 sm:py-9 lg:border-l lg:border-t-0">
            <p className="flex items-center gap-2.5 text-title font-semibold text-linen">
              <StatusIcon level="hold" size={20} />
              Hold for the owner
            </p>
            <p className="mt-2.5 max-w-[56ch] text-small text-smoke">{RISK_REASON}</p>

            <div className="mt-7 border-t border-line pt-6">
              <p className="text-micro text-smoke-2">Holding reply, waiting for Julien</p>
              <p className="mt-3 font-serif text-body text-linen">{REPLY}</p>
              <p className="mt-3 font-serif text-body text-linen">&mdash; Camille, General Manager</p>
            </div>

            <p className="mt-7 border-t border-line pt-6 text-small text-smoke">
              <span className="font-medium text-linen">For Camille only:</span> {NOTE}
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mx-auto mt-4 max-w-[60ch] text-center text-micro text-smoke-2">
        A sample review. The decision, the reply and the note are the live agent&rsquo;s own output, copied from a
        test run. Nothing is posted until Julien approves.
      </figcaption>
    </figure>
  );
}
