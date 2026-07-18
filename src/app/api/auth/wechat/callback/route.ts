import { NextResponse } from "next/server";
import { upsertWechatUser } from "@/lib/users-store";
import { setSessionCookie, toPublicUser } from "@/lib/session";

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${getBaseUrl(request)}/login?error=wechat_cancelled`);
  }

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.redirect(`${getBaseUrl(request)}/login?error=wechat_not_configured`);
  }

  try {
    const tokenRes = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.errmsg || "微信授权失败");
    }

    const profileRes = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
    );
    const profile = await profileRes.json();

    const user = await upsertWechatUser({
      openId: profile.openid,
      nickname: profile.nickname,
      avatarUrl: profile.headimgurl,
      wechatUsername: profile.nickname,
    });

    await setSessionCookie(toPublicUser(user));
    return NextResponse.redirect(`${getBaseUrl(request)}/profile?welcome=1`);
  } catch {
    return NextResponse.redirect(`${getBaseUrl(request)}/login?error=wechat_failed`);
  }
}
