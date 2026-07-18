import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { User, UsersData } from "@/types/user";
import {
  sendVerificationCode,
  verifyVerificationCode,
} from "@/lib/sms";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureUsersFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    const initial: UsersData = { users: [] };
    await fs.writeFile(USERS_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readUsersData(): Promise<UsersData> {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  return JSON.parse(raw) as UsersData;
}

async function writeUsersData(data: UsersData) {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function randomNickname() {
  return `核桃玩家${Math.floor(1000 + Math.random() * 9000)}`;
}

function isValidPhone(phone: string) {
  return /^1[3-9]\d{9}$/.test(phone);
}

export async function sendSmsCode(phone: string) {
  return sendVerificationCode(phone);
}

export function verifySmsCode(phone: string, code: string) {
  return verifyVerificationCode(phone, code);
}

export async function registerWithPhone(params: {
  phone: string;
  password: string;
  smsCode: string;
  nickname?: string;
}) {
  const { phone, password, smsCode, nickname } = params;
  if (!isValidPhone(phone)) throw new Error("手机号格式不正确");
  if (password.length < 6) throw new Error("密码至少 6 位");
  if (!verifySmsCode(phone, smsCode)) throw new Error("验证码错误或已过期");

  const data = await readUsersData();
  if (data.users.some((u) => u.phone === phone)) {
    throw new Error("该手机号已注册");
  }

  const now = new Date().toISOString();
  const user: User = {
    id: crypto.randomUUID(),
    phone,
    accountName: phone,
    nickname: nickname?.trim() || randomNickname(),
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: now,
    updatedAt: now,
  };
  data.users.push(user);
  await writeUsersData(data);
  return user;
}

export async function loginWithAccount(account: string, password: string) {
  const data = await readUsersData();
  const user = data.users.find(
    (u) => u.accountName === account || u.phone === account || u.wechatUsername === account
  );
  if (!user || !user.passwordHash) {
    throw new Error("账号或密码错误");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("账号或密码错误");
  return user;
}

export async function upsertWechatUser(params: {
  openId: string;
  nickname: string;
  avatarUrl?: string;
  wechatUsername?: string;
}) {
  const data = await readUsersData();
  const existing = data.users.find((u) => u.wechatOpenId === params.openId);
  const now = new Date().toISOString();

  if (existing) {
    existing.nickname = params.nickname || existing.nickname;
    existing.avatarUrl = params.avatarUrl ?? existing.avatarUrl;
    existing.wechatUsername = params.wechatUsername ?? existing.wechatUsername;
    existing.updatedAt = now;
    await writeUsersData(data);
    return existing;
  }

  const accountName = params.wechatUsername || `wx_${params.openId.slice(-8)}`;
  const user: User = {
    id: crypto.randomUUID(),
    wechatOpenId: params.openId,
    wechatUsername: params.wechatUsername,
    accountName,
    nickname: params.nickname || randomNickname(),
    avatarUrl: params.avatarUrl,
    createdAt: now,
    updatedAt: now,
  };
  data.users.push(user);
  await writeUsersData(data);
  return user;
}

export async function updateNickname(userId: string, nickname: string) {
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    throw new Error("昵称长度为 2-20 个字符");
  }
  const data = await readUsersData();
  const user = data.users.find((u) => u.id === userId);
  if (!user) throw new Error("用户不存在");
  user.nickname = trimmed;
  user.updatedAt = new Date().toISOString();
  await writeUsersData(data);
  return user;
}

export async function getUserById(userId: string) {
  const data = await readUsersData();
  return data.users.find((u) => u.id === userId) ?? null;
}
