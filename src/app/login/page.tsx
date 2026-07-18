"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlError = searchParams.get("error");
  const errorMap: Record<string, string> = {
    wechat_cancelled: "已取消微信登录",
    wechat_not_configured: "微信登录尚未配置，请使用手机号登录",
    wechat_failed: "微信登录失败，请重试",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "登录失败");
      await refresh();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-walnut-900">登录</h1>
      <p className="mt-2 text-sm text-walnut-600">
        使用手机号或微信账号名登录
      </p>

      {(error || urlError) && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error ?? errorMap[urlError!] ?? urlError}
        </div>
      )}

      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            手机号 / 微信账号名
          </label>
          <input
            className="input-field"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="请输入账号"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            密码
          </label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录"}
        </button>
      </form>

      <div className="mt-4 grid gap-3">
        <Link href="/api/auth/wechat" className="btn-secondary w-full">
          <MessageCircle className="h-4 w-4" />
          微信授权登录
        </Link>
        <Link href="/register" className="btn-secondary w-full">
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
