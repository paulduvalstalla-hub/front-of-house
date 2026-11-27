import "server-only";
import { neon } from "@neondatabase/serverless";

// Neon Postgres (free plan, connected to the Vercel project). Tables: scripts/db-setup.mjs.

let client: ReturnType<typeof neon> | null = null;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
  client ??= neon(process.env.DATABASE_URL);
  return client(strings, ...values) as Promise<Record<string, unknown>[]>;
}

export type UserRow = { id: string; email: string; name: string; password_hash: string; created_at: string };
