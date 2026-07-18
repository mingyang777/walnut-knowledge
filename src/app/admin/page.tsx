"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

type Mode = "replace_all" | "replace_selected" | "append";

interface VarietyRow {
  id: string;
  name: string;
  alias?: string[];
  primaryName: string;
  secondaryName: string;
  images: string[];
  customImageCount: number;
}

interface PendingFile {
  id: string;
  file: File;
  preview: string;
}

export default function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [varieties, setVarieties] = useState<VarietyRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [onlineImages, setOnlineImages] = useState<string[]>([]);
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [mode, setMode] = useState<Mode>("replace_all");
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    const data = await res.json();
    setAuthenticated(Boolean(data.authenticated));
    setConfigured(data.configured !== false);
    setAuthLoading(false);
  }, []);

  const loadVarieties = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/varieties", { cache: "no-store" });
      const data = await res.json();
      setVarieties(data.varieties ?? []);
    } catch {
      setError("加载品种列表失败");
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/varieties/${id}/images`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "加载失败");
      setOnlineImages(data.images ?? []);
      setCustomImages(data.customImages ?? []);
      setIsCustom(Boolean(data.isCustom));
      setSelectedSlots([]);
      setPending((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.preview));
        return [];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authenticated) loadVarieties();
  }, [authenticated, loadVarieties]);

  useEffect(() => {
    if (selectedId && authenticated) loadDetail(selectedId);
  }, [selectedId, authenticated, loadDetail]);

  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return varieties;
    return varieties.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.alias?.some((a) => a.toLowerCase().includes(q)) ||
        v.primaryName.includes(query) ||
        v.secondaryName.includes(query)
    );
  }, [varieties, query]);

  const selected = varieties.find((v) => v.id === selectedId) ?? null;

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "登录失败");
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setSelectedId(null);
  };

  const onPickFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    const maxPick =
      mode === "replace_all"
        ? 6
        : mode === "replace_selected"
          ? Math.max(selectedSlots.length, 1)
          : Math.max(6 - customImages.length, 0);

    const incoming = Array.from(fileList).slice(0, maxPick);
    const next: PendingFile[] = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setPending((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.preview));
      return next;
    });
  };

  const movePending = (index: number, dir: -1 | 1) => {
    setPending((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleSlot = (index: number) => {
    setSelectedSlots((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const upload = async () => {
    if (!selectedId || pending.length === 0) return;
    if (mode === "replace_selected" && selectedSlots.length !== pending.length) {
      setError("「替换选中」时，上传张数需与勾选的线上图片数量一致");
      return;
    }
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("mode", mode);
      pending.forEach((p) => form.append("files", p.file));
      if (mode === "replace_selected") {
        form.set("replaceIndices", JSON.stringify(selectedSlots));
      }
      const res = await fetch(`/api/admin/varieties/${selectedId}/images`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "上传失败");
      setMessage(`上传成功，当前共 ${data.customImages?.length ?? 0} 张实拍图`);
      await loadDetail(selectedId);
      await loadVarieties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const moveOnline = async (index: number, dir: -1 | 1) => {
    if (!selectedId || !isCustom) return;
    const target = index + dir;
    if (target < 0 || target >= customImages.length) return;
    const urls = [...customImages];
    [urls[index], urls[target]] = [urls[target], urls[index]];
    setError(null);
    try {
      const res = await fetch(`/api/admin/varieties/${selectedId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "排序失败");
      setCustomImages(data.customImages);
      setOnlineImages(data.images);
      await loadVarieties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "排序失败");
    }
  };

  const removeOnline = async (index: number) => {
    if (!selectedId || !isCustom) return;
    if (!confirm("确定删除这张实拍图？")) return;
    try {
      const res = await fetch(
        `/api/admin/varieties/${selectedId}/images?index=${index}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "删除失败");
      setCustomImages(data.customImages);
      setOnlineImages(data.images);
      setIsCustom(data.isCustom);
      await loadVarieties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-walnut-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        加载中…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-walnut-900">后台管理</h1>
        <p className="mt-2 text-sm text-walnut-600">
          上传品种实拍图（需管理员账号）
        </p>
        {!configured && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            未配置 ADMIN_PASSWORD。请在腾讯云环境变量中设置后重新部署。
          </div>
        )}
        {loginError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {loginError}
          </div>
        )}
        <form onSubmit={login} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-walnut-600">
              账号
            </label>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" disabled={loggingIn} className="btn-primary w-full">
            {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "登录后台"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-walnut-900">
            品种实拍图管理
          </h1>
          <p className="mt-1 text-sm text-walnut-600">
            最多 6 张 · 单张 ≤ 10MB · 上传顺序即前台展示顺序
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadVarieties()}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4" />
            刷新列表
          </button>
          <button type="button" onClick={logout} className="btn-secondary">
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </div>
      </div>

      {(error || message) && (
        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-walnut-400" />
            <input
              className="input-field pl-9"
              placeholder="搜索品种名…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-walnut-500">
            {listLoading ? "加载中…" : `共 ${filtered.length} 个品种`}
          </p>
          <ul className="mt-3 max-h-[70vh] space-y-1 overflow-y-auto">
            {filtered.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                    selectedId === v.id
                      ? "bg-walnut-800 text-white"
                      : "hover:bg-walnut-50 text-walnut-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{v.name}</span>
                    <span
                      className={`shrink-0 text-xs ${
                        selectedId === v.id ? "text-walnut-200" : "text-walnut-500"
                      }`}
                    >
                      {v.customImageCount > 0
                        ? `${v.customImageCount} 张实拍`
                        : "未上传"}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 text-xs ${
                      selectedId === v.id ? "text-walnut-300" : "text-walnut-500"
                    }`}
                  >
                    {v.primaryName} · {v.secondaryName}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6">
          {!selected ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-walnut-500">
              <ImagePlus className="mb-3 h-10 w-10 opacity-40" />
              <p>点击左侧品种名称，打开上传入口</p>
            </div>
          ) : detailLoading ? (
            <div className="flex min-h-[320px] items-center justify-center text-walnut-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              加载图片…
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-bold text-walnut-900">
                {selected.name}
              </h2>
              <p className="mt-1 text-sm text-walnut-600">
                {selected.primaryName} · {selected.secondaryName}
                {selected.alias?.length
                  ? ` · 又名 ${selected.alias.join("、")}`
                  : ""}
              </p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-walnut-800">
                  当前线上图片
                  <span className="ml-2 font-normal text-walnut-500">
                    {isCustom ? "实拍图" : "默认参考图（尚未上传实拍）"}
                  </span>
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {onlineImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className={`relative overflow-hidden rounded-xl border ${
                        mode === "replace_selected" && selectedSlots.includes(index)
                          ? "border-walnut-700 ring-2 ring-walnut-400"
                          : "border-walnut-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`图 ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1.5 text-xs text-white">
                        <span>第 {index + 1} 张</span>
                        <div className="flex items-center gap-1">
                          {mode === "replace_selected" && isCustom && (
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="checkbox"
                                checked={selectedSlots.includes(index)}
                                onChange={() => toggleSlot(index)}
                              />
                              替换
                            </label>
                          )}
                          {isCustom && (
                            <>
                              <button
                                type="button"
                                className="rounded bg-white/20 px-1"
                                onClick={() => moveOnline(index, -1)}
                                aria-label="前移"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="rounded bg-white/20 px-1"
                                onClick={() => moveOnline(index, 1)}
                                aria-label="后移"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="rounded bg-white/20 px-1"
                                onClick={() => removeOnline(index)}
                                aria-label="删除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-4 border-t border-walnut-100 pt-6">
                <h3 className="text-sm font-semibold text-walnut-800">上传新图</h3>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["replace_all", "替换全部"],
                      ["replace_selected", "替换选中"],
                      ["append", "追加到末尾"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setMode(value);
                        setSelectedSlots([]);
                        setPending((prev) => {
                          prev.forEach((p) => URL.revokeObjectURL(p.preview));
                          return [];
                        });
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        mode === value
                          ? "bg-walnut-800 text-white"
                          : "bg-walnut-100 text-walnut-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-walnut-500">
                  {mode === "replace_all" &&
                    "新图将完全替换现有实拍图，顺序即展示顺序（最多 6 张）。"}
                  {mode === "replace_selected" &&
                    "先勾选要替换的线上图片，再选择相同数量的新图；新图按你调整的顺序对应勾选位置。"}
                  {mode === "append" &&
                    `在现有实拍图末尾追加（当前 ${customImages.length}/6）。`}
                </p>

                <label className="btn-secondary inline-flex cursor-pointer">
                  <Upload className="h-4 w-4" />
                  选择图片
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      onPickFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>

                {pending.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs text-walnut-600">
                      待上传 {pending.length} 张（可用箭头调整顺序）
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {pending.map((p, index) => (
                        <div
                          key={p.id}
                          className="relative overflow-hidden rounded-xl border border-walnut-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.preview}
                            alt={p.file.name}
                            className="aspect-square w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1.5 text-xs text-white">
                            <span>
                              #{index + 1} · {(p.file.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                className="rounded bg-white/20 px-1"
                                onClick={() => movePending(index, -1)}
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="rounded bg-white/20 px-1"
                                onClick={() => movePending(index, 1)}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={uploading || pending.length === 0}
                  onClick={upload}
                  className="btn-primary"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  确认上传
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
