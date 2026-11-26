// A workspace is the restaurant the dashboard is working for: either the
// built-in sample (Petit Comptoir) or one set up through onboarding.

import type { Platform } from "./demo-reviews";

export type Workspace = {
  mode: "sample" | "custom";
  restaurant: string;
  location: string;
  /** First name of the person who signs replies. */
  manager: string;
  role: string;
  /** First name of the person who sees escalated reviews. */
  owner: string;
};

export const SAMPLE_WORKSPACE: Workspace = {
  mode: "sample",
  restaurant: "Petit Comptoir",
  location: "South End, Boston",
  manager: "Camille",
  role: "General manager",
  owner: "Julien",
};

export type Tone = "warm" | "polished" | "brief";

export type Answers = {
  // The restaurant
  restaurant: string;
  location: string;
  kind: string;
  seats: string;
  manager: string;
  role: string;
  owner: string;
  email: string;
  // Facts (one item per line where it is a list)
  hours: string;
  closed: string;
  dishes: string;
  prices: string;
  dietary: string;
  reservations: string;
  otherFacts: string;
  notServed: string;
  // Voice
  tone: Tone;
  signoff: string;
  avoid: string;
  staffFirstNames: boolean;
  // Rules
  escalate: {
    illness: boolean;
    allergy: boolean;
    injury: boolean;
    discrimination: boolean;
    legal: boolean;
    fake: boolean;
  };
  tellOwner: {
    lowStars: boolean;
    namedStaff: boolean;
    repeat: boolean;
    manipulation: boolean;
  };
  // Where guests review you
  platforms: Platform[];
};

export const EMPTY_ANSWERS: Answers = {
  restaurant: "",
  location: "",
  kind: "",
  seats: "",
  manager: "",
  role: "General manager",
  owner: "",
  email: "",
  hours: "",
  closed: "",
  dishes: "",
  prices: "",
  dietary: "",
  reservations: "",
  otherFacts: "",
  notServed: "",
  tone: "warm",
  signoff: "",
  avoid: "",
  staffFirstNames: true,
  escalate: { illness: true, allergy: true, injury: true, discrimination: true, legal: true, fake: true },
  tellOwner: { lowStars: true, namedStaff: true, repeat: true, manipulation: true },
  platforms: ["Google", "TripAdvisor"],
};

/** Keeps names safe to place inside the system prompt: one line, short. */
export function cleanName(s: string, max = 60) {
  return s.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function workspaceFrom(a: Answers): Workspace {
  return {
    mode: "custom",
    restaurant: cleanName(a.restaurant) || "Your restaurant",
    location: cleanName(a.location, 80),
    manager: cleanName(a.manager.split(" ")[0] ?? "", 40) || "the manager",
    role: cleanName(a.role, 40) || "General manager",
    owner: cleanName(a.owner.split(" ")[0] ?? "", 40) || "the owner",
  };
}
