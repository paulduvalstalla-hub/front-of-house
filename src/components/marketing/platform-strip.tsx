import { PlatformLogo } from "@/components/platform-logo";
import { PLATFORMS } from "@/lib/demo-reviews";

export function PlatformStrip() {
  return (
    <section id="integrations" className="scroll-mt-20 border-y border-line bg-night-2/40">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-[360px]">
          <h2 className="font-serif text-display-3 [text-wrap:balance]">
            One inbox for Google, TripAdvisor, Yelp and OpenTable
          </h2>
          <p className="mt-3 text-small leading-relaxed text-smoke-2">
            In this prototype the platform connections are simulated with sample reviews. The AI reading,
            triage and drafting are live.
          </p>
        </div>
        <ul className="grid flex-1 grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <li key={p.id} className="flex items-center gap-3.5 bg-night px-5 py-4">
              <PlatformLogo platform={p.id} size={40} tile />
              <div className="min-w-0">
                <p className="text-body font-medium text-linen">{p.name}</p>
                <p className="text-small text-smoke-2">{p.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
