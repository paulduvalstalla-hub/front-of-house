# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the general manager of an independent restaurant** (confirmed). In the demo this is Camille, GM of Petit Comptoir. After service, often late at night, the manager works through the day's new reviews and wants every guest answered within a day, in the restaurant's own voice, without losing an hour to it.

**Secondary: the owner.** The owner (Julien in the demo) does not answer routine reviews. They only see the reviews that are held for them (illness, allergic reactions, discrimination, legal threats, the health inspector, likely fakes) and decide what happens next. Compensation and anything sensitive is their call, made privately.

Job to be done: *When a new review lands on Google, Yelp or Tripadvisor, I want a reply drafted in my restaurant's voice that follows our policy, so I can answer every guest within a day without losing an hour to it, and never post something risky by accident.*

## Product Purpose

Front of House is a review reply desk for independent restaurants. It reads every guest review from Google, Tripadvisor, Yelp and OpenTable, drafts a reply in the restaurant's voice, and sorts each one into **Ready to post**, **Post, then tell the owner**, or **Hold for the owner**. Success means every guest gets a specific, human-sounding reply within a day, and nothing risky goes public without the owner seeing it first.

It is also a graded prototype for a Hult International Business School assignment on AI agents. The site must convince **both** audiences at once (confirmed): it should look and read like a real startup a restaurant manager would trust, while staying honest that it is a prototype.

## Positioning

Built for independent restaurants (one to three locations), not chains. Review tools such as Marqii and Birdeye also draft AI replies; Front of House's difference is the safety triage and the grounding:

- every review is filed into one of three risk levels, and the risky ones are held for the owner with only a neutral holding reply;
- drafts may only use facts from the restaurant's own knowledge file and the review itself;
- it refuses to write fake reviews, rewrite a guest's words, or promise refunds or compensation in public, even when a stressed manager asks.

## Operating Context

- Reviews arrive on Google Business Profile, Tripadvisor, Yelp and OpenTable and land in one inbox, newest first.
- **Triage** drafts every new review at once. The manager reads each draft, edits or asks for a revision (shorter, warmer, more formal, in French, or anything typed), then approves it or sends it to the owner.
- **Autopilot** (a setting): when on, a first draft the agent marked Ready for a 4- or 5-star review posts on its own after a 12-second countdown, unless a person stops it. Flagged and held reviews never auto-post. Posting itself is simulated in the prototype.
- **Quick reply** handles a review pasted from anywhere, such as an email or a platform that isn't connected.
- Replies are written in the guest's language; the demo includes French reviews.
- A private note "for the manager only" can accompany a draft (for example, pass a compliment on to a server).
- Onboarding builds each restaurant's knowledge file in five steps; pasting a menu or website fills in only the facts written in it.

## Capabilities and Constraints

- **Live:** the agent (Claude Haiku 5.5 via the Anthropic API, key on the server only): reading, risk triage, drafting, revisions and refusals; onboarding fact extraction; landing page, pricing, dashboard, analytics.
- **Simulated:** the Google, Tripadvisor, Yelp and OpenTable connections run on sample reviews (Google's review API needs business approval; Tripadvisor and Yelp have no public API for posting replies). Sign-in is a demo account stored in a cookie, with no real user accounts.
- **Not enabled:** payments. The pricing page shows placeholder plans with a 14-day trial; nothing is charged.
- Demo data lives in the browser (localStorage); Billing → *Reset demo data* starts over, and "Explore the sample restaurant" restores the demo inbox.
- Built with Next.js 16 and deployed to Vercel production by the command line (the Vercel project is not linked to GitHub, so a push alone does not deploy).
- **Binding (confirmed):** the 3-minute video path must keep working: landing page → *Try the live demo* → *Triage* → the boundary test. Any change to the landing page, sign-in, inbox, Triage or Quick reply must leave that path intact.

## Brand Commitments

- Name: **Front of House**. Logo: the service-bell mark (`src/components/brand.tsx`, `src/app/icon.svg`).
- Sample restaurant: **Petit Comptoir**, a fictional French bistro in Boston's South End, with Camille (GM) and Julien (owner).
- Product terms in use: *knowledge file*, *Triage*, *Ready to post*, *Tell the owner*, *Hold for the owner*, *Quick reply*, *Brand voice*.
- Review platforms are shown with their real logos and named as trademarks of their owners; Front of House is not affiliated with them.

## Evidence on Hand

- Real agent transcripts: `test-runs/` (v1 and v2 happy-path runs, v2 boundary probes, live runs) and the scenarios in `scripts/scenarios.json`. The refusal quotes on the landing page come from these runs.
- Assignment briefing document (business context, exact system prompt, configuration, the v1 → v2 pivot, three tests) and video script in `../briefing/`, with screenshots in `../briefing/screenshots*`.
- **Absent, and must not be fabricated:** real customers, testimonials, client logos, usage statistics, press, or revenue. Petit Comptoir, its staff and its reviews are fictional.

## Product Principles

1. **Nothing risky posts without a person saying yes.** The product drafts; a person approves. The one exception is Autopilot (confirmed: kept, but limited): a Ready reply to a 4- or 5-star review may post on its own after a countdown a person can stop. Anything flagged or held always waits for a person.
2. **Risky reviews reach the owner first.** When in doubt, hold it.
3. **Only real facts.** Drafts use the knowledge file and the review, never invented details.
4. **Sound like the restaurant's best manager, not a company.** The guest's name, the dish they mentioned, the house sign-off, no corporate filler.
5. **Honest about what's real.** Say clearly which parts are live and which are simulated.
