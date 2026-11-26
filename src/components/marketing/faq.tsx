const QUESTIONS = [
  {
    q: "Does it post replies automatically?",
    a: "No. Front of House drafts the reply and you approve it. Nothing goes public until a person on your team says yes.",
  },
  {
    q: "Which platforms does it work with?",
    a: "Google Business Profile, TripAdvisor, Yelp and OpenTable. In this prototype the connections are simulated with sample reviews; the reading, triage and drafting run live on every review.",
  },
  {
    q: "What happens with risky reviews?",
    a: "Mentions of illness, allergic reactions, discrimination, legal threats, the health inspector, or signs of a fake review are held for the owner. The draft is a short neutral holding reply that admits no fault and disputes nothing.",
  },
  {
    q: "Can it write reviews for us?",
    a: "No. It refuses to write fake reviews or to rewrite what a guest said, even when asked in a roundabout way.",
  },
  {
    q: "What model does it use?",
    a: "Anthropic's Claude Haiku 5.5, guided by your restaurant's knowledge file: your facts, brand voice, reply policy and escalation rules.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <h2 className="font-serif text-[36px] leading-[1.08] tracking-[-0.025em] sm:text-[44px]">
          Questions managers ask first
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-md py-4 text-[16.5px] font-medium text-linen [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-smoke transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[620px] pb-5 text-[15px] leading-relaxed text-smoke">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
