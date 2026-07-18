"use client";

import type { Category } from "@/types/walnut";

interface CategoryQuickFiltersProps {
  categories: Category[];
  primaryCategory: string;
  secondaryCategory: string;
  onSecondaryChange: (value: string) => void;
}

export default function CategoryQuickFilters({
  categories,
  primaryCategory,
  secondaryCategory,
  onSecondaryChange,
}: CategoryQuickFiltersProps) {
  const selectedPrimary = categories.find((c) => c.id === primaryCategory);
  if (!selectedPrimary) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSecondaryChange("")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
          !secondaryCategory
            ? "bg-walnut-700 text-white"
            : "bg-walnut-100 text-walnut-700 hover:bg-walnut-200"
        }`}
      >
        全部{selectedPrimary.name}
      </button>
      {selectedPrimary.children.map((child) => (
        <button
          key={child.id}
          type="button"
          onClick={() => onSecondaryChange(child.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            secondaryCategory === child.id
              ? "bg-walnut-700 text-white"
              : "bg-walnut-100 text-walnut-700 hover:bg-walnut-200"
          }`}
        >
          {child.name}
        </button>
      ))}
    </div>
  );
}
