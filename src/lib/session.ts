// Sessions are a signed cookie (HMAC-SHA256 with AUTH_SECRET), checked on the server.
// Two kinds: a real account stored in Postgres, or a demo visit of the sample restaurant.
// Web Crypto only, so this runs in the proxy as well as in server code.

export const SESSION_COOKIE = "foh_session";
/** The cookie the old demo-only sign-in set; cleared on sign-in and sign-out. */
export const LEGACY_COOKIE = "foh_demo_session";
export const SESSION_DAYS = 30;

/** Who is signed in, without the expiry. Safe to pass to client components. */
export type Account =
  | { kind: "demo"; id: string }
  | { kind: "user"; uid: string; name: string; email: string };

export type Session =
  | { kind: "demo"; id: string; exp: number }
  | { kind: "user"; uid: string; name: string; email: string; exp: number };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

let keyPromise: Promise<CryptoKey> | null = null;
function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET is missing or too short.");
  keyPromise ??= crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
  return keyPromise;
}

export async function signSession(session: Session) {
  const body = b64url(enc.encode(JSON.stringify(session)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    if (typeof s.exp !== "number" || s.exp < Date.now()) return null;
    if (s.kind === "demo" && typeof s.id === "string") return s;
    if (s.kind === "user" && typeof s.uid === "string" && typeof s.email === "string") return s;
    return null;
  } catch {
    return null;
  }
}
