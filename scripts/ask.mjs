// Runs test conversations against the agent's real HTTP endpoint and prints
// exactly what came back. Usage:
//   node scripts/ask.mjs <baseUrl> <scenarios.json> [scenarioId ...]
// Each scenario is { id, turns: [string, ...] }; turns are sent in order as one
// conversation, so follow-up turns see the earlier drafts.
import { readFileSync } from "node:fs";

const [base = "http://localhost:3000", file = "scripts/scenarios.json", ...only] =
  process.argv.slice(2);
const scenarios = JSON.parse(readFileSync(file, "utf8")).filter(
  (s) => only.length === 0 || only.includes(s.id),
);

let n = 0;
const id = () => `m${++n}`;

async function send(messages) {
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const raw = await res.text();
  let text = "";
  const tools = [];
  for (const line of raw.split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const ev = JSON.parse(line.slice(6));
    if (ev.type === "text-delta") text += ev.delta;
    if (ev.type === "tool-input-available")
      tools.push({ toolCallId: ev.toolCallId, toolName: ev.toolName, input: ev.input });
    if (ev.type === "tool-input-error")
      tools.push({
        toolCallId: ev.toolCallId,
        toolName: ev.toolName,
        input: ev.input,
        invalid: ev.errorText ?? "input failed schema validation",
      });
    if (ev.type === "tool-output-available") {
      const t = tools.find((x) => x.toolCallId === ev.toolCallId);
      if (t) t.output = ev.output;
    }
    if (ev.type === "error") throw new Error(ev.errorText);
  }
  const parts = [];
  if (text) parts.push({ type: "text", text });
  for (const t of tools.filter((x) => !x.invalid))
    parts.push({
      type: `tool-${t.toolName}`,
      toolCallId: t.toolCallId,
      state: "output-available",
      input: t.input,
      output: t.output,
    });
  return { text, tools, message: { id: id(), role: "assistant", parts } };
}

for (const s of scenarios) {
  console.log(`\n=================== ${s.id} ===================`);
  const messages = [];
  for (const turn of s.turns) {
    messages.push({ id: id(), role: "user", parts: [{ type: "text", text: turn }] });
    console.log(`\n>>> USER:\n${turn}\n`);
    const t0 = Date.now();
    const { text, tools, message } = await send(messages);
    messages.push(message);
    console.log(`<<< AGENT (${((Date.now() - t0) / 1000).toFixed(1)}s):`);
    if (text) console.log(`[text] ${text}`);
    for (const t of tools) {
      const d = t.input;
      if (t.invalid) {
        console.log(`[${t.toolName}] REJECTED — the manager sees no draft.`);
        console.log(`  reason: ${String(t.invalid).split("\n").slice(0, 12).join("\n          ")}`);
        console.log(`  praised had ${d?.praised?.length} items, problems had ${d?.problems?.length} items`);
        continue;
      }
      console.log(`[${t.toolName}] risk=${d.risk} | ${d.platform} | stars=${d.stars} | ${d.language} | ${d.sentiment}`);
      console.log(`  riskReason: ${d.riskReason}`);
      console.log(`  praised: ${JSON.stringify(d.praised)} problems: ${JSON.stringify(d.problems)}`);
      console.log(`  reply (${d.reply.split(/\s+/).length} words):\n    ${d.reply.replace(/\n/g, "\n    ")}`);
      console.log(`  managerNote: ${d.managerNote}`);
    }
    if (!text && tools.length === 0) console.log("(empty response)");
  }
}
