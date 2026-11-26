const STEPS = [
  {
    title: "Connect your platforms",
    body: "Link Google, TripAdvisor, Yelp and OpenTable. New reviews land in one inbox, newest first.",
  },
  {
    title: "Front of House drafts and triages",
    body: "One click on Triage all reads every new review, drafts a reply in your voice and flags what the owner must see.",
  },
  {
    title: "You approve and post",
    body: "Edit a line if you want, then approve. Nothing is posted until a person says yes.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <h2 className="max-w-[560px] font-serif text-[36px] leading-[1.08] tracking-[-0.025em] sm:text-[44px]">
          From new review to posted reply in three steps
        </h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-line-strong pt-5">
              <span className="text-[13px] tabular-nums text-smoke-2">Step {i + 1}</span>
              <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-smoke">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
