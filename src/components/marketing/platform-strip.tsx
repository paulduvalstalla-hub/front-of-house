import { PlatformLogo } from "@/components/platform-logo";
import { PLATFORMS } from "@/lib/demo-reviews";

export function PlatformStrip() {
  return (
    <section id="integrations" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="min-w-0">
          <h2 className="font-serif text-display-3 [text-wrap:balance]">
            One inbox for Google, Tripadvisor, Yelp and OpenTable
          </h2>
          <p className="mt-3 max-w-[440px] text-small leading-relaxed text-smoke-2">
            New reviews from all four land in one inbox, newest first. In this prototype the connections are
            simulated with sample reviews; the AI reading, triage and drafting are live.
          </p>
        </div>
        <ul className="grid min-w-0 grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {PLATFORMS.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 bg-night px-4 py-4 sm:flex-row sm:items-center sm:gap-3.5 sm:px-5">
              <PlatformLogo platform={p.id} size={40} tile />
              <div className="min-w-0">
                <p className="text-body font-medium text-linen">{p.name}</p>
                <p className="hidden text-small text-smoke-2 sm:block">{p.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
