import "server-only";
import { cookies } from "next/headers";
import {
  LEGACY_COOKIE,
  SESSION_COOKIE,
  SESSION_DAYS,
  signSession,
  verifySession,
  type Account,
  type Session,
} from "./session";

export type { Account };

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function startSession(s: Account) {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession({ ...s, exp } as Session), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86_400,
  });
  store.delete(LEGACY_COOKIE);
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(LEGACY_COOKIE);
}

export function accountFrom(s: Session): Account {
  return s.kind === "demo" ? { kind: "demo", id: s.id } : { kind: "user", uid: s.uid, name: s.name, email: s.email };
}
