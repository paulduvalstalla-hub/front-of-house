import Link from "next/link";
import { Logo } from "@/components/brand";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-night/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Front of House home" className="rounded-md">
          <Logo size={19} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-[14px] text-smoke transition hover:text-linen"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden rounded-full px-3 py-1.5 text-[14px] text-smoke transition hover:text-linen sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-lamp px-4 py-2 text-[14px] font-semibold text-night shadow-[0_0_24px_-4px_rgb(242_182_109/0.6)] transition hover:bg-[#f6c584]"
          >
            Start free trial
          </Link>
          <details className="relative md:hidden">
            <summary
              aria-label="Open menu"
              className="grid size-9 cursor-pointer list-none place-items-center rounded-full border border-line-strong text-smoke [&::-webkit-details-marker]:hidden"
            >
              <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                <path d="M4 7h12M4 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="absolute right-0 top-11 flex w-48 flex-col rounded-xl border border-line-strong bg-night-2 p-1.5 shadow-[0_20px_50px_-10px_rgb(0_0_0/0.7)]">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[14px] text-linen hover:bg-night-3">
                  {l.label}
                </a>
              ))}
              <Link href="/sign-in" className="rounded-lg px-3 py-2 text-[14px] text-linen hover:bg-night-3">
                Sign in
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
