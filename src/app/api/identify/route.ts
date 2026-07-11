import { NextRequest, NextResponse } from "next/server";
import { identifyWalnut } from "@/lib/ai-identify";
import { getVarietyById, getVarieties } from "@/lib/knowledge";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPEG、PNG、WebP、GIF 格式" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图片大小不能超过 10MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageBase64 = buffer.toString("base64");

    const result = await identifyWalnut(imageBase64, file.type);

    const varieties = getVarieties();
    const matched = varieties.find(
      (v) =>
        v.name === result.varietyName ||
        v.alias?.includes(result.varietyName)
    );

    return NextResponse.json({
      ...result,
      matchedVarietyId: matched?.id,
      matchedVariety: matched
        ? {
            id: matched.id,
            name: matched.name,
            priceRange: matched.priceRange,
          }
        : null,
    });
  } catch (error) {
    console.error("Identification error:", error);
    const message =
      error instanceof Error ? error.message : "鉴别失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
