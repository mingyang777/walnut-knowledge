"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import type { IdentificationResult } from "@/types/walnut";

interface IdentifyResponse extends IdentificationResult {
  matchedVarietyId?: string;
  matchedVariety?: {
    id: string;
    name: string;
    priceRange: { min: number; max: number; unit: string };
  } | null;
}

export default function IdentifyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResponse | null>(null);

  const handleFile = useCallback((selected: File) => {
    if (!selected.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }
    setFile(selected);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const identify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "鉴别失败");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "鉴别失败");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-walnut-900">
          AI 识图鉴别
        </h1>
        <p className="mt-2 text-walnut-600">
          上传核桃照片，AI 自动识别品种、分析优缺点并预测价格
        </p>
      </div>

      {!result && (
        <div
          className="card cursor-pointer border-2 border-dashed border-walnut-300 p-8 text-center transition hover:border-walnut-500 hover:bg-walnut-50/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) handleFile(selected);
            }}
          />

          {preview ? (
            <div className="relative mx-auto aspect-square max-w-xs overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="预览"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-walnut-100">
                <Upload className="h-8 w-8 text-walnut-600" />
              </div>
              <p className="mt-4 font-medium text-walnut-800">
                点击或拖拽上传核桃照片
              </p>
              <p className="mt-1 text-sm text-walnut-500">
                支持 JPG、PNG、WebP，最大 10MB
              </p>
            </>
          )}
        </div>
      )}

      {preview && !result && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={identify}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                鉴别中...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                开始鉴别
              </>
            )}
          </button>
          <button type="button" onClick={reset} className="btn-secondary">
            重新选择
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">鉴别失败</p>
            <p className="mt-1 text-sm">{error}</p>
            {error.includes("API") && (
              <p className="mt-2 text-sm">
                请复制 <code className="rounded bg-red-100 px-1">.env.example</code> 为{" "}
                <code className="rounded bg-red-100 px-1">.env.local</code> 并填入 API Key
              </p>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {preview && (
            <div className="card overflow-hidden">
              <div className="relative aspect-video bg-walnut-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="上传的核桃"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          )}

          <div className="card p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-walnut-600">鉴别结果</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-walnut-900">
                  {result.varietyName}
                </h2>
                <p className="mt-1 text-sm text-walnut-500">
                  置信度：{Math.round(result.confidence * 100)}%
                </p>
              </div>
              {result.matchedVarietyId && (
                <Link
                  href={`/knowledge/${result.matchedVarietyId}`}
                  className="btn-secondary text-xs"
                >
                  查看知识库
                </Link>
              )}
            </div>

            <div className="mt-6 rounded-xl bg-walnut-50 p-4">
              <p className="text-sm font-medium text-walnut-700">预测价格</p>
              <p className="mt-1 text-2xl font-bold text-walnut-900">
                ¥{result.predictedPrice.min} - ¥{result.predictedPrice.max}
                <span className="ml-1 text-sm font-normal text-walnut-600">
                  {result.predictedPrice.unit}
                </span>
              </p>
              <p className="mt-2 text-sm text-walnut-600">
                {result.predictedPrice.reasoning}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  优点
                </h3>
                <ul className="mt-2 space-y-1">
                  {result.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-green-700">
                      · {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-red-800">
                  <XCircle className="h-5 w-5" />
                  缺点
                </h3>
                <ul className="mt-2 space-y-1">
                  {result.cons.map((con, i) => (
                    <li key={i} className="text-sm text-red-700">
                      · {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result.identificationNotes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-walnut-800">鉴别要点</h3>
                <ul className="mt-2 space-y-1">
                  {result.identificationNotes.map((note, i) => (
                    <li key={i} className="text-sm text-walnut-700">
                      · {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.alternativeMatches &&
              result.alternativeMatches.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-walnut-800">其他可能</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.alternativeMatches.map((alt, i) => (
                      <span key={i} className="tag">
                        {alt.name} ({Math.round(alt.confidence * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <button type="button" onClick={reset} className="btn-secondary mt-8 w-full">
              重新鉴别
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
