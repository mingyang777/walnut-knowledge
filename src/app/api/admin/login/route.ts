import { NextResponse } from "next/server";
import {
  isAdminConfigured,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "未配置 ADMIN_PASSWORD，请先在环境变量中设置后台密码" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!verifyAdminPassword(username, password)) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    await setAdminSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "登录失败" },
      { status: 400 }
    );
  }
}
