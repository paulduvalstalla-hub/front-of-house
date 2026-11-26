import { Logo, Stars } from "@/components/brand";
import { PlatformLogo } from "@/components/platform-logo";
import { DEMO_REVIEWS, timeAgo, type DemoReview } from "@/lib/demo-reviews";
import { RiskBadge, type Risk } from "./risk-badge";

// A static rendition of the dashboard inbox, built from the same demo data the app uses.
const ROWS: { id: string; risk: Risk }[] = [
  { id: "g-sarah", risk: "ready" },
  { id: "t-helene", risk: "hold" },
  { id: "y-mark", risk: "tell" },
  { id: "o-chen", risk: "ready" },
  { id: "g-dana", risk: "hold" },
  { id: "g-priya", risk: "ready" },
  { id: "t-james", risk: "ready" },
  { id: "y-kevin", risk: "hold" },
];

const byId = (id: string) => DEMO_REVIEWS.find((r) => r.id === id) as DemoReview;

const NAV = [
  { label: "Inbox", count: "9", active: true, icon: "inbox" },
  { label: "Analytics", icon: "chart" },
  { label: "Integrations", icon: "plug" },
  { label: "Brand voice", icon: "voice" },
  { label: "Billing", icon: "card" },
] as const;

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 20 20" className="size-[15px]" aria-hidden>
      {name === "inbox" && <path {...common} d="M3 11.5l2-6.5h10l2 6.5v4H3zM3 11.5h4l1 2h4l1-2h4" />}
      {name === "chart" && <path {...common} d="M4 16V9M10 16V4M16 16v-5" />}
      {name === "plug" && <path {...common} d="M7 3v4M13 3v4M5 7h10v3a5 5 0 0 1-10 0zM10 15v2" />}
      {name === "voice" && <path {...common} d="M4 5h12M4 9h12M4 13h7" />}
      {name === "card" && <path {...common} d="M3 6h14v9H3zM3 9h14" />}
    </svg>
  );
}

const DRAFT =
  "Hi Sarah, thank you for coming in to celebrate your mom's 60th. It made our evening to hear the duck confit was perfect. Please pass on our congratulations to her. I'm glad Léa remembered the occasion and brought that candle to the crème brûlée. We'd love to welcome you both back.";

export function ProductWindow() {
  const selected = byId("g-sarah");
  return (
    <div className="overflow-hidden rounded-[18px] border border-line-strong bg-night/95 text-left shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8),0_0_0_1px_rgb(0_0_0/0.4)] backdrop-blur">
      {/* window bar */}
      <div className="flex h-10 items-center gap-3 border-b border-line bg-night-2/80 px-4">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-linen/15" />
          <span className="size-2.5 rounded-full bg-linen/15" />
          <span className="size-2.5 rounded-full bg-linen/15" />
        </span>
        <span className="mx-auto truncate whitespace-nowrap rounded-md bg-night-3/80 px-3 py-0.5 text-micro text-smoke">
          Petit Comptoir, inbox
        </span>
        <span className="w-[46px]" aria-hidden />
      </div>

      <div className="grid h-auto grid-cols-1 md:h-[560px] md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[188px_320px_minmax(0,1fr)]">
        {/* sidebar */}
        <aside className="hidden flex-col border-r border-line bg-night-2/60 px-3 py-4 lg:flex">
          <Logo size={15} className="px-2" />
          <div className="mt-5 rounded-lg border border-line bg-night-3/50 px-2.5 py-2">
            <p className="text-small font-medium text-linen">Petit Comptoir</p>
            <p className="text-micro text-smoke-2">South End, Boston</p>
          </div>
          <nav className="mt-4 flex flex-col gap-0.5">
            {NAV.map((n) => (
              <span
                key={n.label}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-small ${
                  "active" in n ? "bg-night-4/70 text-linen" : "text-smoke"
                }`}
              >
                <NavIcon name={n.icon} />
                {n.label}
                {"count" in n && (
                  <span className="ml-auto rounded-full bg-night-4 px-1.5 text-micro tabular-nums text-linen/90">
                    {n.count}
                  </span>
                )}
              </span>
            ))}
          </nav>
          <div className="mt-auto rounded-lg border border-line px-2.5 py-2">
            <p className="text-micro text-smoke">Pro trial</p>
            <p className="text-micro text-smoke-2">12 days left</p>
          </div>
        </aside>

        {/* review list */}
        <section className="hidden min-w-0 flex-col border-r border-line md:flex">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-small font-medium">Needs reply</p>
            <span className="rounded-md bg-linen px-2.5 py-1 text-micro font-semibold text-night">
              Triage all
            </span>
          </div>
          <div className="flex gap-1 border-b border-line px-3 py-2 text-micro text-smoke">
            <span className="rounded-md bg-night-3 px-2 py-0.5 text-linen">All 9</span>
            <span className="px-2 py-0.5">With owner 3</span>
            <span className="px-2 py-0.5">Replied 2</span>
          </div>
          <ul className="flex-1 overflow-hidden">
            {ROWS.map(({ id, risk }) => {
              const r = byId(id);
              const active = id === selected.id;
              return (
                <li
                  key={id}
                  className={`border-b border-line px-4 py-2.5 ${active ? "bg-night-3/80 shadow-[inset_2px_0_0_#f3eee4]" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <PlatformLogo platform={r.platform} size={14} />
                    <span className="truncate text-small font-medium">{r.author}</span>
                    <Stars value={r.stars} className="text-micro" />
                    <span className="ml-auto shrink-0 text-micro text-smoke-2">{timeAgo(r.hoursAgo)}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-micro text-smoke">{r.text}</p>
                  <RiskBadge risk={risk} size={12} className="mt-1.5" />
                </li>
              );
            })}
          </ul>
        </section>

        {/* open review */}
        <section className="flex min-w-0 flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-3">
            <PlatformLogo platform={selected.platform} size={32} tile />
            <div className="min-w-0">
              <p className="text-small font-medium">{selected.author}</p>
              <p className="text-micro text-smoke-2">Google review, {timeAgo(selected.hoursAgo)}</p>
            </div>
            <Stars value={selected.stars} className="ml-auto text-micro" />
          </div>
          <div className="flex-1 space-y-4 overflow-hidden px-5 py-4">
            <p className="max-w-[64ch] font-serif text-small italic leading-relaxed text-smoke">{selected.text}</p>

            <div className="overflow-hidden rounded-xl border border-line-strong bg-night-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-2.5">
                <RiskBadge risk="ready" className="font-medium !text-linen" />
                <span className="text-micro text-smoke-2">Positive review, no escalation or flag triggers.</span>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-micro leading-snug text-smoke-2">
                  <span className="text-smoke">Praised:</span> duck confit was perfect, server remembered the
                  celebration, candle in the crème brûlée
                </p>
                <p className="mt-3 font-serif text-body leading-[1.6] text-linen">{DRAFT}</p>
                <p className="mt-2 font-serif text-body text-linen">— Camille, General Manager</p>
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-linen px-3 py-1.5 text-micro font-semibold text-night">
                    Approve and post
                  </span>
                  <span className="rounded-md border border-line-strong px-3 py-1.5 text-micro text-linen">
                    Edit
                  </span>
                  <span className="hidden rounded-md border border-line px-2.5 py-1 text-micro text-smoke sm:inline">
                    Shorter
                  </span>
                  <span className="hidden rounded-md border border-line px-2.5 py-1 text-micro text-smoke sm:inline">
                    In French
                  </span>
                  <span className="ml-auto text-micro text-smoke-2">55 words</span>
                </div>
              </div>
              <div className="border-t border-line px-4 py-2.5 text-micro text-smoke">
                <span className="font-medium text-linen">For Camille only:</span> pass the compliment on to Léa.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
