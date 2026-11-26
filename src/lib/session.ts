// Demo sign-in: there are no real accounts in this prototype. Signing in sets
// a cookie that lets the browser into /dashboard; nothing is stored on a server.

export const SESSION_COOKIE = "foh_demo_session";

export type DemoSession = { name: string; email: string };

export function encodeSession(s: DemoSession) {
  return encodeURIComponent(JSON.stringify(s));
}

export function decodeSession(raw: string | undefined | null): DemoSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<DemoSession>;
    if (typeof parsed.name !== "string" || typeof parsed.email !== "string") return null;
    return { name: parsed.name.slice(0, 60), email: parsed.email.slice(0, 120) };
  } catch {
    return null;
  }
}

/** Reads the session from document.cookie (client components only). */
export function readClientSession(): DemoSession | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return decodeSession(match?.slice(SESSION_COOKIE.length + 1));
}
