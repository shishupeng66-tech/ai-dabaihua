# AI黑话翻译器 CloudBase 云函数 api 生产部署报告

执行时间：2026-07-30

项目路径：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

## 1. 当前架构

当前目标架构：

```text
微信小程序
  ↓
wx.cloud.callFunction({ name: "api" })
  ↓
cloudfunctions/api
  ↓
server/api.js
  ↓
explainService
  ↓
knowledge / Hunyuan
```

当前小程序端：

- `utils/api.js` 已通过 `wx.cloud.callFunction` 调用 `api` 云函数。
- 未继续直接 `require('../server/api.js')`。
- `project.config.json` 已排除 `server/`、`config/`、`data/knowledge`、`utils/knowledgeData.js` 进入小程序包。

## 2. 云函数结构检查

检查目录：

```text
cloudfunctions/
  api/
    index.js
    package.json
    server/
    config/
    data/
    utils/
```

检查结果：

```text
通过
```

关键文件：

```text
cloudfunctions/api/index.js
cloudfunctions/api/package.json
cloudfunctions/api/server/api.js
cloudfunctions/api/config/env.js
cloudfunctions/api/data/knowledge/terms.json
```

## 3. 本次修改文件

```text
cloudfunctions/api/index.js
```

修改内容：

将云函数入口从：

```js
exports.main = async function main(event) {}
```

调整为：

```js
exports.main = async function main(event, context) {}
```

目的：

- 明确符合 CloudBase 云函数入口签名。
- 不改变业务逻辑。

## 4. package.json 检查

文件：

```text
cloudfunctions/api/package.json
```

当前内容：

```json
{
  "name": "ai-dabaihua-api",
  "version": "1.0.0",
  "main": "index.js",
  "private": true,
  "engines": {
    "node": ">=18"
  },
  "dependencies": {}
}
```

检查结果：

- `name` 存在。
- `main=index.js` 正确。
- Node 版本要求为 `>=18`。
- 无外部 npm 依赖。
- 不需要上传 `node_modules`。

## 5. 微信小程序云开发配置检查

### project.config.json

当前已配置：

```json
{
  "cloudfunctionRoot": "cloudfunctions/"
}
```

检查结果：

```text
通过
```

### app.js

当前：

```js
wx.cloud.init({
  traceUser: true
})
```

检查结果：

- `wx.cloud.init()` 存在。
- `traceUser: true` 合理。
- 当前没有显式配置 `env`。

说明：

我没有随意填写 `env`，因为必须绑定到你 CloudBase 成长计划混元 Token 所属的真实环境。

当前应该绑定的环境：

```text
应绑定到 CloudBase 小程序成长计划赠送混元 Token 所属环境。
```

如果你之前提供的 CloudBase AI Key 所属环境仍是当前项目环境，则环境 ID 很可能是：

```text
cloudbase-d6goo5p9xq9313bb93
```

但生产部署前必须以微信开发者工具「云开发」面板或 CloudBase 控制台显示的环境 ID 为准。

## 6. 云函数识别问题排查

### 是否是标准云函数目录

当前目录：

```text
cloudfunctions/api
```

并且 `project.config.json` 配置：

```text
cloudfunctionRoot=cloudfunctions/
```

因此 `api` 应被微信开发者工具识别为云函数。

### 如果右键没有“上传并部署：所有文件”

优先排查：

1. 微信开发者工具是否打开的是：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

2. 左侧资源管理器是否能看到：

```text
cloudfunctions/api
```

3. 是否右键的是：

```text
api
```

而不是 `cloudfunctions` 根目录或普通文件。

4. 修改 `project.config.json` 后是否重启过微信开发者工具。

5. 是否已开通云开发并选择 CloudBase 环境。

明确解决方案：

```text
关闭并重新打开微信开发者工具
  ↓
重新打开项目 C:/Users/Administrator/workbuddy-ai/AI大白话
  ↓
确认左侧 cloudfunctions/api 显示为云函数目录
  ↓
右键 api
  ↓
选择“上传并部署：所有文件”
```

## 7. 实际部署尝试

本机检查到：

```text
D:/微信web开发者工具/cli.bat
```

已尝试执行：

```text
D:/微信web开发者工具/cli.bat cloud env list --project C:/Users/Administrator/workbuddy-ai/AI大白话 --port 3799
```

结果：

```text
IDE service port disabled.
工具的服务端口已关闭。
请手动打开工具 -> 设置 -> 安全设置，将服务端口开启。
```

因此：

```text
云函数生产部署未完成。
```

阻断原因不是代码问题，而是微信开发者工具安全设置阻止 CLI 调用。

## 8. CloudBase 云函数状态

本地项目状态：

```text
cloudfunctions/api 已准备好部署
```

CloudBase 控制台状态：

```text
无法通过 CLI 查询
```

原因：

```text
微信开发者工具服务端口关闭
```

是否确认 CloudBase 云函数列表已出现 `api`：

```text
尚未确认
```

## 9. 当前可执行测试

本地云函数模拟测试：

```json
{
  "results": [
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
  ],
  "health": {
    "status": "ok",
    "version": "2.0.0",
    "services": {
      "database": "mock",
      "hunyuan": "mock",
      "cache": "memory"
    }
  }
}
```

说明：

- `API`、`Phi`、`Claude` 知识库命中正常。
- 长问题进入 LLM 兜底分支。
- 本地未配置真实 CloudBase 环境变量，所以 `isMock=true`。

## 10. 生产环境变量配置方案

需要在 CloudBase 云函数 `api` 的环境变量里手动填写：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
HUNYUAN_MODEL
```

建议值：

```text
HUNYUAN_MODEL=hy3
MODEL_API_URL=https://<CLOUDBASE_ENV_ID>.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completions
```

不要写入代码：

```text
CLOUDBASE_AI_API_KEY
DATABASE_URL
```

如果当前阶段不接数据库：

```text
DATABASE_URL 可以暂时不填
```

如果要持久化反馈、日志、搜索记录：

```text
DATABASE_URL 必须在云函数环境变量中填写
```

## 11. 需要你手动执行的部分

### 必须手动操作 1：打开微信开发者工具服务端口

路径：

```text
微信开发者工具
  ↓
设置
  ↓
安全设置
  ↓
服务端口
  ↓
开启
```

开启后告诉我：

```text
服务端口已开启
```

我就可以继续执行 CLI 部署。

### 必须手动操作 2：确认 CloudBase 环境 ID

在微信开发者工具：

```text
云开发
  ↓
环境
```

确认环境 ID。

需要确认它是否为：

```text
cloudbase-d6goo5p9xq9313bb93
```

如果不是，请把真实环境 ID 发我。

### 必须手动操作 3：配置云函数环境变量

在 CloudBase 控制台或微信开发者工具云开发面板中，为 `api` 云函数配置：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
HUNYUAN_MODEL=hy3
```

不要把 Key 发到代码里。

## 12. 服务端口开启后我将执行的命令

确认服务端口开启、环境 ID 正确后，我会执行：

```text
D:/微信web开发者工具/cli.bat cloud env list --project C:/Users/Administrator/workbuddy-ai/AI大白话 --port 3799
```

然后部署：

```text
D:/微信web开发者工具/cli.bat cloud functions deploy --project C:/Users/Administrator/workbuddy-ai/AI大白话 --env <CLOUDBASE_ENV_ID> --names api --port 3799
```

如果 `--names` 在当前工具版本异常，则使用路径部署：

```text
D:/微信web开发者工具/cli.bat cloud functions deploy --project C:/Users/Administrator/workbuddy-ai/AI大白话 --env <CLOUDBASE_ENV_ID> --paths C:/Users/Administrator/workbuddy-ai/AI大白话/cloudfunctions/api --port 3799
```

部署后查询：

```text
D:/微信web开发者工具/cli.bat cloud functions list --project C:/Users/Administrator/workbuddy-ai/AI大白话 --env <CLOUDBASE_ENV_ID> --port 3799
```

目标：

```text
CloudBase 云函数列表出现 api
```

## 13. 部署后测试计划

### 测试 1：知识库命中

输入：

```text
API
```

期望：

```json
{
  "success": true,
  "source": "knowledge"
}
```

### 测试 2：LLM 兜底

输入：

```text
为什么AI会忘记聊天？
```

期望：

```json
{
  "success": true,
  "source": "llm",
  "data": {
    "isMock": false
  }
}
```

如果仍然是：

```json
{
  "isMock": true
}
```

说明：

```text
CLOUDBASE_AI_API_KEY 没有在云函数环境变量中生效。
```

## 14. 是否可以提交微信审核

当前结论：

```text
暂不可以。
```

原因：

1. `api` 云函数尚未确认部署到 CloudBase。
2. `hunyuan=mock`，真实 hy3 调用未验证。
3. 云函数环境变量尚未确认。

满足以下条件后可以进入审核前最终检查：

```text
CloudBase 云函数列表出现 api
API -> source=knowledge
为什么AI会忘记聊天？ -> source=llm 且 isMock=false
小程序端真机预览可正常调用 api 云函数
```

## 15. 当前状态摘要

已完成：

- 云函数目录结构检查。
- `index.js` 入口签名修复。
- `package.json` 检查。
- `project.config.json` 检查。
- `app.js` 云开发初始化检查。
- 本地 action=explain 模拟测试。
- 微信开发者工具 CLI 部署能力检查。

未完成：

- 真实部署到 CloudBase。
- CloudBase 函数列表确认 `api`。
- 真实 `isMock=false` 测试。

当前阻塞：

```text
微信开发者工具服务端口关闭，需要你手动开启。
```
