/**
 * Session management utilities.
 * In production, replace with a secure session store (e.g., iron-session, next-auth).
 * This uses cookies to store session data on the server side.
 */

import { cookies } from "next/headers";

export interface SessionData {
  token: string;
  tenantId: string;
}

const SESSION_COOKIE = "saas_session";

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) {
    return null;
  }

  try {
    return JSON.parse(session.value) as SessionData;
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
