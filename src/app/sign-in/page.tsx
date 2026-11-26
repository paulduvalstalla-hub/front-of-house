import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo, Stars } from "@/components/brand";
import { PlatformLogo } from "@/components/platform-logo";
import { DuskSky } from "@/components/marketing/dusk-sky";
import { RiskBadge } from "@/components/marketing/risk-badge";
import { SignInForm } from "@/components/marketing/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Front of House",
};

export default function SignInPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col bg-night-2 px-6 py-8 sm:px-12">
        <Link href="/" aria-label="Back to the Front of House home page" className="self-start rounded-md">
          <Logo size={19} />
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">
          <Suspense fallback={<div className="h-[520px] w-full max-w-[400px]" />}>
            <SignInForm />
          </Suspense>
        </div>
        <p className="text-micro text-smoke-2">
          A prototype for a Hult assignment. Petit Comptoir is fictional.
        </p>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <DuskSky />
        <div className="relative z-[3] flex h-full flex-col justify-center px-14 py-16">
          <figure className="max-w-[500px] rounded-2xl border border-line-strong bg-night/85 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.85)] backdrop-blur">
            <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
              <PlatformLogo platform="Google" size={18} />
              <span className="text-small font-medium">Sarah M.</span>
              <Stars value={5} className="text-micro" />
              <RiskBadge risk="ready" className="ml-auto" />
            </div>
            {/* Word for word from the live agent: test-runs/v3-product-live.txt, "happy" scenario. */}
            <blockquote className="px-5 py-5 font-serif text-lead text-linen">
              Hi Sarah, thank you so much. Happy 60th to your mom! It means a lot that the duck confit was perfect
              for the evening. Please tell Léa thank you from us. A candle in the crème brûlée is exactly the kind
              of moment we love. We&rsquo;re glad the room felt cosy and the wine was a hit. We look forward to
              welcoming you both back.
              <span className="mt-3 block">&mdash; Camille, General Manager</span>
            </blockquote>
            <figcaption className="border-t border-line px-5 py-3 text-micro text-smoke-2">
              Drafted by Front of House in 3 seconds, in a test run of the live agent.
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
