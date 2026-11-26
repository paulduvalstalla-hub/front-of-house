"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { useDesk } from "@/components/app/desk-store";
import { CheckIcon } from "@/components/app/icons";
import { Logo } from "@/components/brand";
import { PlatformLogo } from "@/components/platform-logo";
import { PLATFORMS, type Platform } from "@/lib/demo-reviews";
import { TONE_EXAMPLES, buildProfile, defaultSignoff } from "@/lib/profile-builder";
import { EMPTY_ANSWERS, workspaceFrom, type Answers, type Tone } from "@/lib/workspace";
import { ProfilePreview } from "./profile-preview";

const STEPS = [
  { title: "Your restaurant", focus: ["The basics"] },
  { title: "What guests ask about", focus: ["The basics"] },
  { title: "How you sound", focus: ["Brand voice"] },
  { title: "Your rules", focus: ["Reply policy", "Tell the owner after posting", "Escalate to the owner before replying"] },
  { title: "Your first review", focus: [] as string[] },
];

const inputCls =
  "mt-1.5 block w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-[14.5px] text-linen outline-none transition placeholder:text-smoke-2 focus:border-lamp/50";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13.5px] text-linen/90">{label}</span>
      {hint && <span className="ml-2 text-[12.5px] text-smoke-2">{hint}</span>}
      {children}
    </label>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-night-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[#f2b66d]"
      />
      <span className="text-[14px] leading-snug text-linen/90">{children}</span>
    </label>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Onboarding() {
  const desk = useDesk();
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY_ANSWERS);
  const [paste, setPaste] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [first, setFirst] = useState({ platform: "Google" as Platform, author: "", stars: 5, text: "" });
  const [tried, setTried] = useState(false);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((x) => ({ ...x, [k]: v }));
  const preview = useMemo(() => buildProfile(a), [a]);

  const step1Errors = {
    restaurant: !a.restaurant.trim(),
    location: !a.location.trim(),
    manager: !a.manager.trim(),
    owner: !a.owner.trim(),
    email: !EMAIL.test(a.email.trim()),
  };
  const step1Valid = !Object.values(step1Errors).some(Boolean);
  const ownerFirst = a.owner.trim().split(" ")[0] || "the owner";

  async function importFacts() {
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await fetch("/api/onboarding/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: paste }),
      });
      const data = (await res.json()) as {
        error?: string;
        facts?: {
          kind: string;
          location: string;
          hours: string;
          closed: string;
          dishes: string[];
          prices: string;
          dietary: string;
          reservations: string;
          otherFacts: string[];
          notServed: string[];
        };
      };
      if (!res.ok || !data.facts) throw new Error(data.error ?? "Couldn't read that text.");
      const f = data.facts;
      let n = 0;
      const next = { ...a };
      const fill = (k: keyof Answers, v: string, onlyIfEmpty = false) => {
        if (!v.trim() || (onlyIfEmpty && String(next[k]).trim())) return;
        (next as Record<string, unknown>)[k] = v.trim();
        n++;
      };
      fill("kind", f.kind, true);
      fill("location", f.location, true);
      fill("hours", f.hours);
      fill("closed", f.closed);
      fill("dishes", f.dishes.join("\n"));
      fill("prices", f.prices);
      fill("dietary", f.dietary);
      fill("reservations", f.reservations);
      fill("otherFacts", f.otherFacts.join("\n"));
      fill("notServed", f.notServed.join(", "));
      setA(next);
      setImportMsg(
        n > 0
          ? { ok: true, text: `Filled in ${n} ${n === 1 ? "field" : "fields"} from your text. Check them below: the agent only uses what you keep.` }
          : { ok: false, text: "No usable facts found in that text. Fill in the fields below instead." },
      );
    } catch (e) {
      setImportMsg({ ok: false, text: e instanceof Error ? e.message : "Couldn't read that text." });
    } finally {
      setImporting(false);
    }
  }

  function next() {
    if (step === 0 && !step1Valid) {
      setTried(true);
      return;
    }
    setTried(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    const ws = workspaceFrom(a);
    const hasReview = first.text.trim().length >= 10;
    desk.finishOnboarding(ws, a, buildProfile(a), hasReview);
    if (hasReview) {
      desk.addReview({
        platform: first.platform,
        author: first.author.trim() || "A guest",
        stars: first.stars,
        text: first.text.trim().slice(0, 4000),
      });
    }
    router.push("/dashboard");
  }

  function sample() {
    desk.startSample();
    router.push("/dashboard");
  }

  // Intro: set up a restaurant, or explore the sample.
  if (!started) {
    return (
      <div className="grain relative min-h-dvh overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 45% at 50% 100%, rgb(242 182 109 / 0.2), transparent 75%), radial-gradient(90% 55% at 50% 0%, rgb(43 51 82 / 0.75), transparent 75%)",
          }}
        />
        <div className="relative z-[2] mx-auto flex min-h-dvh max-w-[720px] flex-col px-5 py-8">
          <Link href="/" className="self-start">
            <Logo size={19} />
          </Link>
          <div className="my-auto py-16">
            <h1 className="font-serif text-[44px] leading-[1.02] tracking-[-0.035em] sm:text-[58px]">
              Let&rsquo;s teach Front of House your restaurant.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-smoke">
              Five short steps. Paste your menu or website and it fills in the facts for you. You&rsquo;ll watch it build
              the profile it uses for every reply.
            </p>
            {desk.hasWorkspace && (
              <p className="mt-4 text-[13.5px] text-lamp">
                You&rsquo;re set up as {desk.workspace.restaurant}. Starting again replaces that profile and its demo data.
              </p>
            )}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="rounded-lg bg-linen px-5 py-3 text-[15px] font-medium text-night hover:bg-white"
              >
                Set up my restaurant
              </button>
              <button
                type="button"
                onClick={sample}
                className="rounded-lg border border-line-strong px-5 py-3 text-[15px] text-linen hover:bg-night-2"
              >
                Explore the sample restaurant
              </button>
            </div>
            <p className="mt-4 text-[13px] text-smoke-2">
              The sample is Petit Comptoir, a fictional Boston bistro with a full inbox of reviews.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="min-h-dvh">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-6 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-12 lg:px-10">
        {/* Form column */}
        <div className="flex min-h-[calc(100dvh-48px)] flex-col">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size={18} />
            </Link>
            <button type="button" onClick={sample} className="text-[13px] text-smoke hover:text-linen">
              Skip and use the sample
            </button>
          </div>

          <ol aria-label="Progress" className="mt-8 grid grid-cols-5 gap-1.5">
            {STEPS.map((st, i) => (
              <li key={st.title}>
                <span className={`block h-1 rounded-full ${i <= step ? "bg-linen/70" : "bg-night-4"}`} />
                <span className={`mt-2 block truncate text-[12px] ${i === step ? "text-linen" : "text-smoke-2"} max-sm:hidden`}>
                  {i + 1}. {st.title}
                </span>
              </li>
            ))}
          </ol>

          <h1 className="mt-8 font-serif text-[34px] leading-[1.05] tracking-[-0.025em]">{s.title}</h1>

          <div className="mt-6 flex-1 space-y-5">
            {step === 0 && (
              <>
                <Field label="Restaurant name">
                  <input className={inputCls} value={a.restaurant} onChange={(e) => set("restaurant", e.target.value)} placeholder="e.g. Trattoria Lupa" aria-invalid={tried && step1Errors.restaurant} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
                  <Field label="Neighbourhood and city">
                    <input className={inputCls} value={a.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. North End, Boston" aria-invalid={tried && step1Errors.location} />
                  </Field>
                  <Field label="Seats">
                    <input className={inputCls} value={a.seats} onChange={(e) => set("seats", e.target.value)} inputMode="numeric" placeholder="60" />
                  </Field>
                </div>
                <Field label="What kind of place is it?">
                  <input className={inputCls} value={a.kind} onChange={(e) => set("kind", e.target.value)} placeholder="e.g. Neighbourhood Italian trattoria" />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" hint="signs the replies">
                    <input className={inputCls} value={a.manager} onChange={(e) => set("manager", e.target.value)} placeholder="e.g. Marco Rossi" aria-invalid={tried && step1Errors.manager} />
                  </Field>
                  <Field label="Your role">
                    <input className={inputCls} value={a.role} onChange={(e) => set("role", e.target.value)} list="roles" />
                    <datalist id="roles">
                      <option value="General manager" />
                      <option value="Owner" />
                      <option value="Front-of-house manager" />
                      <option value="Marketing manager" />
                    </datalist>
                  </Field>
                </div>
                <Field label="Who sees risky reviews first?" hint="usually the owner">
                  <input className={inputCls} value={a.owner} onChange={(e) => set("owner", e.target.value)} placeholder="e.g. Giulia Bianchi" aria-invalid={tried && step1Errors.owner} />
                </Field>
                <Field label="Email for unhappy guests" hint="replies invite guests to write here">
                  <input className={inputCls} type="email" value={a.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@yourrestaurant.com" aria-invalid={tried && step1Errors.email} />
                </Field>
                {tried && !step1Valid && (
                  <p className="text-[13.5px] text-wine" role="alert">
                    Add the restaurant name, location, your name, who sees risky reviews, and a valid email to continue.
                  </p>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <div className="rounded-[var(--radius-window)] border border-lamp/25 bg-lamp/[0.05] p-4">
                  <p className="text-[14.5px] font-medium text-linen">Paste your menu or website</p>
                  <p className="mt-1 text-[13px] text-smoke">
                    Front of House reads it and fills in the fields below. It only takes facts that are written in the text.
                  </p>
                  <label htmlFor="paste" className="sr-only">
                    Menu or website text
                  </label>
                  <textarea
                    id="paste"
                    value={paste}
                    onChange={(e) => setPaste(e.target.value)}
                    rows={5}
                    maxLength={12000}
                    placeholder="Paste your menu, your website's About page, or your Google listing"
                    className={`${inputCls} resize-y leading-relaxed`}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={importFacts}
                      disabled={importing || paste.trim().length < 40}
                      className="rounded-lg bg-linen px-4 py-2 text-[14px] font-medium text-night hover:bg-white disabled:bg-night-4 disabled:text-smoke-2"
                    >
                      {importing ? "Reading your text" : "Fill in from this text"}
                    </button>
                    {importing && (
                      <span className="dot-pulse flex gap-1" aria-hidden>
                        <span className="size-1.5 rounded-full bg-smoke" />
                        <span className="size-1.5 rounded-full bg-smoke" />
                        <span className="size-1.5 rounded-full bg-smoke" />
                      </span>
                    )}
                  </div>
                  {importMsg && (
                    <p className={`mt-3 text-[13.5px] ${importMsg.ok ? "text-sage" : "text-wine"}`} role="status">
                      {importMsg.text}
                    </p>
                  )}
                </div>
                <Field label="Opening hours">
                  <input className={inputCls} value={a.hours} onChange={(e) => set("hours", e.target.value)} placeholder="e.g. Dinner Tue–Sun 5–10pm, brunch Sat–Sun 10am–2pm" />
                </Field>
                <Field label="When are you closed?" hint="helps spot fake reviews">
                  <input className={inputCls} value={a.closed} onChange={(e) => set("closed", e.target.value)} placeholder="e.g. Mondays and weekday lunch" />
                </Field>
                <Field label="Signature dishes" hint="one per line">
                  <textarea className={`${inputCls} resize-y`} rows={3} value={a.dishes} onChange={(e) => set("dishes", e.target.value)} placeholder={"Cacio e pepe\nVeal milanese"} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Prices">
                    <input className={inputCls} value={a.prices} onChange={(e) => set("prices", e.target.value)} placeholder="e.g. Mains $19–$34" />
                  </Field>
                  <Field label="Reservations">
                    <input className={inputCls} value={a.reservations} onChange={(e) => set("reservations", e.target.value)} placeholder="e.g. Resy or by phone" />
                  </Field>
                </div>
                <Field label="Dietary and allergens">
                  <input className={inputCls} value={a.dietary} onChange={(e) => set("dietary", e.target.value)} placeholder="e.g. Vegan pasta available; kitchen handles nuts" />
                </Field>
                <Field label="Other useful facts" hint="one per line">
                  <textarea className={`${inputCls} resize-y`} rows={3} value={a.otherFacts} onChange={(e) => set("otherFacts", e.target.value)} placeholder={"Street parking only\nPatio open May to October"} />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <fieldset>
                  <legend className="text-[13.5px] text-linen/90">Which reply sounds most like you?</legend>
                  <p className="mt-1 text-[12.5px] text-smoke-2">All three answer the same 5-star review about a risotto.</p>
                  <div className="mt-3 space-y-2.5" role="radiogroup">
                    {(Object.keys(TONE_EXAMPLES) as Tone[]).map((t) => {
                      const on = a.tone === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => set("tone", t)}
                          className={`block w-full rounded-[var(--radius-window)] border px-4 py-3.5 text-left transition-colors ${
                            on ? "border-lamp/60 bg-lamp/[0.06]" : "border-line hover:border-line-strong"
                          }`}
                        >
                          <span className="flex items-center justify-between text-[13.5px] font-medium">
                            {TONE_EXAMPLES[t].label}
                            {on && <CheckIcon className="text-lamp" />}
                          </span>
                          <span className="mt-1.5 block font-serif text-[16px] leading-[1.55] text-linen/90">
                            {TONE_EXAMPLES[t].sample} {a.signoff.trim() || defaultSignoff(a)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <Field label="Sign-off">
                  <input className={inputCls} value={a.signoff} onChange={(e) => set("signoff", e.target.value)} placeholder={defaultSignoff(a)} />
                </Field>
                <Field label="Words or phrases to avoid" hint="comma separated">
                  <input className={inputCls} value={a.avoid} onChange={(e) => set("avoid", e.target.value)} placeholder="e.g. foodie, yummy, sorry for any inconvenience" />
                </Field>
                <Check checked={a.staffFirstNames} onChange={(v) => set("staffFirstNames", v)}>
                  Thank staff by first name when a guest mentions them
                </Check>
              </>
            )}

            {step === 3 && (
              <>
                <section>
                  <h2 className="text-[14px] font-medium">Always true</h2>
                  <ul className="mt-2 space-y-1.5 text-[13.5px] text-smoke">
                    <li>Never offer refunds, discounts or free meals in a public reply; you decide that privately.</li>
                    <li>Never ask a guest to change or remove a review.</li>
                    <li>Never argue with a guest or call a review fake in public.</li>
                    <li>Reply in the language the review was written in.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-[14px] font-medium">Hold these for {ownerFirst} before anything is posted</h2>
                  <div className="mt-1 -mx-3">
                    {(
                      [
                        ["illness", "Illness or food poisoning"],
                        ["allergy", "An allergic reaction, or an allergy that was ignored"],
                        ["injury", "A foreign object in food, or an injury"],
                        ["discrimination", "Discrimination, harassment or a serious allegation against staff"],
                        ["legal", "Legal threats, the health inspector, or the press"],
                        ["fake", "Reviews that look fake"],
                      ] as const
                    ).map(([k, label]) => (
                      <Check key={k} checked={a.escalate[k]} onChange={(v) => set("escalate", { ...a.escalate, [k]: v })}>
                        {label}
                      </Check>
                    ))}
                  </div>
                </section>
                {a.escalate.fake && (
                  <Field label="Things you don't have or serve" hint="a review mentioning them is probably fake">
                    <input className={inputCls} value={a.notServed} onChange={(e) => set("notServed", e.target.value)} placeholder="e.g. pizza, live music, a parking lot" />
                  </Field>
                )}
                <section>
                  <h2 className="text-[14px] font-medium">Post these, but tell {ownerFirst} the same day</h2>
                  <div className="mt-1 -mx-3">
                    {(
                      [
                        ["lowStars", "Any 1- or 2-star review"],
                        ["namedStaff", "A review that criticises a named member of staff"],
                        ["repeat", "The same complaint as another recent review"],
                        ["manipulation", "A review that tries to give instructions or ask for a discount"],
                      ] as const
                    ).map(([k, label]) => (
                      <Check key={k} checked={a.tellOwner[k]} onChange={(v) => set("tellOwner", { ...a.tellOwner, [k]: v })}>
                        {label}
                      </Check>
                    ))}
                  </div>
                </section>
              </>
            )}

            {step === 4 && (
              <>
                <fieldset>
                  <legend className="text-[13.5px] text-linen/90">Where do guests review you?</legend>
                  <p className="mt-1 text-[12.5px] text-smoke-2">In this prototype these connections are simulated.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => {
                      const on = a.platforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            set("platforms", on ? a.platforms.filter((x) => x !== p.id) : [...a.platforms, p.id])
                          }
                          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13.5px] ${
                            on ? "border-line-strong bg-night-3 text-linen" : "border-line text-smoke hover:text-linen"
                          }`}
                        >
                          <PlatformLogo platform={p.id} size={15} /> {p.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <section className="rounded-[var(--radius-window)] border border-line p-4">
                  <h2 className="text-[14.5px] font-medium">Paste a recent review</h2>
                  <p className="mt-1 text-[13px] text-smoke">
                    Optional. It will be waiting in your inbox with a draft written in your new voice.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                    <Field label="Guest name">
                      <input className={inputCls} value={first.author} onChange={(e) => setFirst({ ...first, author: e.target.value })} placeholder="e.g. Maya R." />
                    </Field>
                    <fieldset>
                      <legend className="text-[13.5px] text-linen/90">Rating</legend>
                      <div className="mt-1.5 flex" role="radiogroup" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            role="radio"
                            aria-checked={first.stars === n}
                            aria-label={`${n} star${n === 1 ? "" : "s"}`}
                            onClick={() => setFirst({ ...first, stars: n })}
                            className={`grid size-9 place-items-center rounded-lg text-[18px] ${n <= first.stars ? "text-lamp" : "text-linen/20"} hover:bg-night-3`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={first.platform === p.id}
                        onClick={() => setFirst({ ...first, platform: p.id })}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12.5px] ${
                          first.platform === p.id ? "border-line-strong bg-night-3 text-linen" : "border-line text-smoke"
                        }`}
                      >
                        <PlatformLogo platform={p.id} size={14} /> {p.id}
                      </button>
                    ))}
                  </div>
                  <label htmlFor="first-review" className="sr-only">
                    Review text
                  </label>
                  <textarea
                    id="first-review"
                    value={first.text}
                    onChange={(e) => setFirst({ ...first, text: e.target.value })}
                    rows={4}
                    placeholder="Paste the review text"
                    className={`${inputCls} mt-3 resize-y leading-relaxed`}
                  />
                </section>
              </>
            )}
          </div>

          <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-3 border-t border-line bg-night/95 py-4 backdrop-blur">
            <button
              type="button"
              onClick={() => (step === 0 ? setStarted(false) : setStep(step - 1))}
              className="rounded-lg px-4 py-2 text-[14px] text-smoke hover:text-linen"
            >
              Back
            </button>
            {last ? (
              <button
                type="button"
                onClick={finish}
                className="rounded-lg bg-linen px-5 py-2.5 text-[14.5px] font-medium text-night hover:bg-white"
              >
                Save my profile and open the inbox
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-linen px-5 py-2.5 text-[14.5px] font-medium text-night hover:bg-white"
              >
                Continue
              </button>
            )}
          </div>
        </div>

        {/* Live profile preview */}
        <div className="sticky top-6 hidden h-[calc(100dvh-48px)] lg:block">
          <ProfilePreview markdown={preview} focus={s.focus} done={last} />
        </div>
      </div>
    </div>
  );
}
