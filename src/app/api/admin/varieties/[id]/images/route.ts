import { NextResponse } from "next/server";
import knowledgeBase from "@/data/knowledge-base.json";
import { requireAdmin } from "@/lib/admin-auth";
import {
  MAX_IMAGES_PER_VARIETY,
  appendImages,
  deleteImageAt,
  getCustomImages,
  reorderCustomImages,
  replaceAllImages,
  replaceSelectedImages,
} from "@/lib/variety-image-store";
import { getVarietyImagesForId } from "@/lib/variety-images";

interface Params {
  params: Promise<{ id: string }>;
}

function varietyExists(id: string) {
  return knowledgeBase.varieties.some((v) => v.id === id);
}

async function guard() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ error: "请先登录后台" }, { status: 401 });
  }
}

export async function GET(_request: Request, { params }: Params) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!varietyExists(id)) {
    return NextResponse.json({ error: "品种不存在" }, { status: 404 });
  }

  const custom = await getCustomImages(id);
  return NextResponse.json({
    images: custom.length > 0 ? custom : getVarietyImagesForId(id, 2),
    customImages: custom,
    isCustom: custom.length > 0,
    max: MAX_IMAGES_PER_VARIETY,
  });
}

export async function POST(request: Request, { params }: Params) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!varietyExists(id)) {
    return NextResponse.json({ error: "品种不存在" }, { status: 404 });
  }

  try {
    const form = await request.formData();
    const mode = String(form.get("mode") ?? "replace_all");
    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "请选择图片文件" }, { status: 400 });
    }
    if (files.length > MAX_IMAGES_PER_VARIETY) {
      return NextResponse.json(
        { error: `最多上传 ${MAX_IMAGES_PER_VARIETY} 张` },
        { status: 400 }
      );
    }

    let images: string[];
    if (mode === "replace_all") {
      images = await replaceAllImages(id, files);
    } else if (mode === "replace_selected") {
      const raw = String(form.get("replaceIndices") ?? "[]");
      const replaceIndices = JSON.parse(raw) as number[];
      if (!Array.isArray(replaceIndices)) {
        throw new Error("replaceIndices 格式错误");
      }
      images = await replaceSelectedImages(id, files, replaceIndices);
    } else if (mode === "append") {
      images = await appendImages(id, files);
    } else {
      throw new Error("未知上传模式");
    }

    return NextResponse.json({ images, customImages: images, isCustom: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传失败" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!varietyExists(id)) {
    return NextResponse.json({ error: "品种不存在" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const urls = body.urls as string[];
    if (!Array.isArray(urls)) throw new Error("urls 必须为数组");
    const images = await reorderCustomImages(id, urls);
    return NextResponse.json({ images, customImages: images, isCustom: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "排序失败" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const unauthorized = await guard();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!varietyExists(id)) {
    return NextResponse.json({ error: "品种不存在" }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const index = Number(searchParams.get("index"));
    if (Number.isNaN(index)) throw new Error("缺少 index 参数");
    const images = await deleteImageAt(id, index);
    return NextResponse.json({
      images: images.length > 0 ? images : getVarietyImagesForId(id, 2),
      customImages: images,
      isCustom: images.length > 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 400 }
    );
  }
}
