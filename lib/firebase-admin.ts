import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

let _app: App | undefined;

/**
 * Lazily initializes the Firebase Admin app from the FIREBASE_ADMIN_KEY env
 * var (a service account JSON string). Lazy so that route/module evaluation
 * during build never throws when the env var isn't present yet.
 */
function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_ADMIN_KEY env var is not set. Add the Firebase service " +
        "account JSON (as a single-line string) to your environment."
    );
  }
  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_ADMIN_KEY is not valid JSON.");
  }
  _app = initializeApp({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    credential: cert(serviceAccount as any),
  });
  return _app;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export { FieldValue };
