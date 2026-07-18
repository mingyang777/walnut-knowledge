import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "walnut_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "walnut-dev-secret-change-in-production"
      : undefined);
  if (!secret) {
    throw new Error("未配置 AUTH_SECRET 环境变量");
  }
  return new TextEncoder().encode(secret);
}

export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD?.trim();
  return { username, password };
}

export function isAdminConfigured() {
  return Boolean(getAdminCredentials().password);
}

export function verifyAdminPassword(username: string, password: string) {
  const creds = getAdminCredentials();
  if (!creds.password) {
    throw new Error("未配置 ADMIN_PASSWORD，无法使用后台");
  }
  return username === creds.username && password === creds.password;
}

export async function createAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function setAdminSessionCookie() {
  const token = await createAdminToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    throw new Error("UNAUTHORIZED");
  }
}
