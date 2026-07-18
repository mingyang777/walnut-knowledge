import { NextResponse } from "next/server";
import { loginWithAccount } from "@/lib/users-store";
import { setSessionCookie, toPublicUser } from "@/lib/session";

export async function POST(request: Request) {
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
