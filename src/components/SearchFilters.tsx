"use client";

import { Search, X } from "lucide-react";
import type { Category } from "@/types/walnut";

interface SearchFiltersProps {
  categories: Category[];
  query: string;
  primaryCategory: string;
  secondaryCategory: string;
  onQueryChange: (value: string) => void;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
  resultCount: number;
}

export default function SearchFilters({
  categories,
  query,
  primaryCategory,
  secondaryCategory,
  onQueryChange,
  onPrimaryChange,
  onSecondaryChange,
  resultCount,
}: SearchFiltersProps) {
  const selectedPrimary = categories.find((c) => c.id === primaryCategory);
  const hasFilters = query || primaryCategory || secondaryCategory;

  const clearAll = () => {
    onQueryChange("");
    onPrimaryChange("");
    onSecondaryChange("");
  };

  return (
    <div className="card p-4 sm:p-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-walnut-400" />
        <input
          type="search"
          placeholder="搜索品种名、别名、产地、标签..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            一级分类
          </label>
          <select
            value={primaryCategory}
            onChange={(e) => {
              onPrimaryChange(e.target.value);
              onSecondaryChange("");
            }}
            className="input-field"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-walnut-600">
            二级分类
          </label>
          <select
            value={secondaryCategory}
            onChange={(e) => onSecondaryChange(e.target.value)}
            disabled={!primaryCategory}
            className="input-field disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">全部子类</option>
            {selectedPrimary?.children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-walnut-600">
        <span>
          共找到 <strong className="text-walnut-800">{resultCount}</strong> 个品种
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-walnut-500 hover:text-walnut-700"
          >
            <X className="h-4 w-4" />
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
}
