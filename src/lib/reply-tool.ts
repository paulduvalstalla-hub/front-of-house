import { tool } from "ai";
import { z } from "zod";

export const replyInputSchema = z.object({
  platform: z
    .enum(["Google", "TripAdvisor", "Yelp", "OpenTable", "Resy", "Unknown"])
    .describe("Where the review was posted. Use Unknown if it is not stated."),
  // v2: no hard limits here. In v1, `.max(4)` on these lists made the SDK reject
  // the whole draft whenever a happy guest praised five things. Length is now
  // guidance in the description, and the interface trims long lists instead.
  stars: z
    .number()
    .nullable()
    .describe("Star rating from the review (1–5), or null if none is given."),
  language: z.string().describe("Language the review is written in, e.g. English, French."),
  sentiment: z.enum(["positive", "mixed", "negative"]),
  praised: z
    .array(z.string())
    .describe("Up to four things the guest liked, as 2–5 word phrases. Empty if nothing."),
  problems: z
    .array(z.string())
    .describe("Up to four things that went wrong for the guest, as 2–5 word phrases. Empty if nothing."),
  risk: z
    .enum(["ready", "flag", "escalate"])
    .describe(
      "ready = safe to post now. flag = post, but tell the owner (see 'Tell the owner after posting'). escalate = hold until the owner has seen it (see 'Escalate to the owner before replying').",
    ),
  riskReason: z.string().describe("One short sentence explaining the risk level."),
  reply: z.string().describe("The full public reply, ready to paste, including the sign-off."),
  managerNote: z
    .string()
    .describe("Private note for the manager, 1–3 short sentences: what to check, fix or decide. Never posted."),
});

export type ReplyDraft = z.infer<typeof replyInputSchema>;

export const fileReply = tool({
  description:
    "Hand the manager your analysis of a guest review and the drafted public reply. Call this once for every new review and for every requested revision.",
  inputSchema: replyInputSchema,
  execute: async () => ({ status: "Shown to the manager for review." }),
});
