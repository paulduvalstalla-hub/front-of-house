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
| Sign-in | Demo account (a cookie; no real user accounts) |
| Onboarding and fact extraction from a pasted menu | **Live** |
| Google, TripAdvisor, Yelp and OpenTable connections | **Simulated** with sample reviews. Google's review API needs a business approval; TripAdvisor and Yelp have no public API for posting replies. |
| Payments | Not enabled (pricing page and trial only) |

## The product

- **Onboarding:** five steps that build a restaurant's knowledge file live as you answer. Paste a menu or website and Claude Haiku fills in only the facts written in it; the safety rules and section structure are fixed. Or explore the sample restaurant, Petit Comptoir.
- **Inbox, on Autopilot:** every review from connected platforms in one list. The sample restaurant gets a live feed (a new Google or TripAdvisor review every 20–35 seconds, simulated). The agent drafts each review the moment it lands and sorts it into *Ready to post*, *Post, then tell the owner* and *Hold for the owner*. Ready replies to 4- and 5-star reviews post on their own after a 12-second countdown that anyone can stop; everything else waits for a person, and held reviews never post on their own. Switch the agent off and the **Triage** button drafts everything at once instead.
- **Posted replies** are shown the way guests see them on Google or TripAdvisor (a preview: the connection is simulated).
- **Draft panel:** edit the reply, ask for changes (shorter, warmer, in French, or anything typed), then approve, or send it to the owner when it is held.
- **Quick reply:** paste a review from anywhere, such as an email or a platform that isn't connected.
- **Brand voice:** the restaurant's knowledge file, editable section by section. The agent may only use these facts and the review itself.
- **Integrations, Analytics, Billing.**

Demo data lives in the browser (localStorage); Billing → *Reset demo data* starts over.

## How the agent works

| Piece | Where |
| --- | --- |
| System prompt | [`src/lib/system-prompt.ts`](src/lib/system-prompt.ts) |
| Knowledge file (facts, voice, reply policy, escalation rules) | [`src/lib/restaurant-profile.ts`](src/lib/restaurant-profile.ts) |
| Structured output tool (`fileReply`) | [`src/lib/reply-tool.ts`](src/lib/reply-tool.ts) |
| Server route that calls the model | [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) |
| Dashboard | [`src/components/app/`](src/components/app/) |
| Landing page and sign-in | [`src/components/marketing/`](src/components/marketing/) |
| Test conversations and transcripts | [`scripts/`](scripts/), [`test-runs/`](test-runs/) |

The API key is read from `ANTHROPIC_API_KEY` on the server only; it never reaches the browser and is not in this repository.

## Run it locally

```bash
npm install
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
npm run dev
```

Open http://localhost:3000 and choose **Try the live demo**.

To replay the test conversations against a running copy:

```bash
node scripts/ask.mjs http://localhost:3000 scripts/scenarios.json
```
