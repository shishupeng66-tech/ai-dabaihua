# AI大白话生产环境密钥安全检查报告

检查时间：2026-07-30

本次只检查密钥安全，不修改代码。

## 结论

存在密钥泄露风险。

当前仓库中没有发现真实 `HUNYUAN_API_KEY`、`CLOUDBASE_AI_API_KEY`、`DATABASE_URL`、数据库连接串或 JWT 明文。

但是当前小程序端代码会直接引用并打包 `server/api.js`、`server/services/hunyuanService.js`、`config/env.js` 等服务端文件。如果生产环境把真实 `CLOUDBASE_AI_API_KEY` 注入到小程序运行环境，或把带真实配置的文件放入前端包，就会产生密钥泄露风险。

## 1. 小程序端密钥明文检查

检查范围：

```text
pages/
app.js
utils/
project.config.json
server/
config/
```

检查关键词：

```text
HUNYUAN_API_KEY
CLOUDBASE_AI_API_KEY
DATABASE_URL
MODEL_API_URL
CLOUDBASE_ENV_ID
Authorization
Bearer
eyJ
postgres://
mysql://
mongodb://
password
secret
```

结果：

- `pages/`：未发现密钥字段或明文。
- `app.js`：未发现密钥字段或明文。
- `utils/`：未发现密钥明文，但 `utils/api.js` 直接引用 `server/api.js`。
- `project.config.json`：未发现密钥字段或明文。
- `server/`：存在环境变量引用和 `Authorization` 拼接逻辑，但未发现真实密钥值。
- `config/env.js`：只读取运行时环境变量，未写死真实值。

## 2. 发现的敏感引用

`config/env.js`：

```js
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
DATABASE_URL
HUNYUAN_MODEL
```

`server/services/hunyuanService.js`：

```js
Authorization: `Bearer ${env.CLOUDBASE_AI_API_KEY}`
url: env.MODEL_API_URL
```

`server/database/connection.js`：

```js
env.DATABASE_URL
```

`server/services/healthService.js`：

```js
database: env.DATABASE_URL ? 'configured' : 'mock'
hunyuan: env.CLOUDBASE_AI_API_KEY ? 'configured' : 'mock'
```

说明：

- 这些不是明文密钥。
- 风险来自它们是否会被打进小程序端包，以及生产环境是否会把真实值暴露给前端。

## 3. 小程序端是否包含服务端代码

当前 `utils/api.js` 第一行：

```js
const serverApi = require('../server/api.js')
```

由此形成的前端引用链：

```text
pages/index or pages/result
↓
utils/api.js
↓
server/api.js
↓
server/services/explainService.js
↓
server/services/hunyuanService.js
↓
config/env.js
```

按当前 `project.config.json` 的上传包忽略规则检查，以下目录会进入小程序包：

```text
server/
config/
utils/
```

当前未被忽略：

```json
{
  "serverIncluded": true,
  "configIncluded": true
}
```

结论：

- `server/api.js` 当前不是只能运行在服务端。
- 它被小程序端 `utils/api.js` 直接 require。
- 按现有结构，`server/` 更像“小程序本地 mock 服务层”，不是隔离的真实服务端。

## 4. server/api.js 是否只能运行在服务端

检查结果：否。

原因：

1. `server/api.js` 没有服务端运行环境保护。
2. `server/api.js` 没有 Node/CloudBase 云函数入口隔离。
3. `utils/api.js` 直接 require 它。
4. `project.config.json` 没有忽略 `server/`。
5. `hunyuanService.js` 同时支持 `wx.request` 和 `fetch`，说明它可以在小程序端路径下被执行。

当前风险：

- 如果生产 Key 以任何方式进入小程序端运行时，用户可能通过反编译或调试拿到调用链。
- 即使当前代码没有明文 Key，也不能把真实密钥依赖部署在小程序前端。

## 5. 云数据库连接信息检查

未发现以下明文：

```text
postgres://
mysql://
mongodb://
真实 DATABASE_URL
数据库用户名
数据库密码
```

当前只发现：

```js
DATABASE_URL: runtimeEnv.DATABASE_URL || ''
```

结论：

- 当前仓库未发现数据库连接信息明文泄露。
- 但 `config/env.js` 会进入小程序包，生产环境不能在前端注入真实 `DATABASE_URL`。

## 6. HUNYUAN_API_KEY 检查

结果：

- 未发现 `HUNYUAN_API_KEY` 明文。
- 当前项目使用的是 `CLOUDBASE_AI_API_KEY` 命名。

结论：

- 未发现独立混元 API Key 泄露。

## 7. CLOUDBASE_AI_API_KEY 检查

结果：

- 未发现真实 `CLOUDBASE_AI_API_KEY` 明文。
- 发现环境变量引用和 Authorization 使用位置。

风险：

- 如果当前结构直接发布，并在小程序端设置真实 `CLOUDBASE_AI_API_KEY`，则存在泄露风险。
- CloudBase AI Key 必须只存在于云函数、云托管、服务端环境变量中。

## 8. 项目配置检查

`project.config.json` 当前已忽略：

```text
docs
tests
database
tools
data/knowledge
设计素材包
```

但未忽略：

```text
server
config
```

结论：

- 当前上传包会包含服务端目录和环境配置读取代码。
- 这不等于已经泄露真实密钥，但不符合生产密钥隔离要求。

## 9. 最终判断

是否存在密钥明文泄露：

```text
未发现
```

是否存在密钥泄露风险：

```text
存在
```

风险等级：

```text
高
```

原因：

1. 小程序端直接引用 `server/api.js`。
2. `server/` 和 `config/` 当前会进入小程序上传包。
3. `hunyuanService.js` 包含 CloudBase AI Gateway 请求逻辑和 Authorization 拼接逻辑。
4. 当前架构不能保证真实 `CLOUDBASE_AI_API_KEY` 只在服务端存在。

## 10. 发布前必须处理

提交微信审核前，必须满足以下条件之一：

### 方案 A：真实服务端方案

推荐。

- 将 `server/` 部署到 CloudBase 云函数或云托管。
- 小程序端 `utils/api.js` 改为请求云函数或 HTTPS API。
- `CLOUDBASE_AI_API_KEY`、`DATABASE_URL` 只配置在 CloudBase 服务端环境变量。
- 小程序包不包含 `server/` 和真实密钥。

### 方案 B：纯本地知识库版

仅适合不启用 LLM 兜底。

- 小程序端只保留本地知识库查询。
- 禁用或移除前端直接调用 CloudBase AI Gateway 的能力。
- 不在小程序端配置任何模型 API Key。

当前状态不建议直接提交审核。
