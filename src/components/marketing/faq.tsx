const QUESTIONS = [
  {
    q: "Does it post replies on its own?",
    a: "Only with Autopilot on, and only the safe ones: a reply marked Ready to a 4- or 5-star review posts after a 12-second countdown you can stop. Every other reply waits for your approval, and reviews about illness, allergies, discrimination, legal threats or a suspected fake are always held for the owner. Autopilot is included in every plan.",
  },
  {
    q: "Which platforms does it work with?",
    a: "Google Business Profile, Tripadvisor, Yelp and OpenTable. In this prototype the connections are simulated with sample reviews and nothing is actually posted; the reading, sorting and drafting run live on every review.",
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
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <h2 className="font-serif text-display-2 [text-wrap:balance]">
          Questions managers ask first
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-md py-4 text-title font-medium text-linen [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-smoke transition group-open:rotate-45"
                >
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                    <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-[620px] pb-5 text-body [text-wrap:pretty] text-smoke">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
