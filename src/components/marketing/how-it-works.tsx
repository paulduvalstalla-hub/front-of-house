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
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden
            className="absolute left-[22px] right-[22px] top-[22px] hidden h-px bg-[linear-gradient(90deg,#f2b66d,rgb(243_238_228/0.12))] md:block"
          />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span
                className={`relative grid size-11 place-items-center rounded-full border font-serif text-[20px] ${
                  i === 0 ? "border-lamp bg-night text-lamp" : "border-line-strong bg-night text-linen"
                }`}
              >
                {i + 1}
              </span>
              <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-2 max-w-[320px] text-[15px] leading-relaxed text-smoke">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
