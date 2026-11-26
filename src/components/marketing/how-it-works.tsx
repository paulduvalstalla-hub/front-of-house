const STEPS = [
  {
    title: "Connect your platforms",
    body: "Link Google, Tripadvisor, Yelp and OpenTable. New reviews land in one inbox, newest first.",
  },
  {
    title: "Front of House drafts and sorts",
    body: "Each new review is read the moment it lands and gets a reply in your voice, marked Ready to post, Tell the owner, or Hold for the owner.",
  },
  {
    title: "Safe replies can post themselves",
    body: "With Autopilot on, a Ready reply to a 4- or 5-star review posts after a 12-second countdown you can stop. Every other reply waits for your approval.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <h2 className="max-w-[560px] font-serif text-display-2 [text-wrap:balance]">
          From new review to posted reply in three steps
        </h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-line-strong pt-5">
              <h3 className="text-title font-semibold tracking-[-0.01em]">
                <span className="mr-2 tabular-nums text-smoke-2">{i + 1}</span>
                {s.title}
              </h3>
              <p className="mt-2 max-w-[340px] text-body [text-wrap:pretty] text-smoke">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
