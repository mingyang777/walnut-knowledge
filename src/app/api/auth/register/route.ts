import { NextResponse } from "next/server";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-config";
import { registerWithPhone } from "@/lib/users-store";
import { setSessionCookie, toPublicUser } from "@/lib/session";

export async function POST(request: Request) {
  if (!PHONE_AUTH_ENABLED) {
    return NextResponse.json(
      { error: "手机号注册暂未开放，请使用微信登录" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const user = await registerWithPhone({
      phone: body.phone,
      password: body.password,
      smsCode: body.smsCode,
      nickname: body.nickname,
    });
    await setSessionCookie(toPublicUser(user));
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "注册失败" },
      { status: 400 }
    );
  }
}
