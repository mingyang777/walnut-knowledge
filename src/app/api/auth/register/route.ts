import { NextResponse } from "next/server";
import { registerWithPhone } from "@/lib/users-store";
import { setSessionCookie, toPublicUser } from "@/lib/session";

export async function POST(request: Request) {
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
