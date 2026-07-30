# AI大白话发布候选版本检查

检查时间：2026-07-30

本次只做发布候选检查，不修改业务代码。

## 结论

不建议发布。

阻塞问题：

1. 当前本地健康检查显示 `hunyuan=mock`，未验证微信审核版本中长问题会真实调用 CloudBase hy3。指定输入中：
   - `为什么AI会忘记聊天？` 返回 `source=llm`，但 `isMock=true`
   - `AI未来会替代人吗？` 返回 `source=llm`，但 `isMock=true`
2. 当前本地健康检查显示 `database=mock`，反馈、日志等数据没有确认生产数据库持久化。
3. 当前小程序端 `utils/api.js` 仍直接引用 `server/api.js`，发布前必须确认真实 `CLOUDBASE_AI_API_KEY` 不会进入小程序端包，并确认生产版 API/云函数调用链路。

## 1. 小程序包体

按 `project.config.json` 的 `packOptions.ignore` 估算：

```json
{
  "includedBytes": 1306358,
  "includedMB": 1.25,
  "includedFileCount": 51
}
```

结论：

- 包体低于普通小程序主包 `2MB` 限制。
- 包体本身满足提交审核条件。

当前最大包内文件：

```text
utils/knowledgeData.js             827015 bytes
assets/home/hero-woman.png         175543 bytes
assets/home/hero-robot.png         122829 bytes
assets/home/hero-bubble-orange.png  30500 bytes
assets/home/hero-bubble-white.png   23288 bytes
```

## 2. 页面路由

`app.json` 当前注册页面：

```json
[
  "pages/index/index",
  "pages/result/result",
  "pages/simpleExplain/simpleExplain"
]
```

页面四件套检查：

```json
[
  {
    "page": "pages/index/index",
    "js": true,
    "wxml": true,
    "wxss": true,
    "json": true
  },
  {
    "page": "pages/result/result",
    "js": true,
    "wxml": true,
    "wxss": true,
    "json": true
  },
  {
    "page": "pages/simpleExplain/simpleExplain",
    "js": true,
    "wxml": true,
    "wxss": true,
    "json": true
  }
]
```

跳转检查：

- 首页搜索跳转：`/pages/result/result?term=xxx`
- 结果页“换个更简单的说法”跳转：`/pages/simpleExplain/simpleExplain?term=xxx`

结论：

- 页面路由和文件存在性通过。

## 3. 首页搜索

`pages/index/index.js` 检查结果：

- 空输入会提示：`请输入要解释的AI关键词`
- 单字符输入会提示：`请输入更完整的AI关键词或问题`
- 有效输入会通过 `wx.navigateTo` 跳转结果页

结论：

- 首页搜索基础流程通过。

## 4. 结果页展示

结果页状态结构：

- `isLoading`：显示加载卡片
- `errorText`：显示错误卡片
- `resultData`：显示结果内容
- `wx:else`：兜底错误状态

模拟 `pages/result/result` 加载结果：

```json
[
  {
    "term": "API",
    "isLoading": false,
    "hasResultData": true,
    "errorText": "",
    "title": "API是什么？",
    "hasMain": true,
    "hasLife": true,
    "hasAi": true
  },
  {
    "term": "Phi",
    "isLoading": false,
    "hasResultData": true,
    "errorText": "",
    "title": "Phi是什么？",
    "hasMain": true,
    "hasLife": true,
    "hasAi": true
  },
  {
    "term": "为什么AI会忘记聊天？",
    "isLoading": false,
    "hasResultData": true,
    "errorText": "",
    "title": "为什么AI会忘记聊天？",
    "hasMain": true,
    "hasLife": true,
    "hasAi": true
  }
]
```

结论：

- 结果页数据渲染结构通过。
- 未发现页面状态导致的直接白屏风险。

## 5. 知识库命中

指定词条检查：

```json
[
  {
    "term": "API",
    "exists": true,
    "lifeExamples": 3,
    "relatedTerms": 3,
    "hasAiExample": true
  },
  {
    "term": "Phi",
    "exists": true,
    "lifeExamples": 3,
    "relatedTerms": 3,
    "hasAiExample": true
  },
  {
    "term": "Claude",
    "exists": true,
    "lifeExamples": 3,
    "relatedTerms": 4,
    "hasAiExample": true
  },
  {
    "term": "MCP",
    "exists": true,
    "lifeExamples": 3,
    "relatedTerms": 4,
    "hasAiExample": true
  }
]
```

API 返回检查：

```json
[
  {
    "keyword": "API",
    "success": true,
    "source": "knowledge",
    "matchType": "exact",
    "score": 100,
    "hasData": true,
    "term": "API"
  },
  {
    "keyword": "Phi",
    "success": true,
    "source": "knowledge",
    "matchType": "exact",
    "score": 100,
    "hasData": true,
    "term": "Phi"
  },
  {
    "keyword": "Claude",
    "success": true,
    "source": "knowledge",
    "matchType": "exact",
    "score": 100,
    "hasData": true,
    "term": "Claude"
  },
  {
    "keyword": "MCP",
    "success": true,
    "source": "knowledge",
    "matchType": "exact",
    "score": 100,
    "hasData": true,
    "term": "MCP"
  }
]
```

结论：

- 指定知识库命中项通过。

## 6. LLM 兜底

指定长问题检查：

```json
[
  {
    "keyword": "为什么AI会忘记聊天？",
    "success": true,
    "source": "llm",
    "matchType": "none",
    "score": 0,
    "hasData": true,
    "term": "为什么AI会忘记聊天？",
    "model": "hy3",
    "isMock": true
  },
  {
    "keyword": "AI未来会替代人吗？",
    "success": true,
    "source": "llm",
    "matchType": "none",
    "score": 0,
    "hasData": true,
    "term": "AI未来会替代人吗？",
    "model": "hy3",
    "isMock": true
  }
]
```

结论：

- LLM 兜底返回结构通过。
- 但当前检查环境返回 `isMock=true`，未证明审核版本会真实调用 CloudBase hy3。
- 这是发布阻塞项。

## 7. 环境变量

`config/env.js` 当前读取：

```text
API_BASE_URL
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
DATABASE_URL
HUNYUAN_MODEL
```

本地健康检查：

```json
{
  "status": "ok",
  "version": "2.0.0",
  "services": {
    "database": "mock",
    "hunyuan": "mock",
    "cache": "memory"
  }
}
```

结论：

- 环境变量读取代码存在。
- 当前检查环境未注入 CloudBase AI Key 和数据库连接。
- 生产环境需要单独验证。

## 8. API 错误处理

检查结果：

- `server/api.js` 使用 `observeApi()` 包装请求日志和错误日志。
- `postExplain()` 会校验空 keyword。
- `explainService.explain()` 会拒绝空 keyword。
- `hunyuanService` 在缺少 Key 或请求能力时会 fallback 到 mock。
- `pages/result/result.js` catch 后会设置 `errorText` 并显示 toast。

结论：

- API 基础错误处理存在。
- 生产环境不应静默 mock LLM 结果，需要明确报警或阻断。

## 9. 数据库连接

`server/database/connection.js` 当前逻辑：

- 有 `DATABASE_URL` 或注入 client 时视为 configured。
- 没有数据库 client 时，`query()` 返回 `数据库客户端未配置`。

健康检查结果：

```json
{
  "database": "mock"
}
```

结论：

- 数据库连接层存在。
- 当前检查环境没有真实数据库连接。
- 如果反馈、日志、用户数据要求持久化，这是发布阻塞项。

## 10. 基础校验

JSON 检查通过：

```text
OK app.json
OK project.config.json
OK sitemap.json
OK data/knowledge/terms.json
OK data/knowledge/version.json
```

JS 语法检查通过：

```text
OK JS syntax checked: 32
```

调试代码检查：

```text
未发现 console.log
未发现 debugger
未发现 TODO/FIXME
```

密钥明文检查：

- 未发现真实 JWT/API Key 明文。
- 仅发现环境变量名和 `Bearer ${env.CLOUDBASE_AI_API_KEY}` 代码引用。

## 最终判断

不建议发布。

阻塞问题只保留三项：

1. LLM 兜底当前为 mock，未验证审核版本真实 CloudBase hy3 调用。
2. 数据库当前为 mock，未验证反馈/日志数据持久化。
3. 小程序端仍直接引用 `server/api.js`，必须确认真实密钥不会进入小程序包，并确认生产 API/云函数调用方式。
