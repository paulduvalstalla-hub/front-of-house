import { ClosingCta, SiteFooter } from "@/components/marketing/closing";
import { Faq } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PlatformStrip } from "@/components/marketing/platform-strip";
import { Pricing } from "@/components/marketing/pricing";
import { SiteNav } from "@/components/marketing/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <PlatformStrip />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
