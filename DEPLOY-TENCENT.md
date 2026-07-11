# 腾讯云部署指南（国内公网访问）

Vercel 在国内经常超时，推荐用 **腾讯云开发 CloudBase 云托管** 部署，国内访问稳定。

你的 GitHub 仓库：https://github.com/mingyang777/walnut-knowledge

---

## 一、注册腾讯云（约 5 分钟）

1. 打开 https://cloud.tencent.com
2. 注册账号并完成 **实名认证**（个人即可）
3. 打开 https://console.cloud.tencent.com/tcb 进入 **云开发控制台**
4. 点击 **新建环境**
   - 环境名称：`walnut-knowledge`
   - 套餐：选 **按量计费**（新用户有免费额度）
   - 地域：选离你近的，如 **上海** 或 **广州**

---

## 二、开通云托管

1. 在云开发控制台左侧，点 **云托管**
2. 首次使用按提示 **开通云托管**
3. 点 **新建服务**
   - 服务名称：`walnut-knowledge`
   - 端口：`3000`
   - 公网访问：**开启**

---

## 三、从 GitHub 部署（推荐）

### 方式 A：控制台绑定 GitHub（最简单）

1. 云托管 → 你的服务 → **部署发布** → **新建版本**
2. 部署方式选 **从 Git 仓库部署**
3. 关联 GitHub 账号，选择仓库：`mingyang777/walnut-knowledge`
4. 分支：`master`
5. 构建方式：**Dockerfile 构建**（项目根目录已有 `Dockerfile`）
6. 端口：`3000`
7. 点 **开始部署**

等待 5–10 分钟，构建完成后会给你一个国内可访问的地址，形如：

```
https://walnut-knowledge-xxxxx.ap-shanghai.app.tcloudbase.com
```

### 方式 B：用 CloudBase CLI

```powershell
# 安装 CLI
npm install -g @cloudbase/cli

# 登录（浏览器扫码）
tcb login

# 在项目目录部署
cd C:\Users\LMY\Projects\walnut-knowledge
tcb cloudrun deploy --port 3000
```

按提示选择环境 ID 和服务名即可。

---

## 四、配置环境变量（AI 识图）

云托管 → 服务 → **服务设置** → **版本管理** → **新建版本** → 环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `AI_PROVIDER` | `dashscope` | 国内推荐用通义千问 |
| `DASHSCOPE_API_KEY` | `sk-xxx` | 阿里云 DashScope 密钥 |

> 通义千问申请：https://dashscope.console.aliyun.com/

若用 OpenAI：

| 变量名 | 值 |
|--------|-----|
| `AI_PROVIDER` | `openai` |
| `OPENAI_API_KEY` | `sk-xxx` |

配置后 **发布新版本**，流量切到新版本。

---

## 五、验证部署

浏览器打开云托管给的默认域名，检查：

- [ ] 首页能打开
- [ ] 知识库 `/knowledge` 能浏览 12 个品种
- [ ] 品种详情页正常
- [ ] 识图页 `/identify` 能上传图片（需配好 API Key）

---

## 六、后续更新网站

```powershell
git add .
git commit -m "更新内容"
git push
```

若已绑定 GitHub 自动部署，push 后云托管会自动重新构建。

---

## 七、绑定自己的域名（可选）

1. 买一个域名（腾讯云、阿里云均可）
2. 完成 **ICP 备案**（国内服务器必须，约 1–2 周）
3. 云托管 → 服务 → **自定义域名** → 添加域名
4. 在 DNS 添加 CNAME 记录
5. 开启免费 HTTPS 证书

---

## 费用参考

- 云开发按量计费，个人小站流量低时 **每月几元到几十元**
- 新用户通常有免费试用额度

---

## 常见问题

| 问题 | 解决 |
|------|------|
| 构建失败 | 云托管 → 部署历史 → 查看日志 |
| 页面 503 | 确认端口为 3000，Dockerfile 含 `HOSTNAME=0.0.0.0` |
| CSS/图片 404 | 确认 `Dockerfile` 已提交到 GitHub |
| 识图失败 | 检查环境变量是否配置并发布了新版本 |
