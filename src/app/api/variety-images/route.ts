import { NextResponse } from "next/server";
import { getAllCustomImages } from "@/lib/variety-image-store";

/** 公开：返回已上传实拍图映射，供前台实时合并展示 */
export async function GET() {
  const varieties = await getAllCustomImages();
  return NextResponse.json({ varieties });
}
