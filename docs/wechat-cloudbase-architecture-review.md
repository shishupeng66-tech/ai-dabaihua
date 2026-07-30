# AI黑话翻译器微信小程序 CloudBase 生态架构验收报告

检查时间：2026-07-30

本次只检查并生成报告，未修改代码。

## 最终结论

当前项目已经完成从“小程序直接引用 server/api.js”到“小程序调用 CloudBase 云函数”的第一阶段迁移，基础架构方向符合微信小程序 + CloudBase 推荐架构。

但当前还没有完全达到生产最佳实践。

主要原因：

1. 云函数本地健康检查仍显示 `hunyuan=mock`，未验证真实腾讯混元调用。
2. 云函数本地健康检查仍显示 `database=mock`，反馈、日志、搜索记录、模型用量没有持久化到 CloudBase 数据库。
3. `app.js` 中 `wx.cloud.init()` 没有显式配置 `env`，依赖开发者工具或默认环境；生产建议显式指定环境 ID。

结论：

```text
部分符合微信生态最佳实践，但未达到完整生产架构。
```

## 一、小程序端检查

### 1. app.js

当前代码：

```js
if (wx.cloud) {
  wx.cloud.init({
    traceUser: true
  })
}
```

检查结果：

- 已调用 `wx.cloud.init()`。
- `traceUser: true` 合理，可以用于云开发用户追踪和排查。
- 未配置显式 `env`。

评估：

- 开发阶段可运行。
- 生产建议显式配置 CloudBase 环境 ID，避免多环境时误连默认环境。

建议：

```js
wx.cloud.init({
  env: '正式环境ID',
  traceUser: true
})
```

### 2. utils/api.js

当前调用方式：

```js
wx.cloud.callFunction({
  name: 'api',
  data: {
    action,
    data
  }
})
```

检查结果：

- 已通过 `wx.cloud.callFunction` 调用云函数。
- 未发现继续直接调用 `../server/api.js`。
- 页面仍通过原有 `api.explainTerm()`、`api.search()` 等函数调用，页面层未被破坏。

结论：

```text
通过
```

### 3. project.config.json

当前配置：

```json
{
  "cloudfunctionRoot": "cloudfunctions/"
}
```

已排除前端上传包：

```text
server
config
data/knowledge
utils/knowledge.js
utils/knowledgeLoader.js
utils/knowledgeData.js
utils/knowledgeVersionData.js
cloudfunctions/
```

前端包隔离检查：

```json
{
  "includedMB": 0.43,
  "includedFileCount": 27,
  "includesServer": false,
  "includesConfig": false,
  "includesCloudfunctions": false,
  "includesDataKnowledge": false,
  "includesKnowledgeData": false
}
```

结论：

- `cloudfunctionRoot` 已配置。
- 服务端代码不进入小程序包。
- 配置代码不进入小程序包。
- 知识库完整数据不进入小程序包。

```text
通过
```

## 二、云函数检查

检查目录：

```text
cloudfunctions/api/
```

### 1. CloudBase 云函数结构

当前结构：

```text
cloudfunctions/api/
  index.js
  package.json
  config/env.js
  data/knowledge/terms.json
  data/knowledge/version.json
  server/**
  utils/knowledge.js
  utils/knowledgeLoader.js
```

检查结果：

- 目录符合 CloudBase 云函数基本结构。
- `package.json` 存在。
- `index.js` 存在。
- 业务依赖文件已包含在云函数目录内。

### 2. index.js 入口

当前入口：

```js
exports.main = async function main(event) {}
```

结论：

```text
通过
```

### 3. action 分发

支持 action：

| action | 目标 |
| --- | --- |
| `explain` | 解释接口 |
| `search` | 搜索推荐 |
| `knowledgeVersion` | 知识库版本 |
| `knowledgeFeedback` | 知识反馈 |
| `health` | 健康检查 |

结论：

```text
通过
```

### 4. 是否适合微信小程序调用

小程序端调用：

```js
wx.cloud.callFunction({
  name: 'api',
  data: {
    action,
    data
  }
})
```

云函数端接收：

```js
event.action
event.data
```

结论：

```text
适合
```

### 5. 云函数 package

检查结果：

```json
{
  "main": "index.js",
  "engines": {
    "node": ">=18"
  },
  "dependencyCount": 0,
  "hasNodeModules": false
}
```

结论：

- 无第三方 npm 依赖。
- 不需要上传 `node_modules`。
- 需要 CloudBase 选择 Node 18+ 环境，因为 `hunyuanService` 在服务端使用 `fetch`。

## 三、服务端检查

### 1. 是否全部运行在云函数环境

当前：

- 小程序端不再直接 require `server/api.js`。
- 小程序包不包含 `server/`。
- 云函数目录内包含 `server/` 部署副本。

结论：

```text
从小程序运行视角看，server 已迁到云函数环境。
```

注意：

- 当前存在根目录 `server/` 和 `cloudfunctions/api/server/` 两份代码。
- 后续如果修改服务端逻辑，需要保持同步，或进一步设计共享服务端目录/构建脚本。

### 2. 是否读取云端环境变量

云函数内：

```js
const runtimeEnv = typeof process !== 'undefined' && process.env ? process.env : {}
```

读取：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
DATABASE_URL
HUNYUAN_MODEL
```

结论：

```text
读取方式符合云函数环境变量模式。
```

当前健康检查：

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

说明：

- 当前本地没有配置真实云函数环境变量。
- 部署后必须在 CloudBase 控制台配置环境变量。

### 3. 是否存在前端泄露风险

当前前端包检查：

```json
{
  "includesServer": false,
  "includesConfig": false,
  "includesCloudfunctions": false,
  "includesDataKnowledge": false,
  "includesKnowledgeData": false
}
```

结论：

```text
当前小程序包层面已消除 server/config/密钥逻辑进入前端的主要风险。
```

剩余风险：

- 不要在小程序端任何文件中写入 `CLOUDBASE_AI_API_KEY`。
- 不要在小程序端配置 `DATABASE_URL`。
- 生产环境 ID 可公开，但模型 Key 和数据库连接串必须只在云函数环境变量中。

## 四、数据库规划

### 当前数据位置

| 数据 | 当前状态 | 是否适合当前阶段 |
| --- | --- | --- |
| `knowledge` | 云函数内 JSON：`cloudfunctions/api/data/knowledge/terms.json` | 第一阶段可接受 |
| `feedback` | memory：`feedbackRecords = []` | 不适合生产 |
| `searchLog` | memory：`requestLogs = []` 或未独立建表 | 不适合生产 |
| `modelUsage` | 当前未持久化 | 不适合生产 |
| `errorLog` | memory：`errorLogs = []` | 不适合生产 |

### 推荐存储方案

#### knowledge

短期：

```text
cloudfunctions/api/data/knowledge/terms.json
```

适用：

- 知识库还不频繁更新。
- 内容发布流程还未上线。

中长期：

```text
CloudBase 数据库 collection: knowledge_terms
CloudBase 云存储: 批量导入 JSON/Excel 原始文件
```

建议：

- 正式内容查询放 CloudBase 数据库。
- 批量导入源文件放云存储。
- 用 `version` 字段做客户端/服务端缓存控制。

#### feedback

必须迁移到 CloudBase 数据库：

```text
collection: knowledge_feedback
```

字段：

```text
term
section
exampleIndex
feedbackType
openid
createdAt
```

原因：

- 点赞/踩是产品迭代依据。
- memory 在云函数冷启动、扩缩容、重启后会丢失。

#### searchLog

建议迁移到 CloudBase 数据库：

```text
collection: search_logs
```

字段：

```text
keyword
source
hit
term
openid
createdAt
```

用于：

- 发现用户真实需求。
- 发现缺失词。
- 支撑 AI 自动补词。

#### modelUsage

建议迁移到 CloudBase 数据库：

```text
collection: model_usage
```

字段：

```text
keyword
model
inputTokens
outputTokens
totalTokens
isMock
createdAt
```

用于：

- 成本控制。
- 判断哪些问题频繁触发混元。
- 后续缓存策略优化。

#### 内容审核

建议新增：

```text
collection: pending_terms
collection: review_logs
```

用于：

- AI 自动补词生成草稿。
- 人工审核后进入正式知识库。

## 五、微信生态最佳实践评估

目标架构：

```text
微信小程序
  ↓
CloudBase 云函数
  ↓
CloudBase 数据库
  ↓
CloudBase 云存储
  ↓
腾讯混元
```

当前符合项：

| 项目 | 当前状态 | 评价 |
| --- | --- | --- |
| 微信小程序 | 已有 pages/app/utils | 符合 |
| CloudBase 云函数 | 已有 `cloudfunctions/api` | 基本符合 |
| CloudBase 数据库 | 有连接规划，无真实接入 | 不完整 |
| CloudBase 云存储 | 未使用 | 可后置 |
| 腾讯混元 | 有 CloudBase AI Gateway 调用封装 | 待真实环境验证 |
| 密钥隔离 | 前端包已排除 server/config | 基本符合 |
| 用户身份 | `traceUser=true`，未显式 openid 处理 | 不完整 |
| 生产日志 | memory logs | 不完整 |

综合评价：

```text
当前达到 CloudBase 迁移第一阶段标准；
尚未达到完整生产最佳实践。
```

## 六、当前上线阻塞问题

阻塞问题：

1. `hunyuan=mock`：未验证真实腾讯混元调用。
2. `database=mock`：用户反馈、搜索日志、模型用量没有持久化。
3. `wx.cloud.init()` 未显式配置 `env`，生产多环境下有误连风险。

非阻塞但建议处理：

1. 根目录 `server/` 与 `cloudfunctions/api/server/` 存在双份代码，后续维护有同步风险。
2. `knowledge` 仍是 JSON 文件，适合第一阶段，不适合高频内容运营。
3. `CloudBase 云存储` 暂未用于内容导入、审核素材和批量文件管理。

## 七、推荐下一步操作

### 立即处理

1. 在 `app.js` 显式配置 CloudBase 正式环境 ID。
2. 在 CloudBase 云函数控制台配置：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
HUNYUAN_MODEL=hy3
```

3. 部署 `cloudfunctions/api`。
4. 复测：

```text
API -> source=knowledge
Phi -> source=knowledge
Claude -> source=knowledge
MCP -> source=knowledge
为什么AI会忘记聊天？ -> source=llm, isMock=false
```

### 上线前处理

1. 将 `knowledge_feedback` 接入 CloudBase 数据库。
2. 将搜索日志接入 CloudBase 数据库。
3. 将模型调用用量接入 CloudBase 数据库。
4. 将错误日志接入 CloudBase 数据库或腾讯云 CLS。

### 后续产品化

1. 知识库迁移到 `knowledge_terms` collection。
2. 批量导入文件放 CloudBase 云存储。
3. 建立 `pending_terms` + `review_logs` 内容审核流程。
4. 为 AI 自动补词建立人工审核闭环。

## 八、最终判断

### 1. 是否符合微信生态最佳实践

```text
部分符合。
```

已符合：

- 小程序通过 `wx.cloud.callFunction` 访问云函数。
- 服务端代码不再进入小程序包。
- 云函数入口和 action 分发已经建立。
- 混元调用逻辑位于云函数侧。

未完全符合：

- 数据库仍未接入。
- 混元真实调用未在 CloudBase 环境验证。
- 日志、反馈、模型用量仍是 memory/mock。
- 未使用 CloudBase 云存储管理内容导入资产。

### 2. 当前上线阻塞问题

```text
不建议直接上线。
```

阻塞：

1. `hunyuan=mock`
2. `database=mock`
3. `wx.cloud.init` 未显式指定生产环境 ID

### 3. 推荐下一步

优先级最高：

```text
部署云函数 -> 配置 CloudBase AI Key -> 复测 isMock=false
```

然后：

```text
接入 CloudBase 数据库保存 feedback/searchLog/modelUsage
```

完成以上后，再提交微信审核。
