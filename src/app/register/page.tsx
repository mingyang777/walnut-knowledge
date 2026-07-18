"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smsHint, setSmsHint] = useState<string | null>(null);

  const sendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "发送失败");
      setSmsHint(
        data.mock
          ? data.hint ?? "开发模式：请查看 SMS-SETUP.md 配置真实短信"
          : "验证码已发送至您的手机，5 分钟内有效"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSending(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, smsCode, nickname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "注册失败");
      await refresh();
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-walnut-900">注册</h1>
      <p className="mt-2 text-sm text-walnut-600">
        注册成功将自动生成昵称，可在个人中心修改
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            手机号
          </label>
          <input
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11 位手机号"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            验证码
          </label>
          <div className="flex gap-2">
            <input
              className="input-field"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              placeholder="短信验证码"
              required
            />
            <button
              type="button"
              onClick={sendCode}
              disabled={sending || !phone}
              className="btn-secondary shrink-0 whitespace-nowrap"
            >
              {sending ? "发送中" : "获取验证码"}
            </button>
          </div>
          {smsHint && <p className="mt-1 text-xs text-walnut-500">{smsHint}</p>}
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
            placeholder="至少 6 位"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            确认密码
          </label>
          <input
            type="password"
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            昵称（可选）
          </label>
          <input
            className="input-field"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="留空则自动生成"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "注册并登录"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-walnut-600">
        已有账号？{" "}
        <Link href="/login" className="font-medium text-walnut-800 hover:underline">
          去登录
        </Link>
      </p>
    </div>
  );
}
