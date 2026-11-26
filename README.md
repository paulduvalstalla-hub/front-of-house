# Front of House

An AI assistant that drafts replies to online guest reviews for the general manager of an independent restaurant, and flags the risky ones for the owner before anything is posted.

Built as a prototype for a Hult International Business School assignment on AI agents. **Petit Comptoir**, the restaurant used in the demo, is fictional.

## The job it does

> When a new review lands on Google, Yelp or TripAdvisor, I want a reply drafted in my restaurant's voice that follows our policy, so I can answer every guest within a day without losing an hour to it, and never post something risky by accident.

Paste a review and the agent returns:

- **A risk level:** ready to post, post and tell the owner, or hold until the owner has seen it (illness, legal threats, suspected fake reviews).
- **The read:** star rating, platform, language, what the guest praised and what went wrong.
- **A draft reply** in the restaurant's voice and the guest's language, ready to copy. Nothing is posted automatically.
- **A private note** for the manager about what to check or fix.

Follow-up requests revise the draft (shorter, warmer, more formal, another language).

## How it works

| Piece | Where |
| --- | --- |
| System prompt | [`src/lib/system-prompt.ts`](src/lib/system-prompt.ts) |
| Knowledge file (facts, brand voice, reply policy, escalation rules) | [`src/lib/restaurant-profile.ts`](src/lib/restaurant-profile.ts) |
| Structured output tool (`fileReply`) | [`src/lib/reply-tool.ts`](src/lib/reply-tool.ts) |
| Server route that calls the model | [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) |
| Interface | [`src/components/`](src/components/) |
| Test conversations | [`scripts/scenarios.json`](scripts/scenarios.json), run with [`scripts/ask.mjs`](scripts/ask.mjs) |

- **Model:** Anthropic Claude Haiku 5.5 (`claude-haiku-5-5`), called through the Vercel AI SDK.
- **Stack:** Next.js (App Router), Tailwind CSS, deployed on Vercel.
- **API key:** read from the `ANTHROPIC_API_KEY` environment variable on the server only. It is never sent to the browser or committed to this repository.

## Run it locally

```bash
npm install
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
npm run dev
```

Then open http://localhost:3000.

To replay the test conversations against a running copy:

```bash
node scripts/ask.mjs http://localhost:3000 scripts/scenarios.json
```
