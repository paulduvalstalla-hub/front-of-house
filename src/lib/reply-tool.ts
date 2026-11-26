import { tool } from "ai";
import { z } from "zod";

export const replyInputSchema = z.object({
  platform: z
    .enum(["Google", "TripAdvisor", "Yelp", "OpenTable", "Resy", "Unknown"])
    .describe("Where the review was posted. Use Unknown if it is not stated."),
  stars: z
    .number()
    .int()
    .min(1)
    .max(5)
    .nullable()
    .describe("Star rating from the review, or null if none is given."),
  language: z.string().describe("Language the review is written in, e.g. English, French."),
  sentiment: z.enum(["positive", "mixed", "negative"]),
  praised: z
    .array(z.string())
    .max(4)
    .describe("What the guest liked, as 2–5 word phrases. Empty if nothing."),
  problems: z
    .array(z.string())
    .max(4)
    .describe("What went wrong for the guest, as 2–5 word phrases. Empty if nothing."),
  risk: z
    .enum(["ready", "flag", "escalate"])
    .describe(
      "ready = safe to post now. flag = post, but the owner should know. escalate = hold until the owner has seen it (see escalation rules).",
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
