import type { IdentificationResult } from "@/types/walnut";
import { getVarietySummaryForAI } from "@/lib/knowledge";

const SYSTEM_PROMPT = `你是一位资深文玩核桃鉴定专家。用户会上传一张核桃照片，请根据纹路、桩型、皮质、底部等特征判断品种。

请严格以 JSON 格式回复，不要包含其他文字：
{
  "varietyName": "品种名称",
  "confidence": 0.85,
  "pros": ["优点1", "优点2"],
  "cons": ["缺点1", "缺点2"],
  "predictedPrice": {
    "min": 500,
    "max": 3000,
    "unit": "元/对",
    "reasoning": "价格判断依据"
  },
  "identificationNotes": ["鉴别要点1", "鉴别要点2"],
  "alternativeMatches": [
    { "name": "可能的其他品种", "confidence": 0.3 }
  ]
}

confidence 为 0-1 之间的小数。价格单位为人民币元/对。

已收录品种参考：
`;

async function identifyWithOpenAI(
  imageBase64: string,
  mimeType: string
): Promise<IdentificationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "未配置 OPENAI_API_KEY。本地开发请在 .env.local 设置；线上部署请在 Vercel/腾讯云云托管的环境变量中设置。"
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const varietyContext = getVarietySummaryForAI();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + varietyContext,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请鉴定这张文玩核桃照片，判断品种并给出优缺点和预测价格。",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API 错误: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content) as IdentificationResult;
}

async function identifyWithDashscope(
  imageBase64: string,
  mimeType: string
): Promise<IdentificationResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "未配置 DASHSCOPE_API_KEY。本地开发请在 .env.local 设置；线上部署请在 Vercel/腾讯云云托管的环境变量中设置。"
    );
  }

  const model = process.env.DASHSCOPE_MODEL ?? "qwen-vl-max";
  const varietyContext = getVarietySummaryForAI();

  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT + varietyContext,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "请鉴定这张文玩核桃照片，判断品种并给出优缺点和预测价格。请严格返回 JSON。",
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`通义千问 API 错误: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content) as IdentificationResult;
}

export async function identifyWalnut(
  imageBase64: string,
  mimeType: string
): Promise<IdentificationResult> {
  const provider = process.env.AI_PROVIDER ?? "openai";

  if (provider === "dashscope") {
    return identifyWithDashscope(imageBase64, mimeType);
  }

  return identifyWithOpenAI(imageBase64, mimeType);
}
