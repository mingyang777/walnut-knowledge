import Dysmsapi20170525, {
  SendSmsRequest,
} from "@alicloud/dysmsapi20170525";
import * as $OpenApi from "@alicloud/openapi-client";

const smsCodes = new Map<string, { code: string; expiresAt: number }>();
const lastSendAt = new Map<string, number>();

const CODE_TTL_MS = 5 * 60 * 1000;
const SEND_INTERVAL_MS = 60 * 1000;

function isValidPhone(phone: string) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getProvider() {
  return process.env.SMS_PROVIDER ?? "mock";
}

function getTemplateParamName() {
  return process.env.ALIYUN_SMS_TEMPLATE_PARAM ?? "code";
}

function createAliyunClient() {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  if (!accessKeyId || !accessKeySecret) {
    throw new Error("未配置 ALIYUN_ACCESS_KEY_ID / ALIYUN_ACCESS_KEY_SECRET");
  }

  const config = new $OpenApi.Config({
    accessKeyId,
    accessKeySecret,
    endpoint: "dysmsapi.aliyuncs.com",
  });
  return new Dysmsapi20170525(config);
}

async function sendViaAliyun(phone: string, code: string) {
  const signName = process.env.ALIYUN_SMS_SIGN_NAME;
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE;
  if (!signName || !templateCode) {
    throw new Error("未配置 ALIYUN_SMS_SIGN_NAME / ALIYUN_SMS_TEMPLATE_CODE");
  }

  const paramName = getTemplateParamName();
  const client = createAliyunClient();
  const request = new SendSmsRequest({
    phoneNumbers: phone,
    signName,
    templateCode,
    templateParam: JSON.stringify({ [paramName]: code }),
  });

  const response = await client.sendSms(request);
  const body = response.body;
  if (!body || body.code !== "OK") {
    throw new Error(body?.message ?? "短信发送失败");
  }
}

function storeCode(phone: string, code: string) {
  smsCodes.set(phone, { code, expiresAt: Date.now() + CODE_TTL_MS });
}

export async function sendVerificationCode(phone: string) {
  if (!isValidPhone(phone)) {
    throw new Error("手机号格式不正确");
  }

  const last = lastSendAt.get(phone);
  if (last && Date.now() - last < SEND_INTERVAL_MS) {
    const waitSec = Math.ceil((SEND_INTERVAL_MS - (Date.now() - last)) / 1000);
    throw new Error(`发送过于频繁，请 ${waitSec} 秒后再试`);
  }

  const provider = getProvider();
  const code =
    provider === "mock" && process.env.SMS_MOCK_CODE
      ? process.env.SMS_MOCK_CODE
      : generateCode();

  if (provider === "aliyun") {
    await sendViaAliyun(phone, code);
    storeCode(phone, code);
    lastSendAt.set(phone, Date.now());
    return { success: true, mock: false };
  }

  storeCode(phone, code);
  lastSendAt.set(phone, Date.now());
  return {
    success: true,
    mock: true,
    hint: process.env.SMS_MOCK_CODE
      ? "开发模式：验证码为 SMS_MOCK_CODE 配置值"
      : "开发模式：验证码已生成（未接入真实短信）",
  };
}

export function verifyVerificationCode(phone: string, code: string) {
  if (getProvider() === "mock") {
    const mockCode = process.env.SMS_MOCK_CODE;
    if (mockCode && code === mockCode) return true;
  }

  const record = smsCodes.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    smsCodes.delete(phone);
    return false;
  }
  const ok = record.code === code;
  if (ok) smsCodes.delete(phone);
  return ok;
}
