import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { resolveUploadPath } from "@/lib/variety-image-store";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

interface Params {
  params: Promise<{ id: string; file: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id, file } = await params;
    const filePath = resolveUploadPath(id, file);
    const data = await fs.readFile(filePath);
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "图片不存在" }, { status: 404 });
  }
}
