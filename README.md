# 文玩核桃知识库

兼容 PC 与移动端的文玩核桃知识平台，包含品种知识库与 AI 识图鉴别两大核心功能。

## 功能

### 品种知识库
- 收录麻核桃、铁核桃、野核桃等品类
- 每个品种含：介绍、历史渊源、价格区间、辨认技巧、优缺点、典型图片
- 支持一级/二级分类筛选
- 支持关键词搜索（品种名、别名、产地、标签）

### AI 识图鉴别
- 上传本地核桃照片
- 输出：品种名称、优缺点、预测价格、鉴别要点
- 支持 OpenAI GPT-4o 与阿里云通义千问 Qwen-VL

## 快速开始

### 1. 安装 Node.js

从 [https://nodejs.org](https://nodejs.org) 安装 LTS 版本（建议 20+）。

### 2. 安装依赖

```bash
cd Projects/walnut-knowledge
npm install
```

### 3. 配置 AI API

```bash
copy .env.example .env.local
```

编辑 `.env.local`，填入 API Key：

```env
# 二选一
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxx

# 或使用通义千问
# AI_PROVIDER=dashscope
# DASHSCOPE_API_KEY=sk-xxx
```

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
walnut-knowledge/
├── src/
│   ├── data/
│   │   └── knowledge-base.json  # 品种数据（JSON 维护）
│   ├── app/
│   │   ├── page.tsx           # 首页
│   │   ├── knowledge/         # 知识库
│   │   ├── identify/          # 识图鉴别
│   │   └── api/identify/      # AI 鉴别 API
│   ├── components/            # UI 组件
│   ├── lib/                   # 数据与 AI 逻辑
│   └── types/                 # TypeScript 类型
└── .env.example
```

## 添加新品种

编辑 `src/data/knowledge-base.json`，在 `varieties` 数组中追加条目：

```json
{
  "id": "unique-id",
  "name": "品种名",
  "primaryCategory": "mahe",
  "secondaryCategory": "classic",
  "introduction": "...",
  "history": "...",
  "priceRange": { "min": 100, "max": 1000, "unit": "元/对" },
  "identificationTips": ["..."],
  "pros": ["..."],
  "cons": ["..."],
  "images": ["/images/xxx.jpg"],
  "tags": ["标签"]
}
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **AI**: OpenAI Vision / 通义千问 VL

## 部署

### 本地构建

```bash
npm run build
npm start
```

### 云端部署（推荐：GitHub + Vercel）

实现「任意设备访问网站 + 多电脑修改代码/知识库」，详见 **[DEPLOY.md](./DEPLOY.md)**。

> **国内用户注意**：Vercel 在国内经常无法访问。请改用 **[DEPLOY-TENCENT.md](./DEPLOY-TENCENT.md)** 部署到腾讯云，国内访问更稳定。
