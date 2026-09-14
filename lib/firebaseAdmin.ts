import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-side only. NEVER import this file from a "use client" component --
 * it reads the service account key, which must never reach the browser.
 *
 * Expects one of:
 *   FIREBASE_SERVICE_ACCOUNT_KEY = the full JSON key contents as a string
 *     (e.g. from your hosting provider's secret manager), OR
 *   GOOGLE_APPLICATION_CREDENTIALS = a filesystem path to the key file
 *     (simplest for local dev -- see .env.local.example).
 */
function buildApp(): App {
  if (getApps().length) {
    return getApp();
  }

  const inlineKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (inlineKey) {
    const serviceAccount = JSON.parse(inlineKey);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Falls back to GOOGLE_APPLICATION_CREDENTIALS env var pointing at a file,
  // or Application Default Credentials if running on Google infrastructure.
  return initializeApp();
}

const app = buildApp();
export const db = getFirestore(app);
