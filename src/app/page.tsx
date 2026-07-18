import Link from "next/link";
import { BookOpen, Camera, Search, Sparkles } from "lucide-react";
import { getCategories } from "@/lib/knowledge";
import {
  getFeaturedVarietiesAsync,
  getVarietiesAsync,
} from "@/lib/knowledge-server";
import VarietyCard from "@/components/VarietyCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allVarieties = await getVarietiesAsync();
  const categories = getCategories();
  const featured = (await getFeaturedVarietiesAsync()).slice(0, 6);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-walnut-800 via-walnut-700 to-walnut-900 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-walnut-300 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-walnut-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            文玩核桃一站式知识平台
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl">
            探索文玩核桃的
            <br />
            品种文化与鉴别艺术
          </h1>
          <p className="mt-4 max-w-2xl text-base text-walnut-200 sm:text-lg">
            收录 40 个经典品种，涵盖历史渊源、辨认技巧与价格参考。
            支持分类检索与 AI 智能识图，助你快速入门、精准选购。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/knowledge" className="btn-primary bg-white text-walnut-800 hover:bg-walnut-100">
              <BookOpen className="h-4 w-4" />
              浏览知识库
            </Link>
            <Link href="/identify" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Camera className="h-4 w-4" />
              AI 识图鉴别
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-serif text-2xl font-bold text-walnut-900">核心功能</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Link href="/knowledge" className="card group p-6 transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-walnut-100 text-walnut-700">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-walnut-900">
              品种知识库
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-walnut-600">
              收录麻核桃、铁核桃、秋子核桃等 {categories.length} 大品类，
              按狮子头类、虎头类等品种大类精细分类，
              含介绍、历史渊源、辨认技巧、价格区间与实拍参考图。
            </p>
          </Link>

          <Link href="/identify" className="card group p-6 transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-walnut-100 text-walnut-700">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-walnut-900">
              AI 识图鉴别
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-walnut-600">
              上传本地核桃照片，AI 自动识别品种，输出优缺点分析与市场预测价格。
              支持 OpenAI 与通义千问视觉模型。
            </p>
          </Link>
        </div>
      </section>

      <section className="bg-walnut-100/50 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-walnut-900">热门品种</h2>
            <Link href="/knowledge" className="text-sm font-medium text-walnut-700 hover:text-walnut-900">
              查看全部 →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((variety) => (
              <VarietyCard key={variety.id} variety={variety} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-serif text-2xl font-bold text-walnut-900">品类概览</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categories.map((cat) => {
            const count = allVarieties.filter((v) => v.primaryCategory === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/knowledge?category=${cat.id}`}
                className="card p-5 transition hover:shadow-md"
              >
                <h3 className="font-serif text-lg font-semibold text-walnut-900">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-walnut-600">{cat.description}</p>
                <p className="mt-3 text-sm font-medium text-walnut-700">
                  {count} 个品种 · {cat.children.length} 个子类
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
