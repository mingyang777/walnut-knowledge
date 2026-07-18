import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const MAX_IMAGES_PER_VARIETY = 6;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const DATA_DIR = path.join(process.cwd(), "data");
const META_FILE = path.join(DATA_DIR, "variety-images.json");
const UPLOAD_ROOT = path.join(DATA_DIR, "uploads", "varieties");

export type VarietyImageMeta = Record<string, string[]>;

interface MetaFile {
  varieties: VarietyImageMeta;
}

async function ensureStore() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
  try {
    await fs.access(META_FILE);
  } catch {
    const initial: MetaFile = { varieties: {} };
    await fs.writeFile(META_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readMeta(): Promise<MetaFile> {
  await ensureStore();
  const raw = await fs.readFile(META_FILE, "utf-8");
  const data = JSON.parse(raw) as MetaFile;
  if (!data.varieties || typeof data.varieties !== "object") {
    return { varieties: {} };
  }
  return data;
}

async function writeMeta(data: MetaFile) {
  await ensureStore();
  await fs.writeFile(META_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function toMediaUrl(varietyId: string, filename: string) {
  return `/api/media/varieties/${encodeURIComponent(varietyId)}/${encodeURIComponent(filename)}`;
}

function filenameFromUrl(url: string): string | null {
  const parts = url.split("/");
  const name = parts[parts.length - 1];
  return name ? decodeURIComponent(name) : null;
}

export async function getAllCustomImages(): Promise<VarietyImageMeta> {
  const meta = await readMeta();
  return meta.varieties;
}

export async function getCustomImages(varietyId: string): Promise<string[]> {
  const meta = await readMeta();
  return meta.varieties[varietyId] ?? [];
}

async function deleteFileIfExists(varietyId: string, filename: string) {
  const filePath = path.join(UPLOAD_ROOT, varietyId, filename);
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing
  }
}

export async function reorderCustomImages(varietyId: string, urls: string[]) {
  const current = await getCustomImages(varietyId);
  if (urls.length !== current.length) {
    throw new Error("排序列表长度与现有图片不一致");
  }
  const set = new Set(current);
  if (!urls.every((u) => set.has(u))) {
    throw new Error("排序列表包含无效图片");
  }
  const meta = await readMeta();
  meta.varieties[varietyId] = urls;
  await writeMeta(meta);
  return urls;
}

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

async function saveUpload(
  varietyId: string,
  file: File
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`不支持的图片格式：${file.type || "未知"}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`单张图片不能超过 10MB（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB）`);
  }

  const dir = path.join(UPLOAD_ROOT, varietyId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extFromType(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return toMediaUrl(varietyId, filename);
}

/** 替换全部：新上传顺序即为展示顺序 */
export async function replaceAllImages(varietyId: string, files: File[]) {
  if (files.length === 0) throw new Error("请至少上传 1 张图片");
  if (files.length > MAX_IMAGES_PER_VARIETY) {
    throw new Error(`最多上传 ${MAX_IMAGES_PER_VARIETY} 张图片`);
  }

  const old = await getCustomImages(varietyId);
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await saveUpload(varietyId, file));
  }

  for (const url of old) {
    const name = filenameFromUrl(url);
    if (name) await deleteFileIfExists(varietyId, name);
  }

  const meta = await readMeta();
  meta.varieties[varietyId] = urls;
  await writeMeta(meta);
  return urls;
}

/**
 * 替换指定槽位：replaceIndices 与 files 一一对应（按选择顺序）
 * 未选中的槽位保留，总数不超过 6
 */
export async function replaceSelectedImages(
  varietyId: string,
  files: File[],
  replaceIndices: number[]
) {
  if (files.length === 0) throw new Error("请至少上传 1 张图片");
  if (replaceIndices.length !== files.length) {
    throw new Error("选中的线上图片数量需与上传数量一致");
  }

  const current = [...(await getCustomImages(varietyId))];
  if (current.length === 0) {
    throw new Error("该品种暂无线上实拍图，请使用「替换全部」");
  }

  const sortedPairs = replaceIndices
    .map((index, i) => ({ index, file: files[i] }))
    .sort((a, b) => a.index - b.index);

  for (const { index } of sortedPairs) {
    if (index < 0 || index >= current.length) {
      throw new Error(`无效的图片位置：${index + 1}`);
    }
  }

  const unique = new Set(replaceIndices);
  if (unique.size !== replaceIndices.length) {
    throw new Error("替换位置不能重复");
  }

  for (const { index, file } of sortedPairs) {
    const oldUrl = current[index];
    const newUrl = await saveUpload(varietyId, file);
    current[index] = newUrl;
    const name = filenameFromUrl(oldUrl);
    if (name) await deleteFileIfExists(varietyId, name);
  }

  const meta = await readMeta();
  meta.varieties[varietyId] = current;
  await writeMeta(meta);
  return current;
}

/** 在末尾追加（总数 ≤ 6） */
export async function appendImages(varietyId: string, files: File[]) {
  const current = await getCustomImages(varietyId);
  if (current.length + files.length > MAX_IMAGES_PER_VARIETY) {
    throw new Error(
      `最多 ${MAX_IMAGES_PER_VARIETY} 张，当前已有 ${current.length} 张，还可上传 ${MAX_IMAGES_PER_VARIETY - current.length} 张`
    );
  }
  const urls = [...current];
  for (const file of files) {
    urls.push(await saveUpload(varietyId, file));
  }
  const meta = await readMeta();
  meta.varieties[varietyId] = urls;
  await writeMeta(meta);
  return urls;
}

export async function deleteImageAt(varietyId: string, index: number) {
  const current = await getCustomImages(varietyId);
  if (index < 0 || index >= current.length) {
    throw new Error("无效的图片位置");
  }
  const [removed] = current.splice(index, 1);
  const name = filenameFromUrl(removed);
  if (name) await deleteFileIfExists(varietyId, name);
  const meta = await readMeta();
  if (current.length === 0) {
    delete meta.varieties[varietyId];
  } else {
    meta.varieties[varietyId] = current;
  }
  await writeMeta(meta);
  return current;
}

export function resolveUploadPath(varietyId: string, filename: string) {
  const safeId = path.basename(varietyId);
  const safeName = path.basename(filename);
  if (safeId !== varietyId || safeName !== filename) {
    throw new Error("非法路径");
  }
  return path.join(UPLOAD_ROOT, safeId, safeName);
}
