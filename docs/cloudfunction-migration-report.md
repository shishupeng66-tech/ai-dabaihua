# AI大白话 CloudBase 云函数迁移第一阶段报告

完成时间：2026-07-30

## 目标

解决小程序端直接引用 `server/api.js` 的问题。

目标链路：

```text
微信小程序
  ↓
wx.cloud.callFunction({ name: "api" })
  ↓
cloudfunctions/api
  ↓
server/api.js
  ↓
knowledge / hunyuan
```

## 1. 本次新增文件

```text
cloudfunctions/api/index.js
cloudfunctions/api/package.json
cloudfunctions/api/config/env.js
cloudfunctions/api/data/knowledge/terms.json
cloudfunctions/api/data/knowledge/version.json
cloudfunctions/api/server/**
cloudfunctions/api/utils/knowledge.js
cloudfunctions/api/utils/knowledgeLoader.js
docs/cloudfunction-migration-report.md
```

说明：

- `cloudfunctions/api/index.js` 是云函数入口。
- `cloudfunctions/api/server/api.js` 是现有 `server/api.js` 的部署副本，业务逻辑未重构。
- `cloudfunctions/api/data/knowledge/terms.json` 是云函数内知识库数据源。
- `cloudfunctions/api/utils/knowledgeLoader.js` 在云函数包内读取 `../data/knowledge/terms.json`。

## 2. 本次修改文件

```text
app.js
utils/api.js
project.config.json
cloudfunctions/api/utils/knowledgeLoader.js
cloudfunctions/api/package.json
```

修改说明：

### app.js

新增：

```js
wx.cloud.init({
  traceUser: true
})
```

作用：

- 初始化小程序云开发能力。
- 不写入任何密钥。

### utils/api.js

原来：

```js
const serverApi = require('../server/api.js')
```

现在：

```js
wx.cloud.callFunction({
  name: 'api',
  data: {
    action,
    data
  }
})
```

保留原有对外方法：

```text
explainTerm
search
sendKnowledgeFeedback
getKnowledgeVersion
getHealth
request
postExplain
```

页面无需修改。

### project.config.json

新增：

```json
"cloudfunctionRoot": "cloudfunctions/"
```

并将以下内容排除出小程序前端上传包：

```text
server
config
utils/knowledge.js
utils/knowledgeLoader.js
utils/knowledgeData.js
utils/knowledgeVersionData.js
data/knowledge
```

效果：

- 小程序包不再包含服务端目录。
- 小程序包不再包含知识库完整数据。
- 真实密钥后续只应存在于云函数环境变量。

## 3. 云函数入口设计

`cloudfunctions/api/index.js` 支持 action 分发：

| action | 调用 |
| --- | --- |
| `explain` | `serverApi.postExplain(data)` |
| `search` | `serverApi.getSearch(data)` |
| `knowledgeVersion` | `serverApi.getKnowledgeVersion()` |
| `knowledgeFeedback` | `serverApi.postKnowledgeFeedback(data)` |
| `health` | `serverApi.getHealth()` |

错误返回：

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": ""
  }
}
```

## 4. 知识库迁移处理

已复制：

```text
data/knowledge/terms.json
  ↓
cloudfunctions/api/data/knowledge/terms.json
```

已复制：

```text
data/knowledge/version.json
  ↓
cloudfunctions/api/data/knowledge/version.json
```

云函数内 loader：

```js
const knowledgeData = require('../data/knowledge/terms.json')
const versionData = require('../data/knowledge/version.json')
```

小程序前端包不再包含：

```text
data/knowledge
utils/knowledgeData.js
```

## 5. 环境变量

云函数运行时读取：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
DATABASE_URL
HUNYUAN_MODEL
```

小程序端不读取：

```text
CLOUDBASE_AI_API_KEY
DATABASE_URL
```

云函数 `package.json` 已声明：

```json
{
  "engines": {
    "node": ">=18"
  }
}
```

原因：

- 现有 `hunyuanService.js` 在服务端环境使用 `fetch`。
- Node 18+ 默认支持 `fetch`。

## 6. 小程序包体与隔离检查

按当前 `project.config.json` 估算前端包：

```json
{
  "includedMB": 0.43,
  "includedFileCount": 27,
  "includesServer": false,
  "includesConfig": false,
  "includesCloudfunctions": false,
  "includesKnowledgeData": false
}
```

结论：

- `server/` 不进入小程序包。
- `config/` 不进入小程序包。
- `cloudfunctions/` 不进入小程序包。
- `utils/knowledgeData.js` 不进入小程序包。

## 7. 测试结果

### 云函数入口直测

执行：

```text
cloudfunctions/api/index.js main({ action: "explain", data: { keyword } })
```

结果：

```json
[
  {
    "keyword": "API",
    "success": true,
    "source": "knowledge",
    "term": "API",
    "hasData": true
  },
  {
    "keyword": "Phi",
    "success": true,
    "source": "knowledge",
    "term": "Phi",
    "hasData": true
  },
  {
    "keyword": "Claude",
    "success": true,
    "source": "knowledge",
    "term": "Claude",
    "hasData": true
  },
  {
    "keyword": "为什么AI会忘记聊天？",
    "success": true,
    "source": "llm",
    "term": "为什么AI会忘记聊天？",
    "hasData": true,
    "model": "hy3",
    "isMock": true
  }
]
```

说明：

- `API`、`Phi`、`Claude` 知识库命中正常。
- 长问题进入 LLM 兜底路径正常。
- 本地未注入 `CLOUDBASE_AI_API_KEY`，所以长问题返回 `isMock=true`。部署到 CloudBase 并配置环境变量后，应复测 `isMock=false`。

### 小程序请求层模拟测试

模拟：

```text
utils/api.js
  ↓
wx.cloud.callFunction
  ↓
cloudfunctions/api
```

结果：

```json
[
  {
    "keyword": "API",
    "success": true,
    "source": "knowledge",
    "term": "API"
  },
  {
    "keyword": "Phi",
    "success": true,
    "source": "knowledge",
    "term": "Phi"
  },
  {
    "keyword": "Claude",
    "success": true,
    "source": "knowledge",
    "term": "Claude"
  },
  {
    "keyword": "为什么AI会忘记聊天？",
    "success": true,
    "source": "llm",
    "term": "为什么AI会忘记聊天？",
    "isMock": true
  }
]
```

反馈接口模拟：

```json
{
  "success": true,
  "type": "understood"
}
```

健康检查：

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

## 8. 基础校验

JSON 检查通过：

```text
OK app.json
OK project.config.json
OK cloudfunctions/api/package.json
OK cloudfunctions/api/data/knowledge/terms.json
OK cloudfunctions/api/data/knowledge/version.json
```

JS 语法检查通过：

```text
OK JS syntax checked: 53
```

## 9. 当前限制

1. 云函数内的 `server/` 是当前根目录 `server/` 的部署副本。后续如果根目录 `server/` 改动，需要同步到 `cloudfunctions/api/server/`。
2. 本地没有注入 `CLOUDBASE_AI_API_KEY`，所以 LLM 兜底仍是 mock。
3. `knowledgeFeedbackRepository` 仍是内存存储，云函数重启后反馈会丢失。
4. 第一阶段只解决“server 代码进入客户端”的问题，没有完成数据库持久化。

## 10. 下一步

部署到 CloudBase 后必须验证：

```text
API -> source=knowledge
Phi -> source=knowledge
Claude -> source=knowledge
为什么AI会忘记聊天？ -> source=llm, isMock=false
```

云函数环境变量必须配置：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
HUNYUAN_MODEL=hy3
```

如果要持久化反馈，再配置：

```text
DATABASE_URL
```

## 11. 结论

CloudBase 云函数迁移第一阶段已完成。

已解决：

```text
小程序端直接引用 server/api.js
server/config/knowledgeData 进入小程序包
```

尚未解决：

```text
CloudBase 真实 hy3 调用验证
数据库持久化
云函数部署后端副本同步机制
```
