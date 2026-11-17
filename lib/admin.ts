import "server-only";
import type { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { getAdminProjectId } from "./firebase-admin";

/** Who may open /admin: a Google sign-in with one of these (verified) emails. */
export const ADMIN_EMAILS = ["gowthamjaganthan@gmail.com", "vinovibin333@gmail.com"];

// Firebase ID tokens are signed with these Google keys. Checked here with
// jose rather than firebase-admin/auth: that module loads jwks-rsa, which
// require()s the ESM-only jose — fine on Node 22, a crash on load on the
// Node that Vercel runs (the route answered every request with a 500).
const KEYS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

/** Checks the request's Firebase ID token (Authorization: Bearer …) belongs to an admin. */
export async function requireAdmin(req: NextRequest): Promise<{ ok: true; email: string } | { ok: false; status: number }> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return { ok: false, status: 401 };
  const project = getAdminProjectId();
  try {
    const { payload } = await jwtVerify(token, KEYS, {
      issuer: `https://securetoken.google.com/${project}`,
      audience: project,
      algorithms: ["RS256"],
    });
    const email = String(payload.email ?? "").toLowerCase();
    if (payload.email_verified !== true || !ADMIN_EMAILS.includes(email)) return { ok: false, status: 403 };
    return { ok: true, email };
  } catch {
    return { ok: false, status: 401 };
  }
}
