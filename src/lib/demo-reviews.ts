// Demo data for the Front of House prototype. Petit Comptoir and every guest
// below are fictional. Platform connections are simulated; the AI drafting is real.

export type Platform = "Google" | "TripAdvisor" | "Yelp" | "OpenTable";

export const PLATFORMS: {
  id: Platform;
  name: string;
  detail: string;
  initiallyConnected: boolean;
}[] = [
  {
    id: "Google",
    name: "Google Business Profile",
    detail: "Reviews from Google Search and Maps",
    initiallyConnected: true,
  },
  {
    id: "TripAdvisor",
    name: "TripAdvisor",
    detail: "Reviews and ratings from travellers",
    initiallyConnected: true,
  },
  {
    id: "Yelp",
    name: "Yelp",
    detail: "Reviews from Yelp for Business",
    initiallyConnected: false,
  },
  {
    id: "OpenTable",
    name: "OpenTable",
    detail: "Verified diner reviews after a booking",
    initiallyConnected: false,
  },
];

export type DemoReview = {
  id: string;
  platform: Platform;
  author: string;
  stars: number;
  hoursAgo: number;
  text: string;
  /** Older reviews that were already answered before Front of House. */
  pastReply?: string;
};

export const DEMO_REVIEWS: DemoReview[] = [
  {
    id: "g-sarah",
    platform: "Google",
    author: "Sarah M.",
    stars: 5,
    hoursAgo: 2,
    text: "Came for my mom's 60th birthday. The duck confit was perfect and our server Léa remembered it was a celebration and brought a candle in the crème brûlée. Cosy room, great wine list. We'll definitely be back!",
  },
  {
    id: "t-helene",
    platform: "TripAdvisor",
    author: "Hélène D.",
    stars: 2,
    hoursAgo: 5,
    text: "Dîner vendredi soir. Le cadre est charmant et le serveur très gentil, mais 45 minutes d'attente pour les plats. Pire : mon mari a été malade toute la nuit après la bouillabaisse. Je ne sais pas si c'est lié mais c'est inquiétant.",
  },
  {
    id: "g-priya",
    platform: "Google",
    author: "Priya K.",
    stars: 4,
    hoursAgo: 9,
    text: "Sat at the zinc bar on a Thursday and had the prix fixe — honestly great value for $49. The tarte tatin is the best I've had outside Paris. Only gripe: it gets very loud after 8pm, hard to hear each other.",
  },
  {
    id: "g-dana",
    platform: "Google",
    author: "Dana W.",
    stars: 1,
    hoursAgo: 14,
    text: "The host at the door was openly rude to my wife and me and seated a group that arrived after us first. It felt like we were being treated differently because of who we are. We left before ordering.",
  },
  {
    id: "t-james",
    platform: "TripAdvisor",
    author: "James from Leeds",
    stars: 5,
    hoursAgo: 20,
    text: "Visiting Boston for a conference and a colleague recommended this place. The French onion soup alone was worth the trip — rich, proper gruyère crust. Service was relaxed but attentive. A real neighbourhood gem.",
  },
  {
    id: "g-tom",
    platform: "Google",
    author: "Tom R.",
    stars: 3,
    hoursAgo: 28,
    text: "Used to be our favourite. The duck confit was a bit dry this time and the frites were average. Staff were lovely as always. Hoping it was an off night.",
  },
  {
    id: "g-ana",
    platform: "Google",
    author: "Ana L.",
    stars: 5,
    hoursAgo: 33,
    text: "¡Increíble! Fuimos al brunch del domingo y todo estaba delicioso. El camarero nos recomendó la tarta tatin y fue lo mejor de la mañana. Volveremos seguro.",
  },
  {
    id: "t-mike",
    platform: "TripAdvisor",
    author: "Mike P.",
    stars: 2,
    hoursAgo: 46,
    text: "I told our server my daughter has a nut allergy and asked twice about the dessert. The crème brûlée came with a tuile that had almonds in it. We caught it in time but I'm shocked. Food was otherwise good.",
  },
  {
    id: "y-mark",
    platform: "Yelp",
    author: "Mark T.",
    stars: 2,
    hoursAgo: 7,
    text: "Saturday night, we waited almost 50 minutes for our mains and the frites came out lukewarm. Our server kept apologising, which was nice, but nobody from management came over. For $40 steak frites I expected better. The onion soup was excellent though.",
  },
  {
    id: "y-kevin",
    platform: "Yelp",
    author: "Kevin S.",
    stars: 1,
    hoursAgo: 16,
    text: "Went for lunch on Monday with my team. The pizza was cold and soggy and we couldn't even find a space in their parking lot. Never again.",
  },
  {
    id: "y-rosa",
    platform: "Yelp",
    author: "Rosa B.",
    stars: 4,
    hoursAgo: 39,
    text: "Lovely Saturday brunch. Great coffee, the croque madame was spot on. Took a while to get a table even with a booking, but the staff were apologetic and kind.",
  },
  {
    id: "o-chen",
    platform: "OpenTable",
    author: "Chen W.",
    stars: 5,
    hoursAgo: 11,
    text: "Anniversary dinner. Our server suggested a Côtes du Rhône that was perfect with the steak frites, and the room is just the right amount of romantic. Thank you for a lovely evening.",
  },
  {
    id: "o-laura",
    platform: "OpenTable",
    author: "Laura G.",
    stars: 3,
    hoursAgo: 52,
    text: "Good food but I'm coeliac and the options were limited. The server was honest that the kitchen isn't certified gluten-free, which I appreciated, but I'd love one more main I can safely order.",
  },
  {
    id: "g-paul",
    platform: "Google",
    author: "Paul A.",
    stars: 5,
    hoursAgo: 120,
    text: "Best bistro in the South End. Steak frites, a glass of Bordeaux, done.",
    pastReply:
      "Paul, that sounds like the perfect order. Thank you for coming in, and for the kind words about the steak frites. See you at the bar soon.\n\n— Camille, General Manager",
  },
  {
    id: "t-ines",
    platform: "TripAdvisor",
    author: "Inès V.",
    stars: 4,
    hoursAgo: 150,
    text: "Très bonne adresse. Le confit de canard était parfait, un peu bruyant le samedi.",
    pastReply:
      "Merci Inès ! Je suis ravie que le confit de canard vous ait plu. Le samedi soir est animé, c'est vrai : en semaine, la salle est plus calme si vous préférez.\n\n— Camille, General Manager",
  },
];

export function timeAgo(hours: number) {
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** The message sent to the agent for a review, in the same shape a manager would paste. */
export function reviewPrompt(r: DemoReview) {
  return `${r.platform}, ${r.stars} stars, from ${r.author}: ${r.text}`;
}
