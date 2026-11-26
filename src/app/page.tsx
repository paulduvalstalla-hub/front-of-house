import { ProfilePanel } from "@/components/profile-panel";
import { ReviewDesk } from "@/components/review-desk";

export default function Home() {
  return (
    <div className="min-h-dvh">
      <nav className="sticky top-3 z-20 mx-auto mt-3 flex max-w-[1180px] items-center justify-between rounded-full border border-black/5 bg-white/75 px-5 py-2.5 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.3)] backdrop-blur-md max-[1212px]:mx-4">
        <span className="whitespace-nowrap font-serif text-[21px] leading-none tracking-[-0.03em]">
          Front of House
          <span className="ml-2 hidden font-sans text-[13px] tracking-normal text-ink-faint sm:inline">
            for Petit Comptoir
          </span>
        </span>
        <span className="whitespace-nowrap rounded-full bg-paper px-3 py-1.5 text-[12.5px] text-ink-soft">
          Prototype<span className="hidden sm:inline"> · Claude Haiku 5.5</span>
        </span>
      </nav>

      <header className="mx-auto max-w-[1180px] px-4 pb-8 pt-12 sm:px-6 sm:pt-16">
        <p className="text-[12.5px] font-medium uppercase tracking-[0.14em] text-ink-soft">
          Review desk · South End, Boston
        </p>
        <h1 className="mt-4 max-w-[820px] font-serif text-[42px] font-normal leading-[1.02] tracking-[-0.04em] sm:text-[62px]">
          Answer every review in your own voice.
        </h1>
        <p className="mt-5 max-w-[620px] text-[17px] leading-relaxed text-ink-soft">
          Paste a guest review. Front of House reads it, checks it against Petit Comptoir&rsquo;s reply
          policy, and drafts a reply you can post — or tells you when Julien needs to see it first.
        </p>
      </header>

      <main className="mx-auto max-w-[1180px] px-2 pb-16 sm:px-6">
        <div className="rounded-[34px] bg-periwinkle p-2 sm:p-5 lg:p-7">
          <div className="grid gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <ReviewDesk />
            <ProfilePanel />
          </div>
        </div>

        <footer className="mx-auto mt-8 flex max-w-[1180px] flex-col gap-1 px-2 text-[13px] text-ink-faint sm:flex-row sm:justify-between">
          <span>Petit Comptoir is a fictional restaurant. Drafts are suggestions — a person posts every reply.</span>
          <span>Built for a Hult AI product assignment.</span>
        </footer>
      </main>
    </div>
  );
}
