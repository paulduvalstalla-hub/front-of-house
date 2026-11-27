import Link from "next/link";
import { DuskSky } from "./dusk-sky";
import { HeldReview } from "./held-review";
import "./marketing.css";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <DuskSky className="top-[26%]" />
      {/* fade the sky into the page above and below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[26%] z-[2] h-48 bg-[linear-gradient(180deg,#10131c,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-[linear-gradient(0deg,#10131c,transparent)]"
      />

      <div className="relative z-[3] mx-auto max-w-[1200px] px-5 pb-24 pt-16 text-center sm:px-8 sm:pt-24">
        <h1
          className={`foh-rise mx-auto max-w-[900px] font-serif text-display-1 font-normal text-linen [text-wrap:balance]`}
        >
          Every review answered in your own voice.
        </h1>
        <p
          className={`foh-rise-late mx-auto mt-7 max-w-[600px] text-lead text-smoke [text-wrap:pretty]`}
        >
          Front of House reads every review from Google, Tripadvisor, Yelp and OpenTable, drafts a reply in your
          restaurant&rsquo;s voice, and holds the risky ones until the owner has seen them.
        </p>
        <div className={`foh-rise-late mt-9 flex flex-wrap items-center justify-center gap-3`}>
          <Link
            href="/demo"
            className="rounded-lg bg-linen px-6 py-3 text-body font-semibold text-night transition hover:bg-white"
          >
            Try the live demo
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-line-strong bg-night-2/60 px-6 py-3 text-body font-medium text-linen transition hover:border-linen/40"
          >
            See how it works
          </a>
        </div>
        <p className={`foh-rise-late mt-4 text-small text-smoke-2`}>
          Opens Petit Comptoir, a sample restaurant. No account or card needed.
        </p>

        <div className={`foh-window-rise relative mx-auto mt-16 max-w-[1120px] sm:mt-20`}>
          <HeldReview />
        </div>
      </div>
    </section>
  );
}
