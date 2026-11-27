# Front of House

The review reply desk for independent restaurants. Front of House reads every guest review from Google, TripAdvisor, Yelp and OpenTable, drafts a reply in the restaurant's own voice, and holds the risky ones (illness, allergies, discrimination, likely fakes) until the owner has seen them.

Built as a prototype for a Hult International Business School assignment on AI agents. **Petit Comptoir**, the restaurant in the demo, is fictional.

**Live:** https://front-of-house-one.vercel.app

## The job it does

> When a new review lands on Google, Yelp or TripAdvisor, I want a reply drafted in my restaurant's voice that follows our policy, so I can answer every guest within a day without losing an hour to it, and never post something risky by accident.

## What is real and what is simulated

| Part | Status |
| --- | --- |
| The AI agent: reading reviews, risk triage, drafting, revisions, refusals | **Live** (Claude Haiku 5.5) |
| Landing page, pricing, dashboard, analytics | Live |
| Accounts: sign up, sign in, sign out | **Live** (Neon Postgres, scrypt-hashed passwords, signed session cookie). No password reset or email verification yet. |
| Live demo | **Live**, no account needed: a three-screen intro, then the sample restaurant's inbox |
| Onboarding and fact extraction from a pasted menu | **Live** |
| Google, TripAdvisor, Yelp and OpenTable connections | **Simulated** with sample reviews. Google's review API needs a business approval; TripAdvisor and Yelp have no public API for posting replies. |
| Payments | Not enabled (pricing page and trial only) |

## The product

- **Live demo (`/demo`):** three short screens (the sample restaurant, the three labels, Autopilot), then Petit Comptoir's inbox with real drafting. Each visit starts a fresh copy.
- **Accounts (`/sign-up`, `/sign-in`):** a real account with email and password. A new account goes through onboarding, and its restaurant, reviews and replies are saved to the database, so they come back on any device.
- **Onboarding:** five steps that build a restaurant's knowledge file live as you answer. Paste a menu or website and Claude Haiku fills in only the facts written in it; the safety rules and section structure are fixed. Running it again from Billing starts from your saved answers.
- **Inbox, on Autopilot:** every review from connected platforms in one list. The sample restaurant gets a live feed (a new Google or TripAdvisor review every 20–35 seconds, simulated). The agent drafts each review the moment it lands and sorts it into *Ready to post*, *Post, then tell the owner* and *Hold for the owner*. Ready replies to 4- and 5-star reviews post on their own after a 12-second countdown that anyone can stop; everything else waits for a person, and held reviews never post on their own. Switch the agent off and the **Triage** button drafts everything at once instead.
- **Posted replies** are shown the way guests see them on Google or TripAdvisor (a preview: the connection is simulated).
- **Draft panel:** edit the reply, ask for changes (shorter, warmer, in French, or anything typed), then approve, or send it to the owner when it is held.
- **Quick reply:** paste a review from anywhere, such as an email or a platform that isn't connected.
- **Brand voice:** the restaurant's knowledge file, editable section by section. The agent may only use these facts and the review itself.
- **Integrations, Analytics, Billing.**

The demo keeps its data in the browser (localStorage); Billing → *Restart the demo* starts over. An account's data lives in Postgres (`users` and `workspaces` tables, see [`scripts/db-setup.mjs`](scripts/db-setup.mjs)); Billing → *Start over* clears the restaurant but keeps the account.

## How the agent works

| Piece | Where |
| --- | --- |
| System prompt | [`src/lib/system-prompt.ts`](src/lib/system-prompt.ts) |
| Knowledge file (facts, voice, reply policy, escalation rules) | [`src/lib/restaurant-profile.ts`](src/lib/restaurant-profile.ts) |
| Structured output tool (`fileReply`) | [`src/lib/reply-tool.ts`](src/lib/reply-tool.ts) |
| Server route that calls the model | [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) |
| Dashboard | [`src/components/app/`](src/components/app/) |
| Landing page, sign-in and sign-up | [`src/components/marketing/`](src/components/marketing/) |
| Demo intro | [`src/components/demo/demo-tour.tsx`](src/components/demo/demo-tour.tsx) |
| Accounts: actions, sessions, passwords, database | [`src/app/actions.ts`](src/app/actions.ts), [`src/lib/session.ts`](src/lib/session.ts), [`src/lib/password.ts`](src/lib/password.ts), [`src/app/api/workspace/route.ts`](src/app/api/workspace/route.ts) |
| Test conversations and transcripts | [`scripts/`](scripts/), [`test-runs/`](test-runs/) |

The API key is read from `ANTHROPIC_API_KEY` on the server only; it never reaches the browser and is not in this repository.

## Run it locally

```bash
npm install
vercel env pull .env.local   # ANTHROPIC_API_KEY, DATABASE_URL, AUTH_SECRET
node --env-file=.env.local scripts/db-setup.mjs   # once, creates the tables
npm run dev
```

Without Vercel access, put your own `ANTHROPIC_API_KEY`, a Postgres `DATABASE_URL` and a random `AUTH_SECRET` (32+ characters) in `.env.local`. Open http://localhost:3000 and choose **Try the live demo**, or create an account.

To replay the test conversations against a running copy:

```bash
node scripts/ask.mjs http://localhost:3000 scripts/scenarios.json
```
