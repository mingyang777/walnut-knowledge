"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useAuth();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) setNickname(user.nickname);
  }, [user, loading, router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存失败");
      await refresh();
      setMessage("昵称已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="p-8 text-center text-walnut-600">加载中...</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-walnut-900">个人中心</h1>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-walnut-200 text-xl font-semibold text-walnut-800">
            {user.nickname.slice(0, 1)}
          </div>
          <div>
            <p className="font-medium text-walnut-900">{user.nickname}</p>
            <p className="text-sm text-walnut-500">账号：{user.accountName}</p>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-walnut-600">
              修改昵称
            </label>
            <input
              className="input-field"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              minLength={2}
              maxLength={20}
              required
            />
          </div>
          {message && <p className="text-sm text-green-700">{message}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存昵称"}
          </button>
        </form>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="btn-secondary mt-4 w-full"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>

      <Link href="/" className="mt-4 inline-block text-sm text-walnut-600 hover:text-walnut-800">
        ← 返回首页
      </Link>
    </div>
  );
}
