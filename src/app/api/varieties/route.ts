import { NextResponse } from "next/server";
import knowledgeBase from "@/data/knowledge-base.json";
import { getVarietyImagesForId } from "@/lib/variety-images";
import { getAllCustomImages } from "@/lib/variety-image-store";
import { getCategoryName } from "@/lib/knowledge";

export async function GET() {
  const custom = await getAllCustomImages();
  const varieties = knowledgeBase.varieties.map((v) => {
    const images =
      custom[v.id]?.length > 0
        ? custom[v.id]
        : getVarietyImagesForId(v.id, 2);
    const { primary, secondary } = getCategoryName(
      v.primaryCategory,
      v.secondaryCategory
    );
    return {
      id: v.id,
      name: v.name,
      alias: v.alias,
      primaryCategory: v.primaryCategory,
      secondaryCategory: v.secondaryCategory,
      primaryName: primary,
      secondaryName: secondary,
      images,
      customImageCount: custom[v.id]?.length ?? 0,
      origin: v.origin,
      priceRange: v.priceRange,
      introduction: v.introduction,
      tags: v.tags,
    };
  });

  return NextResponse.json({ varieties });
}
