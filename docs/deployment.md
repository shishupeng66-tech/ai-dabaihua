# 腾讯云生产部署

## 部署目标

- 小程序端只访问业务 API，不直接调用模型。
- CloudBase AI Key 和 Environment ID 只保存在服务端环境。
- 模型调用统一经过 `server/services/hunyuanService.js`。
- 数据库使用腾讯云 PostgreSQL / TDSQL-C PostgreSQL。
- 日志、错误和性能指标后续接入腾讯云 CLS 或 APM。

## 推荐架构

```text
微信小程序
  -> 腾讯云 API 网关 / CloudBase HTTP
    -> Node.js 服务
      -> server/api.js
      -> server/services/*
      -> server/repositories/*
      -> 腾讯云 PostgreSQL
      -> CloudBase AI Gateway
      -> 腾讯混元 hy3
```

## 环境变量

| 名称 | 用途 |
| --- | --- |
| `API_BASE_URL` | 小程序请求的服务端 API 地址 |
| `CLOUDBASE_ENV_ID` | CloudBase 环境 ID |
| `CLOUDBASE_AI_API_KEY` | CloudBase AI Gateway 鉴权 Key |
| `MODEL_API_URL` | CloudBase AI Gateway Chat Completions 地址 |
| `HUNYUAN_MODEL` | 使用的混元模型，默认 `hy3` |
| `DATABASE_URL` | PostgreSQL 连接串 |

`MODEL_API_URL` 默认格式：

```text
https://<CLOUDBASE_ENV_ID>.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completions
```

## 数据库初始化

按顺序执行：

1. `database/migrations/001_users.sql`
2. `database/migrations/002_knowledge_terms.sql`
3. `database/migrations/003_pending_terms.sql`
4. `database/migrations/004_search_logs.sql`
5. `database/migrations/005_model_usage.sql`
6. `database/migrations/006_answer_evaluations.sql`
7. `database/migrations/007_favorites.sql`
8. `database/migrations/008_knowledge_versions.sql`

生产环境要求：

- 先在测试库执行迁移。
- 迁移账号和业务账号分离。
- 执行前备份正式库。

## 混元配置

1. 在 CloudBase 控制台确认小程序成长计划资源可用。
2. 确认 CloudBase 环境已启用 AI 生文模型。
3. 将环境 ID 写入 `CLOUDBASE_ENV_ID`。
4. 将 CloudBase AI Key 写入 `CLOUDBASE_AI_API_KEY`。
5. `HUNYUAN_MODEL` 默认使用 `hy3`，如控制台启用其他模型，可通过环境变量覆盖。
6. 所有模型调用必须经过 `server/services/hunyuanService.js`。

请求格式：

```text
POST https://<CLOUDBASE_ENV_ID>.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completions
Authorization: Bearer <CLOUDBASE_AI_API_KEY>
Content-Type: application/json
```

```json
{
  "model": "hy3",
  "messages": [
    {
      "role": "user",
      "content": "prompt"
    }
  ],
  "temperature": 0.4,
  "stream": false
}
```

## 可观测能力

当前已预留：

- `loggerService`: 请求日志和错误日志
- `performanceService`: API、混元、知识库、数据库耗时
- `GET /api/health`: 服务健康检查

生产建议：

- 请求日志写入腾讯云 CLS。
- 错误日志接入告警。
- 混元耗时和 Token 消耗接入 Dashboard。
- `/api/health` 接入云监控探活。

## 发布检查

- `CLOUDBASE_ENV_ID` 不为空。
- `CLOUDBASE_AI_API_KEY` 不为空。
- `MODEL_API_URL` 指向 CloudBase AI Gateway。
- `HUNYUAN_MODEL` 已设置为可用模型，默认 `hy3`。
- `DATABASE_URL` 不为空。
- `/api/health` 返回 `status: "ok"`。
- 所有 migrations 已执行。
- Admin 接口有权限校验。
- 日志中不输出 CloudBase AI Key、openid、session_key。
