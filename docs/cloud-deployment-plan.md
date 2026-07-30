# AI大白话生产部署架构迁移方案

检查时间：2026-07-30

本方案只做架构分析，不修改代码。

## 目标架构

```text
微信小程序
  ↓
CloudBase 云函数 / 云托管
  ↓
server/api.js
  ↓
explainService
  ↓
knowledgeService / hunyuanService
  ↓
CloudBase AI Gateway hy3
```

核心目标：

- 小程序端不再直接 `require('../server/api.js')`。
- `server/`、`config/`、真实密钥不进入小程序包。
- 现有 `server/api.js`、`explainService`、`knowledgeService`、`hunyuanService` 尽量保留。
- 最小改动完成上线隔离。

## 1. 当前 server 目录结构

```text
server/
  api.js
  database/
    connection.js
    repositoryFactory.js
  models/
    errorLog.js
    knowledge.js
    knowledgeFeedback.js
  prompts/
    businessPrompt.js
    comparePrompt.js
    developerPrompt.js
    explainPrompt.js
  repositories/
    knowledgeFeedbackRepository.js
    knowledgeRepository.js
  services/
    explainModeService.js
    explainService.js
    healthService.js
    hunyuanService.js
    knowledgeFeedbackService.js
    knowledgeService.js
    loggerService.js
```

当前职责：

- `server/api.js`：统一导出 `postExplain`、`getSearch`、`getKnowledgeVersion`、`getHealth`、`postKnowledgeFeedback`。
- `explainService.js`：知识库优先，未命中调用 `hunyuanService`。
- `knowledgeService.js`：调用 repository 查询知识库。
- `hunyuanService.js`：封装 CloudBase AI Gateway 请求、prompt、缓存、mock fallback。
- `database/connection.js`：预留数据库 client / `DATABASE_URL`。
- `repositories/`：当前主要是本地/memory/json 适配，未来替换数据库。

## 2. 当前 API 调用方式

当前小程序端：

```js
const serverApi = require('../server/api.js')
```

调用链：

```text
pages/index
pages/result
pages/simpleExplain
  ↓
utils/api.js
  ↓
server/api.js
  ↓
server/services/*
  ↓
config/env.js
```

当前问题：

- `server/api.js` 会进入小程序端依赖链。
- `server/services/hunyuanService.js` 会进入小程序端依赖链。
- `config/env.js` 会进入小程序端依赖链。
- `hunyuanService.js` 包含 `Authorization: Bearer ${env.CLOUDBASE_AI_API_KEY}`。
- 如果真实 Key 被注入到前端环境，会产生泄露风险。

结论：

- 当前 `server/api.js` 不是纯服务端入口。
- 当前结构适合本地 Demo，不适合生产发布。

## 3. 最小改动迁移方案

### 阶段 1：新增 CloudBase 云函数入口

新增目录建议：

```text
cloudfunctions/
  api/
    index.js
    package.json
```

`cloudfunctions/api/index.js` 职责：

```text
接收 event
  ↓
根据 event.path / event.action 分发
  ↓
调用 server/api.js
  ↓
返回统一 JSON
```

最小分发设计：

```js
const api = require('../../server/api.js')

exports.main = async (event) => {
  const action = event.action
  const data = event.data || {}

  if (action === 'explain') {
    return api.postExplain(data)
  }

  if (action === 'search') {
    return api.getSearch(data)
  }

  if (action === 'knowledgeVersion') {
    return api.getKnowledgeVersion()
  }

  if (action === 'knowledgeFeedback') {
    return api.postKnowledgeFeedback(data)
  }

  if (action === 'health') {
    return api.getHealth()
  }

  return {
    success: false,
    error: 'UNKNOWN_ACTION'
  }
}
```

说明：

- 不改 `server/api.js` 的业务函数。
- 只新增一个云函数适配层。
- 小程序端改为 `wx.cloud.callFunction`。

### 阶段 2：小程序请求层切换到云函数

只改 `utils/api.js`。

当前：

```js
const serverApi = require('../server/api.js')
```

目标：

```text
utils/api.js
  ↓
wx.cloud.callFunction({
  name: 'api',
  data: {
    action: 'explain',
    data: { keyword }
  }
})
```

保留对外方法名：

```text
explainTerm(term)
search(keyword)
sendKnowledgeFeedback(payload)
getKnowledgeVersion()
getHealth()
```

这样 `pages/index`、`pages/result`、`pages/simpleExplain` 不需要改业务逻辑。

### 阶段 3：排除 server/config 进入小程序包

修改 `project.config.json`：

```json
{
  "type": "folder",
  "value": "server"
},
{
  "type": "folder",
  "value": "config"
}
```

注意：

- 只有小程序前端包需要排除。
- 云函数部署包需要包含 `server/`、`config/`、`utils/knowledgeData.js`。

建议将云函数运行代码和小程序代码的打包边界明确分开。

## 4. 需要新增哪些云函数文件

最小新增：

```text
cloudfunctions/api/index.js
cloudfunctions/api/package.json
```

推荐新增：

```text
cloudfunctions/api/config.json
cloudfunctions/api/README.md
```

如果采用云托管而不是云函数，则新增：

```text
cloudrun/
  server.js
  package.json
  Dockerfile
```

云函数更适合当前最小改动，因为现有 `server/api.js` 已经是函数式导出，不需要先改成 Express/Koa。

## 5. 小程序需要改哪些调用

最小只改：

```text
utils/api.js
```

建议改法：

| 当前方法 | 云端 action | 返回结构 |
| --- | --- | --- |
| `explainTerm(term)` | `explain` | 保持 `{ success, source, data }` |
| `search(keyword)` | `search` | 保持当前结构 |
| `sendKnowledgeFeedback(payload)` | `knowledgeFeedback` | 保持当前结构 |
| `getKnowledgeVersion()` | `knowledgeVersion` | 保持当前结构 |
| `getHealth()` | `health` | 保持当前结构 |

页面无需修改：

```text
pages/index/index.js
pages/result/result.js
pages/simpleExplain/simpleExplain.js
```

前提：

- `utils/api.js` 保持相同函数名和返回 Promise。
- 云函数返回结构与现有 `server/api.js` 一致。

## 6. 环境变量如何迁移

当前环境变量：

```text
API_BASE_URL
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
DATABASE_URL
HUNYUAN_MODEL
```

迁移原则：

- 小程序端不保存任何真实密钥。
- CloudBase 云函数/云托管保存真实密钥。
- `config/env.js` 只在云端运行时读取 `process.env`。

云端需要配置：

```text
CLOUDBASE_ENV_ID=<CloudBase 环境 ID>
CLOUDBASE_AI_API_KEY=<CloudBase AI Gateway Key>
MODEL_API_URL=https://<ENV_ID>.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completions
HUNYUAN_MODEL=hy3
DATABASE_URL=<腾讯云 PostgreSQL 或 CloudBase 数据库连接串>
```

小程序端只需要：

```text
wx.cloud.init({
  env: '<CLOUDBASE_ENV_ID>'
})
```

建议：

- 小程序端可以保留公开的 `CLOUDBASE_ENV_ID`。
- 小程序端不能保留 `CLOUDBASE_AI_API_KEY`。
- 小程序端不能保留 `DATABASE_URL`。

## 7. 数据库如何连接

当前数据库层：

```text
server/database/connection.js
  configure(databaseClient)
  getClient()
  isConfigured()
  query(sql, params)
```

当前 repository 状态：

- `knowledgeRepository.js` 仍主要读取本地知识库数据。
- `knowledgeFeedbackRepository.js` 当前为 memory 存储。

最小数据库迁移路径：

### 第一步：反馈先入库

优先迁移：

```text
knowledge_feedback
```

原因：

- 用户反馈是新增生产数据。
- 不迁移会在云函数冷启动/重启后丢失。

需要改：

```text
server/repositories/knowledgeFeedbackRepository.js
server/database/connection.js
cloudfunctions/api/index.js 初始化数据库 client
```

### 第二步：日志入库或接 CLS

迁移：

```text
server/services/loggerService.js
```

方案：

- 轻量：写数据库 `request_logs`、`error_logs`。
- 更推荐：接腾讯云 CLS。

### 第三步：知识库迁云

迁移：

```text
knowledge_terms
```

需要改：

```text
server/repositories/knowledgeRepository.js
utils/knowledgeLoader.js 或直接绕过本地 loader
```

注意：

- 这一步不是上线前最小改动必须项。
- 当前可先把 `utils/knowledgeData.js` 随云函数部署，继续本地知识库查询。

## 8. 推荐部署结构

推荐保留仓库结构：

```text
miniprogram/
  pages/
  utils/
  assets/
  app.js
  app.json

server/
  api.js
  services/
  repositories/
  prompts/
  database/
  models/

cloudfunctions/
  api/
    index.js
    package.json

config/
  env.js
```

当前项目没有 `miniprogram/` 子目录，最小改动可以先不移动目录，只通过 `project.config.json` 忽略 `server/`、`config/`。

更干净的长期方案：

```text
miniprogramRoot: miniprogram/
cloudfunctionRoot: cloudfunctions/
```

但这会涉及目录调整，不属于最小改动。

## 9. 最小改动清单

必须新增：

```text
cloudfunctions/api/index.js
cloudfunctions/api/package.json
```

必须修改：

```text
utils/api.js
project.config.json
app.js
```

修改说明：

- `utils/api.js`：从直接 require `server/api.js` 改为 `wx.cloud.callFunction`。
- `project.config.json`：忽略 `server/`、`config/`，配置云函数目录。
- `app.js`：初始化 `wx.cloud.init()`。

可暂不修改：

```text
pages/
server/api.js
server/services/explainService.js
server/services/knowledgeService.js
server/services/hunyuanService.js
data/knowledge/terms.json
utils/knowledgeData.js
```

## 10. 迁移后验证清单

必须验证：

1. 小程序上传包不包含：
   - `server/`
   - `config/`
   - `CLOUDBASE_AI_API_KEY`
   - `DATABASE_URL`
2. 云函数 `api` 可调用：
   - `explain`
   - `search`
   - `knowledgeFeedback`
   - `knowledgeVersion`
   - `health`
3. 输入 `API`：
   - 返回 `source=knowledge`
   - 不调用 hy3
4. 输入 `为什么AI会忘记聊天？`：
   - 返回 `source=llm`
   - 真实调用 CloudBase AI Gateway
   - `isMock=false`
5. 反馈提交：
   - 匿名可提交
   - 返回 `success=true`
   - 后续接库后能持久化
6. 健康检查：
   - `hunyuan=configured`
   - `database=configured`，如果数据库已接入

## 11. 推荐迁移顺序

```text
1. 新增 cloudfunctions/api 云函数入口
2. 云函数内 require server/api.js
3. 在 CloudBase 控制台配置环境变量
4. 小程序 app.js 初始化 wx.cloud
5. utils/api.js 改为 wx.cloud.callFunction
6. project.config.json 排除 server/config
7. 本地开发者工具验证 API/Phi/Claude/长问题
8. 验证上传包内无 server/config/密钥
9. 再提交微信审核
```

## 12. 最小方案结论

最小改动迁移方案：

```text
不重构业务服务
不改页面
不改 explainService
不改 hunyuanService
只新增云函数入口
只切换 utils/api.js 到云函数调用
只把密钥迁到 CloudBase 云端环境变量
只从小程序包排除 server/config
```

这样可以最快解决当前核心问题：

```text
server 代码进入客户端
真实 CloudBase AI Key 存在泄露风险
```

完成该迁移前，不建议提交微信审核。
