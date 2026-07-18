import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  History,
  Lightbulb,
  MapPin,
  Tag,
  XCircle,
} from "lucide-react";
import { getCategoryName } from "@/lib/knowledge";
import {
  getRelatedVarietiesAsync,
  getVarietyByIdAsync,
} from "@/lib/knowledge-server";
import RelatedVarieties from "@/components/RelatedVarieties";
import VarietyImage from "@/components/VarietyImage";
import {
  getVarietyImagePosition,
  IMAGE_ATTRIBUTION,
} from "@/lib/variety-images";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function VarietyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const variety = await getVarietyByIdAsync(id);

  if (!variety) {
    notFound();
  }

  const related = await getRelatedVarietiesAsync(id);
  const { primary, secondary } = getCategoryName(
    variety.primaryCategory,
    variety.secondaryCategory
  );
  const isCustomUpload = variety.images.some((src) =>
    src.startsWith("/api/media/")
  );
  const gallery = variety.images.slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/knowledge"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-walnut-600 hover:text-walnut-800"
      >
        <ArrowLeft className="h-4 w-4" />
        返回知识库
      </Link>

      <div className="card overflow-hidden">
        <div
          className={`grid gap-1 ${
            gallery.length === 1
              ? "grid-cols-1"
              : gallery.length === 2
                ? "sm:grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {gallery.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-[4/3] bg-walnut-100"
            >
              <VarietyImage
                src={src}
                alt={`${variety.name} 实拍图 ${index + 1}`}
                fill
                className="object-cover"
                style={{
                  objectPosition: isCustomUpload
                    ? "center"
                    : getVarietyImagePosition(variety.id),
                }}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
          ))}
        </div>
        <p className="border-b border-walnut-100 px-4 py-2 text-xs text-walnut-500">
          {isCustomUpload ? "品种实拍图" : IMAGE_ATTRIBUTION}
        </p>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag">{primary}</span>
            <span className="tag">{secondary}</span>
            {variety.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold text-walnut-900">
            {variety.name}
          </h1>

          {variety.alias && variety.alias.length > 0 && (
            <p className="mt-1 text-walnut-500">
              又名：{variety.alias.join("、")}
            </p>
          )}

          {variety.origin && (
            <p className="mt-2 flex items-center gap-1 text-sm text-walnut-600">
              <MapPin className="h-4 w-4" />
              产地：{variety.origin}
            </p>
          )}

          <div className="mt-4 rounded-xl bg-walnut-50 p-4">
            <p className="text-sm font-medium text-walnut-700">参考价格</p>
            <p className="mt-1 text-2xl font-bold text-walnut-900">
              ¥{variety.priceRange.min} - ¥{variety.priceRange.max}
              <span className="ml-1 text-sm font-normal text-walnut-600">
                {variety.priceRange.unit}
              </span>
            </p>
            {variety.priceRange.notes && (
              <p className="mt-1 text-sm text-walnut-600">
                {variety.priceRange.notes}
              </p>
            )}
          </div>

          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-walnut-900">
              <Tag className="h-5 w-5" />
              品种介绍
            </h2>
            <p className="mt-3 leading-relaxed text-walnut-700">
              {variety.introduction}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-walnut-900">
              <History className="h-5 w-5" />
              历史渊源
            </h2>
            <p className="mt-3 leading-relaxed text-walnut-700">
              {variety.history}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-walnut-900">
              <Lightbulb className="h-5 w-5" />
              辨认技巧
            </h2>
            <ul className="mt-3 space-y-2">
              {variety.identificationTips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm leading-relaxed text-walnut-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-walnut-200 text-xs font-medium text-walnut-800">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-green-800">
                <CheckCircle className="h-5 w-5" />
                优点
              </h3>
              <ul className="mt-3 space-y-1.5">
                {variety.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-green-700">
                    · {pro}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-red-800">
                <XCircle className="h-5 w-5" />
                缺点
              </h3>
              <ul className="mt-3 space-y-1.5">
                {variety.cons.map((con, i) => (
                  <li key={i} className="text-sm text-red-700">
                    · {con}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link href="/identify" className="btn-primary">
              上传照片鉴别此品种
            </Link>
          </div>
        </div>
      </div>

      <RelatedVarieties varieties={related} />
    </div>
  );
}
