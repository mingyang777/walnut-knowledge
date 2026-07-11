"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCategories, searchVarieties } from "@/lib/knowledge";
import SearchFilters from "@/components/SearchFilters";
import VarietyCard from "@/components/VarietyCard";

export default function KnowledgePage() {
  const searchParams = useSearchParams();
  const categories = getCategories();

  const [query, setQuery] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState(
    searchParams.get("category") ?? ""
  );
  const [secondaryCategory, setSecondaryCategory] = useState("");

  const results = useMemo(
    () =>
      searchVarieties({
        query,
        primaryCategory: primaryCategory || undefined,
        secondaryCategory: secondaryCategory || undefined,
      }),
    [query, primaryCategory, secondaryCategory]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-walnut-900">品种知识库</h1>
        <p className="mt-2 text-walnut-600">
          浏览、搜索文玩核桃品种，了解历史、辨认技巧与价格行情
        </p>
      </div>

      <SearchFilters
        categories={categories}
        query={query}
        primaryCategory={primaryCategory}
        secondaryCategory={secondaryCategory}
        onQueryChange={setQuery}
        onPrimaryChange={setPrimaryCategory}
        onSecondaryChange={setSecondaryCategory}
        resultCount={results.length}
      />

      {results.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((variety) => (
            <VarietyCard key={variety.id} variety={variety} />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-lg text-walnut-600">未找到匹配的品种</p>
          <p className="mt-1 text-sm text-walnut-500">试试调整搜索词或分类筛选</p>
        </div>
      )}
    </div>
  );
}
