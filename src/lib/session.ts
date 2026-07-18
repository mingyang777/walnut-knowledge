import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserPublic } from "@/types/user";

const COOKIE_NAME = "walnut_session";
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

export async function createSessionToken(payload: UserPublic) {
  return new SignJWT({ user: payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload.user as UserPublic;
}

export async function setSessionCookie(payload: UserPublic) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<UserPublic | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function toPublicUser(user: {
  id: string;
  accountName: string;
  nickname: string;
  avatarUrl?: string;
  phone?: string;
  wechatUsername?: string;
}): UserPublic {
  return {
    id: user.id,
    accountName: user.accountName,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    wechatUsername: user.wechatUsername,
  };
}
