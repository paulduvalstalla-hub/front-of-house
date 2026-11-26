import { createAnthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { RESTAURANT_PROFILE } from "@/lib/restaurant-profile";
import { AGENT_PROMPT, buildPrompt } from "@/lib/system-prompt";
import { cleanName } from "@/lib/workspace";
import { fileReply } from "@/lib/reply-tool";

export const maxDuration = 60;

// The API key is read from ANTHROPIC_API_KEY on the server only. It is never
// sent to the browser. The base URL is pinned so a stray ANTHROPIC_BASE_URL in
// the environment can't reroute requests.
const anthropic = createAnthropic({ baseURL: "https://api.anthropic.com/v1" });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5";

const MAX_MESSAGES = 24;
const MAX_CHARS = 6000;
const MAX_PROFILE_CHARS = 9000;

function textOf(message: UIMessage) {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The server has no ANTHROPIC_API_KEY configured." },
      { status: 500 },
    );
  }

  let messages: UIMessage[];
  let profile: unknown;
  let workspace: unknown;
  try {
    ({ messages, profile, workspace } = (await req.json()) as {
      messages: UIMessage[];
      profile?: unknown;
      workspace?: unknown;
    });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  // An onboarded restaurant sends who the agent works for; names are cleaned to one short line.
  const ws = workspace as Partial<Record<"manager" | "role" | "restaurant", unknown>> | undefined;
  const who =
    ws && typeof ws.manager === "string" && typeof ws.role === "string" && typeof ws.restaurant === "string"
      ? { manager: cleanName(ws.manager, 40), role: cleanName(ws.role, 40), restaurant: cleanName(ws.restaurant) }
      : undefined;
  // A restaurant may send its own edited knowledge file from the Brand voice page.
  const knowledge =
    typeof profile === "string" && profile.trim().length > 200 && profile.length <= MAX_PROFILE_CHARS
      ? profile
      : null;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages to answer." }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last.role === "user" && textOf(last).length > MAX_CHARS) {
    return Response.json(
      { error: `That review is too long. Keep it under ${MAX_CHARS} characters.` },
      { status: 413 },
    );
  }

  // Keep the recent history only, and make sure it starts with a user turn.
  let recent = messages.slice(-MAX_MESSAGES);
  while (recent.length > 0 && recent[0].role !== "user") recent = recent.slice(1);

  const result = streamText({
    model: anthropic(MODEL),
    instructions: knowledge || who ? buildPrompt(knowledge ?? RESTAURANT_PROFILE, who) : AGENT_PROMPT,
    messages: await convertToModelMessages(recent),
    tools: { fileReply },
    maxOutputTokens: 2000,
    providerOptions: {
      anthropic: { effort: "low", disableParallelToolUse: true },
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
