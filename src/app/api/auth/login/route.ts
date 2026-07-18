import { NextResponse } from "next/server";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-config";
import { loginWithAccount } from "@/lib/users-store";
import { setSessionCookie, toPublicUser } from "@/lib/session";

export async function POST(request: Request) {
  if (!PHONE_AUTH_ENABLED) {
    return NextResponse.json(
      { error: "手机号登录暂未开放，请使用微信登录" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const user = await loginWithAccount(body.account, body.password);
    await setSessionCookie(toPublicUser(user));
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "登录失败" },
      { status: 401 }
    );
  }
}
