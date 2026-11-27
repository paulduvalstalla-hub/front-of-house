// Creates the tables for real accounts. Safe to run more than once.
// Usage: node --env-file=.env.local scripts/db-setup.mjs
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    name text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

// One row per account: the restaurant profile, connections and review desk, as the app saves it.
await sql`
  CREATE TABLE IF NOT EXISTS workspaces (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('users', 'workspaces')
  ORDER BY table_name`;
console.log("Tables ready:", tables.map((t) => t.table_name).join(", "));
