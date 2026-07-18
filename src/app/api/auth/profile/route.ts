import { NextResponse } from "next/server";
import { updateNickname } from "@/lib/users-store";
import { getSessionUser, setSessionCookie, toPublicUser } from "@/lib/session";

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const body = await request.json();
    const user = await updateNickname(session.id, body.nickname);
    const publicUser = toPublicUser(user);
    await setSessionCookie(publicUser);
    return NextResponse.json({ user: publicUser });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 400 }
    );
  }
}
