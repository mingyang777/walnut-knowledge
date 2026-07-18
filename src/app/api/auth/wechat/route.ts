import { NextResponse } from "next/server";

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin;
}

export async function GET(request: Request) {
  const appId = process.env.WECHAT_APP_ID;
  if (!appId) {
    return NextResponse.json(
      {
        error:
          "未配置 WECHAT_APP_ID。请在环境变量中设置微信开放平台网站应用 AppID 与 AppSecret。",
      },
      { status: 503 }
    );
  }

  const redirectUri = encodeURIComponent(
    `${getBaseUrl(request)}/api/auth/wechat/callback`
  );
  const state = crypto.randomUUID();
  const url =
    `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

  return NextResponse.redirect(url);
}
