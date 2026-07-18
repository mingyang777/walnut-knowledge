"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-config";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const errorMap: Record<string, string> = {
    wechat_cancelled: "已取消微信登录",
    wechat_not_configured:
      "微信登录尚未配置，请联系管理员在环境变量中设置 WECHAT_APP_ID",
    wechat_failed: "微信登录失败，请重试",
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-walnut-900">登录</h1>
      <p className="mt-2 text-sm text-walnut-600">
        请使用微信授权登录，首次登录将自动创建账号
      </p>

      {urlError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMap[urlError] ?? urlError}
        </div>
      )}

      <Link href="/api/auth/wechat" className="btn-primary mt-6 w-full py-3 text-base">
        <MessageCircle className="h-5 w-5" />
        微信授权登录
      </Link>

      <p className="mt-3 text-center text-xs text-walnut-500">
        点击后将跳转微信扫码，授权后自动返回本站
      </p>

      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-walnut-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-walnut-50 px-3 text-walnut-400">其他方式</span>
        </div>
      </div>

      <div
        className={`card mt-6 space-y-4 p-6 ${
          PHONE_AUTH_ENABLED ? "" : "opacity-50"
        }`}
        aria-disabled={!PHONE_AUTH_ENABLED}
      >
        {!PHONE_AUTH_ENABLED && (
          <p className="rounded-lg bg-walnut-100 px-3 py-2 text-center text-xs text-walnut-600">
            手机号登录暂未开放，敬请期待
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            手机号 / 账号
          </label>
          <input
            className="input-field cursor-not-allowed bg-walnut-50"
            placeholder="暂未开放"
            disabled
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            密码
          </label>
          <input
            type="password"
            className="input-field cursor-not-allowed bg-walnut-50"
            placeholder="暂未开放"
            disabled
          />
        </div>
        <button type="button" disabled className="btn-primary w-full opacity-60">
          手机号登录
        </button>

        <Link
          href="/register"
          className={`btn-secondary w-full ${
            PHONE_AUTH_ENABLED ? "" : "pointer-events-none opacity-60"
          }`}
          tabIndex={PHONE_AUTH_ENABLED ? 0 : -1}
          aria-disabled={!PHONE_AUTH_ENABLED}
        >
          <Phone className="h-4 w-4" />
          手机号注册
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
