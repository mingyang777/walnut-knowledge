import knowledgeBase from "@/data/knowledge-base.json";
import type { Category, WalnutVariety } from "@/types/walnut";
import { getVarietyImagesForId } from "@/lib/variety-images";

const FEATURED_IDS = [
  "shizitou",
  "nanjiangshi",
  "sizuolou",
  "mantianxing",
  "maisui-hutou",
  "gongzimao",
  "mopan",
  "denglong-qiuzi",
];

function withPoolImages(variety: WalnutVariety): WalnutVariety {
  return { ...variety, images: getVarietyImagesForId(variety.id, 2) };
}

export function getCategories(): Category[] {
  return knowledgeBase.categories;
}

/** 同步版本：仅使用图池（客户端组件可用） */
export function getVarieties(): WalnutVariety[] {
  return knowledgeBase.varieties.map(withPoolImages);
}

export function getVarietyById(id: string): WalnutVariety | undefined {
  const variety = knowledgeBase.varieties.find((v) => v.id === id);
  return variety ? withPoolImages(variety) : undefined;
}

export function getFeaturedVarieties(): WalnutVariety[] {
  const all = getVarieties();
  return FEATURED_IDS.map((id) => all.find((v) => v.id === id)).filter(
    (v): v is WalnutVariety => Boolean(v)
  );
}

export function getRelatedVarieties(id: string, limit = 4): WalnutVariety[] {
  const current = knowledgeBase.varieties.find((v) => v.id === id);
  if (!current) return [];
  return getVarieties()
    .filter(
      (v) =>
        v.id !== id && v.secondaryCategory === current.secondaryCategory
    )
    .slice(0, limit);
}

export function getCategoryName(
  primaryId: string,
  secondaryId: string
): { primary: string; secondary: string } {
  const primary = knowledgeBase.categories.find((c) => c.id === primaryId);
  const secondary = primary?.children.find((c) => c.id === secondaryId);
  return {
    primary: primary?.name ?? primaryId,
    secondary: secondary?.name ?? secondaryId,
  };
}

export function searchVarieties(params: {
  query?: string;
  primaryCategory?: string;
  secondaryCategory?: string;
}): WalnutVariety[] {
  const { query, primaryCategory, secondaryCategory } = params;
  let results = knowledgeBase.varieties;

  if (primaryCategory) {
    results = results.filter((v) => v.primaryCategory === primaryCategory);
  }

  if (secondaryCategory) {
    results = results.filter((v) => v.secondaryCategory === secondaryCategory);
  }

  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter((v) => {
      const { secondary } = getCategoryName(
        v.primaryCategory,
        v.secondaryCategory
      );
      return (
        v.name.toLowerCase().includes(q) ||
        v.alias?.some((a) => a.toLowerCase().includes(q)) ||
        v.introduction.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q)) ||
        v.origin?.toLowerCase().includes(q) ||
        secondary.toLowerCase().includes(q)
      );
    });
  }

  return results.map(withPoolImages);
}

export function sortVarieties(
  varieties: WalnutVariety[],
  sort: "default" | "price-asc" | "price-desc" | "name"
): WalnutVariety[] {
  const copy = [...varieties];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceRange.min - b.priceRange.min);
    case "price-desc":
      return copy.sort((a, b) => b.priceRange.max - a.priceRange.max);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    default:
      return copy;
  }
}

export function getVarietySummaryForAI(): string {
  return knowledgeBase.varieties
    .map(
      (v) =>
        `- ${v.name}（别名：${v.alias?.join("、") ?? "无"}）：${v.introduction.slice(0, 80)}... 价格参考：${v.priceRange.min}-${v.priceRange.max}${v.priceRange.unit}`
    )
    .join("\n");
}

export function applyCustomImages<T extends { id: string; images: string[] }>(
  varieties: T[],
  customMap: Record<string, string[]>
): T[] {
  return varieties.map((v) => {
    const custom = customMap[v.id];
    if (custom?.length) return { ...v, images: custom };
    return v;
  });
}

export { FEATURED_IDS, withPoolImages };
