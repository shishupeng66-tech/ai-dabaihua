# 生产安全配置

## CloudBase AI Key 保护

- `CLOUDBASE_AI_API_KEY` 不允许写入小程序端代码。
- `CLOUDBASE_ENV_ID` 可以作为配置存在，但生产服务仍应统一从服务端环境读取。
- 混元调用只能发生在服务端 `server/services/hunyuanService.js`。
- 腾讯云部署时使用 CloudBase 环境变量或 Secret Manager 注入敏感配置。
- 日志中禁止输出完整 CloudBase AI Key、openid、session_key。

## 请求限制

- 对 `/api/explain` 按用户、IP、openid 做频率限制。
- 对 `/api/admin/*` 做更严格限制，只允许管理员角色访问。
- 混元调用保留缓存和并发去重，避免重复请求导致成本失控。

## 日志脱敏

- openid 只记录 hash 或尾号。
- 用户输入可以记录用于知识库补充，但需要过滤手机号、邮箱、身份证等敏感信息。
- 模型请求和响应日志默认不保存全文；如需保存，应设置过期时间和访问权限。

## 权限控制

- 普通用户只能访问搜索、解释、收藏、反馈接口。
- 管理员才能访问内容审核、批量生成、发布、Dashboard 和质量分析接口。
- 发布正式知识库必须记录 reviewer_id、change_log 和版本号。

## 数据库访问

- Repository 层负责数据库读写，service 不直接写 SQL。
- 数据库账号按最小权限拆分：只读、读写、迁移。
- 生产迁移必须先在测试库执行，再进入正式库。

## 腾讯云建议

- 使用腾讯云 Secret Manager 或 CloudBase 环境变量管理敏感配置。
- 使用腾讯云 WAF/API 网关做限流和基础防护。
- 使用腾讯云 PostgreSQL/TDSQL-C 的自动备份与审计能力。
