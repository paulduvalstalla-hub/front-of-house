import Link from "next/link";
import { Logo } from "@/components/brand";
import { HomeLink } from "./home-link";
import { MobileMenu } from "./mobile-menu";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-night/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 sm:px-8">
        <HomeLink className="rounded-md">
          <Logo size={19} />
        </HomeLink>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-small text-smoke transition hover:text-linen"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/sign-in"
            className="hidden rounded-lg px-3 py-1.5 text-small text-smoke transition hover:text-linen sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/sign-in"
            className="hidden whitespace-nowrap rounded-lg bg-linen px-4 py-2 text-small font-semibold text-night transition hover:bg-white min-[400px]:inline-block"
          >
            Try the live demo
          </Link>
          <MobileMenu>
            <summary
              aria-label="Open menu"
              className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-line-strong text-smoke [&::-webkit-details-marker]:hidden"
            >
              <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                <path d="M4 7h12M4 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="absolute right-0 top-13 flex w-52 flex-col rounded-xl border border-line-strong bg-night-2 p-1.5 shadow-[0_20px_50px_-10px_rgb(0_0_0/0.7)]">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="rounded-lg px-3 py-2.5 text-small text-linen hover:bg-night-3">
                  {l.label}
                </a>
              ))}
              <Link href="/sign-in" className="rounded-lg px-3 py-2.5 text-small text-linen hover:bg-night-3">
                Sign in
              </Link>
              <Link
                href="/sign-in"
                className="mt-1 rounded-lg bg-linen px-3 py-2.5 text-small font-semibold text-night min-[400px]:hidden"
              >
                Try the live demo
              </Link>
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
