export type SampleReview = {
  id: string;
  tone: "sage" | "butter" | "rose";
  meta: string;
  title: string;
  text: string;
};

export const SAMPLE_REVIEWS: SampleReview[] = [
  {
    id: "birthday",
    tone: "sage",
    meta: "★★★★★ · Google",
    title: "Mom's 60th birthday",
    text: "Google, 5 stars, from Sarah M.: Came for my mom's 60th birthday. The duck confit was perfect and our server Léa remembered it was a celebration and brought a candle in the crème brûlée. Cosy room, great wine list. We'll definitely be back!",
  },
  {
    id: "slow",
    tone: "butter",
    meta: "★★ · Yelp",
    title: "Fifty minutes for mains",
    text: "Yelp, 2 stars, Mark T.: Saturday night, we waited almost 50 minutes for our mains and the frites came out lukewarm. Our server kept apologising, which was nice, but nobody from management came over. For $40 steak frites I expected better. The onion soup was excellent though.",
  },
  {
    id: "malade",
    tone: "rose",
    meta: "2/5 · TripAdvisor · FR",
    title: "Malade après la bouillabaisse",
    text: "TripAdvisor, 2/5 — Dîner vendredi soir. Le cadre est charmant et le serveur très gentil, mais 45 minutes d'attente pour les plats. Pire : mon mari a été malade toute la nuit après la bouillabaisse. Je ne sais pas si c'est lié mais c'est inquiétant. — Hélène",
  },
];

export const REVISIONS = [
  { label: "Shorter", prompt: "Make the reply shorter." },
  { label: "Warmer", prompt: "Make the reply a little warmer and more personal." },
  { label: "More formal", prompt: "Make the reply more formal." },
  { label: "In French", prompt: "Rewrite the reply in French." },
];
