// Sends reviews to the live agent N times each and records risk + sentiment,
// then applies Autopilot's old rule (Ready + 4–5★) and new rule (+ sentiment positive).
// Usage (from the agent folder): node scripts/autopilot-gate-test.mjs <baseUrl> . <runs> <out.jsonl>
// Results of the 27 Nov 2026 run: test-runs/v4-autopilot-sentiment-gate.txt
import { createJiti } from "jiti";
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [base, dirArg = ".", runsArg = "5", out] = process.argv.slice(2);
const dir = resolve(dirArg);
const RUNS = Number(runsArg);
const jiti = createJiti(import.meta.url);
const { DEMO_REVIEWS } = await jiti.import(`${dir}/src/lib/demo-reviews.ts`);
const { LIVE_REVIEWS } = await jiti.import(`${dir}/src/lib/live-reviews.ts`);
const prompt = (r) => `${r.platform}, ${r.stars} stars, from ${r.author}: ${r.text}`;

const cases = [];
for (const f of ["autopilot-risk-scenarios.json", "autopilot-risk-hard-scenarios.json"])
  for (const s of JSON.parse(readFileSync(`${dir}/scripts/${f}`, "utf8")))
    cases.push({ group: s.expect === "ready" ? "control" : "hidden-risk", id: s.id, stars: Number(s.turns[0].match(/(\d) stars/)[1]), text: s.turns[0] });
for (const r of [...DEMO_REVIEWS, ...LIVE_REVIEWS])
  if (r.stars >= 4 && !r.pastReply) cases.push({ group: "sample-4-5star", id: r.id, stars: r.stars, text: prompt(r) });

async function ask(text) {
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: [{ id: "u1", role: "user", parts: [{ type: "text", text }] }] }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  let input;
  for (const line of (await res.text()).split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const ev = JSON.parse(line.slice(6));
    if (ev.type === "tool-input-available" && ev.toolName === "fileReply") input = ev.input;
    if (ev.type === "error") throw new Error(ev.errorText);
  }
  return input;
}

const jobs = cases.flatMap((c) => Array.from({ length: c.group === "sample-4-5star" ? Math.min(RUNS, 3) : RUNS }, (_, i) => ({ ...c, run: i + 1 })));
writeFileSync(out, "");
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const j = jobs[next++];
    let d, err;
    for (let a = 0; a < 3 && !d; a++) {
      try { d = await ask(j.text); } catch (e) { err = String(e); await new Promise((r) => setTimeout(r, 1500)); }
    }
    const row = {
      group: j.group, id: j.id, run: j.run, stars: j.stars,
      risk: d?.risk ?? null, sentiment: d?.sentiment ?? null, riskReason: d?.riskReason ?? null,
      oldRulePosts: !!d && d.risk === "ready" && j.stars >= 4,
      newRulePosts: !!d && d.risk === "ready" && d.sentiment === "positive" && j.stars >= 4,
      reply: d?.reply ?? null, error: d ? undefined : err ?? "no fileReply call",
    };
    appendFileSync(out, JSON.stringify(row) + "\n");
    process.stdout.write(`${j.group} ${j.id} #${j.run}: risk=${row.risk} sentiment=${row.sentiment} old=${row.oldRulePosts} new=${row.newRulePosts}\n`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
