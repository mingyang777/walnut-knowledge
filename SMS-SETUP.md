# 阿里云短信验证码接入指南

注册时发送真实短信验证码，需先在阿里云完成短信服务开通与资质审核。

## 一、开通短信服务

1. 登录 https://www.aliyun.com
2. 打开 **短信服务** 控制台：https://dysms.console.aliyun.com/
3. 按提示完成 **企业/个人实名认证** 和 **短信服务开通**

## 二、申请短信签名

1. 控制台 → **国内消息** → **签名管理** → **添加签名**
2. 示例：
   - 签名名称：`文玩核桃`（或你的站点名）
   - 适用场景：验证码
   - 签名来源：网站 / 小程序 / 企业名称等（按实际选择）
3. 等待审核（通常 1–2 个工作日）

## 三、申请短信模板

1. 控制台 → **模板管理** → **添加模板**
2. 模板类型：**验证码**
3. 模板内容示例：

```
您的验证码为${code}，5分钟内有效，请勿泄露。
```

4. 审核通过后记下 **模板 CODE**，形如 `SMS_123456789`

> 模板变量名必须为 `code`，或在 `.env` 中设置 `ALIYUN_SMS_TEMPLATE_PARAM` 与模板一致。

## 四、创建 AccessKey

1. 访问 https://ram.console.aliyun.com/manage/ak
2. 创建 AccessKey（建议使用 RAM 子账号，仅授予短信发送权限）
3. 保存 **AccessKey ID** 和 **AccessKey Secret**

## 五、配置环境变量

### 本地 `.env.local`

```env
SMS_PROVIDER=aliyun
ALIYUN_ACCESS_KEY_ID=你的AccessKeyId
ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret
ALIYUN_SMS_SIGN_NAME=文玩核桃
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
ALIYUN_SMS_TEMPLATE_PARAM=code
```

### 开发模式（不发真实短信）

```env
SMS_PROVIDER=mock
SMS_MOCK_CODE=123456
```

### 腾讯云 / Vercel 线上环境

在云托管 **环境变量** 中添加上述 `SMS_PROVIDER=aliyun` 及阿里云相关变量，重新部署。

## 六、测试

1. 重启 `npm run dev`
2. 打开 http://localhost:3000/register
3. 输入手机号 → 获取验证码
4. 查收短信并注册

## 常见问题

| 问题 | 处理 |
|------|------|
| `isv.BUSINESS_LIMIT_CONTROL` | 同一手机号发送太频繁，等 60 秒 |
| `isv.SMS_SIGNATURE_ILLEGAL` | 签名未审核通过或名称填写错误 |
| `isv.SMS_TEMPLATE_ILLEGAL` | 模板 CODE 错误或模板未通过 |
| `InvalidAccessKeyId` | AccessKey 配置错误 |
| 开发阶段不想花钱 | 使用 `SMS_PROVIDER=mock` |

## 费用参考

验证码短信约 **0.045 元/条**（以阿里云官网为准），新用户常有免费额度。
