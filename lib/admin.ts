import "server-only";
import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "./firebase-admin";

/** Who may open /admin: a Google sign-in with one of these (verified) emails. */
export const ADMIN_EMAILS = ["gowthamjaganthan@gmail.com", "vinovibin333@gmail.com"];

/** Checks the request's Firebase ID token (Authorization: Bearer …) belongs to an admin. */
export async function requireAdmin(req: NextRequest): Promise<{ ok: true; email: string } | { ok: false; status: number }> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return { ok: false, status: 401 };
  try {
    const user = await getAuth(getAdminApp()).verifyIdToken(token);
    const email = user.email?.toLowerCase() ?? "";
    if (!user.email_verified || !ADMIN_EMAILS.includes(email)) return { ok: false, status: 403 };
    return { ok: true, email };
  } catch {
    return { ok: false, status: 401 };
  }
}
