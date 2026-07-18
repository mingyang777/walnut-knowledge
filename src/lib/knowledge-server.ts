import knowledgeBase from "@/data/knowledge-base.json";
import type { WalnutVariety } from "@/types/walnut";
import {
  FEATURED_IDS,
  getRelatedVarieties,
  withPoolImages,
} from "@/lib/knowledge";
import { getAllCustomImages, getCustomImages } from "@/lib/variety-image-store";

function withResolvedImages(
  variety: WalnutVariety,
  customMap: Record<string, string[]>
): WalnutVariety {
  const custom = customMap[variety.id];
  if (custom?.length) {
    return { ...variety, images: custom };
  }
  return withPoolImages(variety);
}

/** 异步：优先使用后台上传的实拍图（仅服务端） */
export async function getVarietiesAsync(): Promise<WalnutVariety[]> {
  const custom = await getAllCustomImages();
  return knowledgeBase.varieties.map((v) => withResolvedImages(v, custom));
}

export async function getVarietyByIdAsync(
  id: string
): Promise<WalnutVariety | undefined> {
  const variety = knowledgeBase.varieties.find((v) => v.id === id);
  if (!variety) return undefined;
  const custom = await getCustomImages(id);
  return withResolvedImages(variety, { [id]: custom });
}

export async function getFeaturedVarietiesAsync(): Promise<WalnutVariety[]> {
  const all = await getVarietiesAsync();
  return FEATURED_IDS.map((id) => all.find((v) => v.id === id)).filter(
    (v): v is WalnutVariety => Boolean(v)
  );
}

export async function getRelatedVarietiesAsync(
  id: string,
  limit = 4
): Promise<WalnutVariety[]> {
  const current = knowledgeBase.varieties.find((v) => v.id === id);
  if (!current) return getRelatedVarieties(id, limit);
  const all = await getVarietiesAsync();
  return all
    .filter(
      (v) =>
        v.id !== id && v.secondaryCategory === current.secondaryCategory
    )
    .slice(0, limit);
}
