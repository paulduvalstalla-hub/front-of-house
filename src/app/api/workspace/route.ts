import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// The signed-in account's restaurant: profile, connections and review desk.
// The demo keeps its state in the browser instead, so this is for real accounts only.

const MAX_BYTES = 1_000_000;

async function account() {
  const s = await getSession();
  return s?.kind === "user" ? s : null;
}

export async function GET() {
  const s = await account();
  if (!s) return Response.json({ error: "Sign in to load your restaurant." }, { status: 401 });
  const rows = await sql`
    SELECT w.state, u.created_at
    FROM users u LEFT JOIN workspaces w ON w.user_id = u.id
    WHERE u.id = ${s.uid}`;
  if (rows.length === 0) return Response.json({ error: "This account no longer exists." }, { status: 401 });
  return Response.json({ state: rows[0].state ?? null, createdAt: new Date(String(rows[0].created_at)).getTime() });
}

export async function PUT(req: Request) {
  const s = await account();
  if (!s) return Response.json({ error: "Sign in to save your restaurant." }, { status: 401 });
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return Response.json({ error: "Too much data to save." }, { status: 413 });
  let state: unknown;
  try {
    state = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Not valid JSON." }, { status: 400 });
  }
  if (!state || typeof state !== "object" || (state as { v?: unknown }).v !== 2) {
    return Response.json({ error: "Unexpected data." }, { status: 400 });
  }
  await sql`
    INSERT INTO workspaces (user_id, state, updated_at) VALUES (${s.uid}, ${raw}::jsonb, now())
    ON CONFLICT (user_id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()`;
  return Response.json({ ok: true });
}
