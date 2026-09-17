import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "./env";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function safeEqual(a: string, b: string) {
  // hash first so lengths always match and timing doesn't leak length
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// Keyed with the password too, so changing it signs everyone out.
function sign(payload: string) {
  return createHmac("sha256", `${env("ADMIN_SESSION_SECRET")}:${env("ADMIN_PASSWORD")}`)
    .update(payload)
    .digest("base64url");
}

export function checkCredentials(username: string, password: string) {
  const userOk = safeEqual(username, env("ADMIN_USERNAME"));
  const passOk = safeEqual(password, env("ADMIN_PASSWORD"));
  return userOk && passOk;
}

export async function createSession() {
  const payload = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  return Number(payload) > Date.now();
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
