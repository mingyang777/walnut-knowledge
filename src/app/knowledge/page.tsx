"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCategories, searchVarieties, sortVarieties } from "@/lib/knowledge";
import SearchFilters from "@/components/SearchFilters";
import CategoryQuickFilters from "@/components/CategoryQuickFilters";
import VarietyCard from "@/components/VarietyCard";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

export default function KnowledgePage() {
  const searchParams = useSearchParams();
  const categories = getCategories();

  const [query, setQuery] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState(
    searchParams.get("category") ?? ""
  );
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [sort, setSort] = useState<SortOption>("default");

  const results = useMemo(() => {
    const filtered = searchVarieties({
      query,
      primaryCategory: primaryCategory || undefined,
      secondaryCategory: secondaryCategory || undefined,
    });
    return sortVarieties(filtered, sort);
  }, [query, primaryCategory, secondaryCategory, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-walnut-900">品种知识库</h1>
        <p className="mt-2 text-walnut-600">
          40 个品种 · 麻核桃 / 铁核桃 / 秋子核桃 · 支持大类筛选与排序
        </p>
      </div>

      <SearchFilters
        categories={categories}
        query={query}
        primaryCategory={primaryCategory}
        secondaryCategory={secondaryCategory}
        onQueryChange={setQuery}
        onPrimaryChange={(value) => {
          setPrimaryCategory(value);
          setSecondaryCategory("");
        }}
        onSecondaryChange={setSecondaryCategory}
        resultCount={results.length}
      />

      <CategoryQuickFilters
        categories={categories}
        primaryCategory={primaryCategory}
        secondaryCategory={secondaryCategory}
        onSecondaryChange={setSecondaryCategory}
      />

      <div className="mt-6 flex items-center justify-end gap-2 text-sm">
        <span className="text-walnut-500">排序</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="input-field w-auto py-1.5"
        >
          <option value="default">默认</option>
          <option value="name">名称 A-Z</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
        </select>
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
