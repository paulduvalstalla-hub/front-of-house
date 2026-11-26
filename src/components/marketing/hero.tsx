import Link from "next/link";
import { DuskSky } from "./dusk-sky";
import { ProductWindow } from "./product-window";
import styles from "./marketing.module.css";

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
          className={`${styles.rise} mx-auto max-w-[900px] font-serif text-[46px] font-normal leading-[1.02] tracking-[-0.035em] text-linen [text-wrap:balance] sm:text-[68px] lg:text-[84px]`}
        >
          Every review answered in your own voice.
        </h1>
        <p
          className={`${styles.riseLate} mx-auto mt-7 max-w-[600px] text-[17px] leading-relaxed text-smoke sm:text-[18px]`}
        >
          Front of House reads every review from Google, TripAdvisor, Yelp and OpenTable, drafts a reply in your
          restaurant&rsquo;s voice, and holds the risky ones until the owner has seen them.
        </p>
        <div className={`${styles.riseLate} mt-9 flex flex-wrap items-center justify-center gap-3`}>
          <Link
            href="/sign-in"
            className="rounded-lg bg-linen px-6 py-3 text-[15px] font-semibold text-night transition hover:bg-white"
          >
            Start free trial
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-line-strong bg-night-2/60 px-6 py-3 text-[15px] font-medium text-linen transition hover:border-linen/40"
          >
            Try the live demo
          </Link>
        </div>
        <p className={`${styles.riseLate} mt-4 text-[13.5px] text-smoke-2`}>14-day free trial. No card needed.</p>

        <div className={`${styles.windowRise} relative mx-auto mt-16 max-w-[1120px] sm:mt-20`}>
          <ProductWindow />
        </div>
      </div>
    </section>
  );
}
