import knowledgeBase from "@/data/knowledge-base.json";
import type { Category, WalnutVariety } from "@/types/walnut";

export function getCategories(): Category[] {
  return knowledgeBase.categories;
}

export function getVarieties(): WalnutVariety[] {
  return knowledgeBase.varieties;
}

export function getVarietyById(id: string): WalnutVariety | undefined {
  return knowledgeBase.varieties.find((v) => v.id === id);
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
    results = results.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.alias?.some((a) => a.toLowerCase().includes(q)) ||
        v.introduction.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q)) ||
        v.origin?.toLowerCase().includes(q)
    );
  }

  return results;
}

export function getVarietySummaryForAI(): string {
  return knowledgeBase.varieties
    .map(
      (v) =>
        `- ${v.name}（别名：${v.alias?.join("、") ?? "无"}）：${v.introduction.slice(0, 80)}... 价格参考：${v.priceRange.min}-${v.priceRange.max}${v.priceRange.unit}`
    )
    .join("\n");
}
