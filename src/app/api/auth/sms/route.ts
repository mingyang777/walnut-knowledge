import { NextResponse } from "next/server";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-config";
import { sendSmsCode } from "@/lib/users-store";

export async function POST(request: Request) {
  if (!PHONE_AUTH_ENABLED) {
    return NextResponse.json(
      { error: "短信验证码服务暂未开放" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = await sendSmsCode(body.phone);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发送失败" },
      { status: 400 }
    );
  }
}
