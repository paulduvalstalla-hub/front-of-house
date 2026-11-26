// The live feed for the sample restaurant: reviews that "arrive" on Google and
// TripAdvisor while the dashboard is open, so the demo shows the agent working
// on its own. Every guest is fictional and the feed is simulated; the drafting
// of each reply is a real call to the agent.
//
// Every review is written against Petit Comptoir's knowledge file (open Tuesday
// to Sunday for dinner, weekend brunch, the zinc bar, the $49 prix fixe…), so the
// agent's risk decisions are the real ones. The order is chosen for a demo:
// happy reviews first, then one to flag, then one that must be held.

import type { DemoReview, Platform } from "./demo-reviews";

export const LIVE_REVIEWS: DemoReview[] = [
  {
    id: "live-marcus",
    platform: "Google",
    author: "Marcus T.",
    stars: 5,
    hoursAgo: 0,
    meta: "Local Guide · 41 reviews",
    visit: "Dine in · Dinner · $50–100",
    text: "Steak frites cooked exactly how I asked and the béarnaise is dangerous. Walked in on a Wednesday and sat at the zinc bar, and the bartender talked me through the wine list like I was a regular. Easily my favourite spot in the South End now.",
  },
  {
    id: "live-emma",
    platform: "TripAdvisor",
    author: "Emma R",
    stars: 5,
    hoursAgo: 0,
    meta: "London, UK · 23 contributions",
    title: "Our best meal in Boston",
    visit: "November 2026 · Couples",
    text: "Booked on Resy for our last night in Boston. French onion soup, duck confit and the crème brûlée, all faultless. Our server Léa was charming and her wine suggestions were spot on. A lovely, cosy room on a cold evening.",
  },
  {
    id: "live-greg",
    platform: "Google",
    author: "Greg H.",
    stars: 2,
    hoursAgo: 0,
    meta: "8 reviews",
    visit: "Dine in · Dinner · $100+",
    text: "Waited over an hour for our mains on Saturday night and nobody told us why. The food was good when it finally came, but by then the evening was gone. For these prices I expected better.",
  },
  {
    id: "live-sofia",
    platform: "Google",
    author: "Sofia Romano",
    stars: 5,
    hoursAgo: 0,
    meta: "Local Guide · 128 reviews",
    visit: "Dine in · Dinner · $100+",
    text: "We got engaged that afternoon and came here to celebrate. The team congratulated us, the duck confit was perfect and the tarte tatin was the best thing I ate all year. It felt like Paris for one night.",
  },
  {
    id: "live-claire",
    platform: "TripAdvisor",
    author: "Claire B",
    stars: 4,
    hoursAgo: 0,
    meta: "Providence, RI · 9 contributions",
    title: "Great value prix fixe",
    visit: "November 2026 · Friends",
    text: "Three courses for $49 on a Tuesday is a steal for food this good. The onion soup and the steak frites were both excellent. Only downside was the noise later in the evening, we had to lean in to hear each other.",
  },
  {
    id: "live-ryan",
    platform: "Google",
    author: "Ryan K.",
    stars: 1,
    hoursAgo: 0,
    meta: "3 reviews",
    visit: "Dine in · Dinner · $50–100",
    text: "Found a small piece of hard plastic in my French onion soup. The waiter took the bowl away and said sorry, but I couldn't stop thinking about it for the rest of the meal. Not sure I'll be back.",
  },
  {
    id: "live-daniel",
    platform: "Google",
    author: "Daniel Okafor",
    stars: 5,
    hoursAgo: 0,
    meta: "Local Guide · 67 reviews",
    visit: "Dine in · Dinner · $50–100",
    text: "Best French onion soup in Boston, and it's not close.",
  },
  {
    id: "live-julie",
    platform: "Google",
    author: "Julie Moreau",
    stars: 5,
    hoursAgo: 0,
    meta: "12 reviews",
    visit: "Dine in · Dinner · $50–100",
    text: "Une vraie adresse de bistrot à Boston ! Le confit de canard est parfait, la crème brûlée aussi, et le service est chaleureux. On s'y sent comme à la maison.",
  },
  {
    id: "live-hannah",
    platform: "Google",
    author: "Hannah P.",
    stars: 3,
    hoursAgo: 0,
    meta: "Local Guide · 19 reviews",
    visit: "Dine in · Dinner · $50–100",
    text: "Food was lovely, but our table was right by the door and every time it opened we got a blast of cold air. Ask for a table further in if you go in winter.",
  },
  {
    id: "live-tom-rachel",
    platform: "TripAdvisor",
    author: "Tom and Rachel",
    stars: 5,
    hoursAgo: 0,
    meta: "Cambridge, MA · 31 contributions",
    title: "Our anniversary tradition",
    visit: "November 2026 · Couples",
    text: "Third year in a row for our anniversary and it never disappoints. Steak frites, a bottle of Côtes du Rhône, then tarte tatin to share. Thank you to the whole team for making it feel special again.",
  },
  {
    id: "live-alex",
    platform: "Google",
    author: "Alex Nguyen",
    stars: 4,
    hoursAgo: 0,
    meta: "Local Guide · 54 reviews",
    visit: "Brunch · $20–30",
    text: "Solid Sunday brunch, the croque madame and the coffee were both great. It got a bit hectic around noon with a line of walk-ins, but it was worth the wait.",
  },
  {
    id: "live-priscilla",
    platform: "TripAdvisor",
    author: "Priscilla W",
    stars: 5,
    hoursAgo: 0,
    meta: "London, UK · 6 contributions",
    title: "Dad is still talking about the bouillabaisse",
    visit: "November 2026 · Family",
    text: "Took my parents while they were visiting from London. We went on a Friday so my dad could have the bouillabaisse and he hasn't stopped talking about it since. Warm service and a lovely room.",
  },
];

/** Ratings and totals shown on the sample restaurant's public listings, before today's new reviews. */
export const LISTING_STATS: Partial<Record<Platform, { rating: number; total: number }>> = {
  Google: { rating: 4.6, total: 1287 },
  TripAdvisor: { rating: 4.5, total: 642 },
  Yelp: { rating: 4.0, total: 418 },
  OpenTable: { rating: 4.7, total: 2093 },
};
