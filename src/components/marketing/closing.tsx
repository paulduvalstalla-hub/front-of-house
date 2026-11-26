import Link from "next/link";
import { Logo } from "@/components/brand";
import { DuskSky } from "./dusk-sky";

export function ClosingCta() {
  return (
    <section className="px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] border border-line">
        <DuskSky glow={0.7} />
        <div className="relative z-[3] px-6 py-24 text-center sm:py-32">
          <h2 className="mx-auto max-w-[760px] font-serif text-[40px] leading-[1.05] tracking-[-0.03em] sm:text-[60px]">
            Answer tonight&rsquo;s reviews before the chairs go up.
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-full bg-lamp px-6 py-3 text-[15px] font-semibold text-night shadow-[0_0_40px_-6px_rgb(242_182_109/0.7)] transition hover:bg-[#f6c584]"
            >
              Start free trial
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-linen/25 bg-night/40 px-6 py-3 text-[15px] font-medium text-linen backdrop-blur transition hover:border-linen/50"
            >
              Try the live demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1200px] px-5 pb-12 pt-10 sm:px-8">
      <div className="flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-start md:justify-between">
        <Logo size={18} />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-smoke">
          <a href="#product" className="hover:text-linen">
            Product
          </a>
          <a href="#integrations" className="hover:text-linen">
            Integrations
          </a>
          <a href="#pricing" className="hover:text-linen">
            Pricing
          </a>
          <Link href="/sign-in" className="hover:text-linen">
            Sign in
          </Link>
        </nav>
      </div>
      <p className="mt-8 max-w-[640px] text-[13px] leading-relaxed text-smoke-2">
        A prototype built for a Hult International Business School assignment. Petit Comptoir is a fictional
        restaurant; platform connections are simulated.
      </p>
    </footer>
  );
}
