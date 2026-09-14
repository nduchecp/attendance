// lib/auth.ts
// Session token generation and verification using standard Web Crypto API (supported in Node & Edge)

const SESSION_COOKIE_NAME = "attendance_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Fallback secret for local development; in production set SESSION_SECRET
const SECRET_KEY_STRING =
  process.env.SESSION_SECRET || "attendance-system-admin-secret-key-32-chars-min!";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@attendance.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPass123!";

export interface SessionPayload {
  email: string;
  exp: number; // Unix timestamp in seconds
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY_STRING),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadB64 = base64UrlEncode(payloadBytes);

  const key = await getCryptoKey();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  const sigB64 = base64UrlEncode(new Uint8Array(signatureBytes));

  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, sigB64] = parts;
    const key = await getCryptoKey();

    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      new Uint8Array(base64UrlDecode(sigB64)) as BufferSource,
      new TextEncoder().encode(payloadB64)
    );

    if (!verified) return null;

    const payloadText = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadText) as SessionPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export function validateCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE, ADMIN_EMAIL };
