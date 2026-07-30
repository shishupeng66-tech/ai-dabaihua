# AI大白话 CloudBase 云函数部署前检查

检查时间：2026-07-30

本次只检查 `cloudfunctions/api/`，未修改业务逻辑。

## 结论

`cloudfunctions/api/` 当前具备部署到 CloudBase 后运行的基础条件。

需要注意：

- 本地检查环境未配置 `CLOUDBASE_AI_API_KEY`，所以长问题 LLM 兜底返回 `isMock=true`。
- 部署到 CloudBase 后必须配置云函数环境变量，并复测长问题返回 `isMock=false`。
- 云函数 `package.json` 声明 Node `>=18`，CloudBase 运行环境需要选择 Node 18 或更高版本。

## 1. 云函数入口 index.js

入口文件：

```text
cloudfunctions/api/index.js
```

入口导出：

```js
exports.main = async function main(event) {}
```

支持 action：

| action | 分发目标 |
| --- | --- |
| `explain` | `serverApi.postExplain(payload)` |
| `search` | `serverApi.getSearch(payload)` |
| `knowledgeVersion` | `serverApi.getKnowledgeVersion()` |
| `knowledgeFeedback` | `serverApi.postKnowledgeFeedback(payload)` |
| `health` | `serverApi.getHealth()` |

错误兜底：

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": ""
  }
}
```

检查结论：

- 入口存在。
- `exports.main` 存在。
- action 分发完整。
- 异常会被捕获并返回 JSON。

## 2. server/api.js 依赖

云函数内使用：

```js
const serverApi = require('./server/api.js')
```

已检查 `cloudfunctions/api/server/api.js` 存在。

`server/api.js` 依赖：

```text
./services/explainService.js
./services/knowledgeService.js
./services/loggerService.js
./services/healthService.js
./services/knowledgeFeedbackService.js
```

检查结论：

- 依赖文件均存在。
- 相对路径可解析。
- 大小写检查通过。

## 3. services 目录依赖

涉及服务：

```text
server/services/explainModeService.js
server/services/explainService.js
server/services/healthService.js
server/services/hunyuanService.js
server/services/knowledgeFeedbackService.js
server/services/knowledgeService.js
server/services/loggerService.js
```

关键依赖：

```text
server/services/explainService.js
  -> knowledgeService
  -> hunyuanService
  -> explainModeService

server/services/hunyuanService.js
  -> config/env.js
  -> server/prompts/*

server/services/knowledgeService.js
  -> server/repositories/knowledgeRepository.js

server/repositories/knowledgeRepository.js
  -> utils/knowledge.js
  -> utils/knowledgeLoader.js
  -> data/knowledge/terms.json
```

检查结论：

- service 依赖链完整。
- prompt 文件存在。
- repository 文件存在。
- 云函数内知识库 loader 已指向 `cloudfunctions/api/data/knowledge/terms.json`。

## 4. package.json

文件：

```text
cloudfunctions/api/package.json
```

内容检查：

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

检查结论：

- `main=index.js` 正确。
- 无外部 npm 依赖。
- Node 版本要求明确。

## 5. node_modules 依赖

检查结果：

```text
cloudfunctions/api/node_modules 不存在
```

结论：

- 当前云函数不依赖第三方 npm 包。
- 不需要上传 `node_modules`。
- CloudBase 部署时无需 `npm install` 额外依赖。

注意：

- `hunyuanService.js` 在服务端环境使用 `fetch`。
- 因此 CloudBase 运行环境需要 Node 18+。

## 6. 文件路径大小写

执行大小写敏感 require 检查：

```json
{
  "checkedJs": 23,
  "problems": []
}
```

结论：

- 未发现 require 路径大小写错误。
- 未发现本地 Windows 可运行、Linux/CloudBase 不可运行的路径大小写问题。

## 7. 云函数包体

估算：

```json
{
  "bytes": 861286,
  "mb": 0.82,
  "fileCount": 26
}
```

最大文件：

```text
cloudfunctions/api/data/knowledge/terms.json         826998 bytes
cloudfunctions/api/server/services/hunyuanService.js   6228 bytes
cloudfunctions/api/utils/knowledge.js                  5138 bytes
cloudfunctions/api/server/api.js                       2714 bytes
```

结论：

- 云函数部署包体较小。
- 最大占用来自知识库 `terms.json`，当前可接受。

## 8. 模拟测试

执行：

```js
main({
  action: 'explain',
  data: { keyword }
})
```

测试结果：

```json
[
  {
    "keyword": "API",
    "success": true,
    "source": "knowledge",
    "matchType": "exact",
    "score": 100,
    "term": "API",
    "hasData": true
  },
  {
    "keyword": "Phi",
    "success": true,
    "source": "knowledge",
    "matchType": "exact",
    "score": 100,
    "term": "Phi",
    "hasData": true
  },
  {
    "keyword": "为什么AI会忘记聊天？",
    "success": true,
    "source": "llm",
    "matchType": "none",
    "score": 0,
    "term": "为什么AI会忘记聊天？",
    "hasData": true,
    "model": "hy3",
    "isMock": true
  }
]
```

判断：

- `API` 知识库命中正常。
- `Phi` 知识库命中正常。
- `为什么AI会忘记聊天？` 正常进入 LLM 兜底分支。
- 因本地未配置云函数环境变量，LLM 当前为 mock。

## 9. 部署到 CloudBase 前必须配置

云函数环境变量：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
HUNYUAN_MODEL=hy3
```

如果本阶段不接数据库：

```text
DATABASE_URL 可暂不配置
```

如果需要反馈持久化：

```text
DATABASE_URL 必须配置
```

## 10. 部署后必须复测

部署到 CloudBase 后复测：

```text
API -> success=true, source=knowledge
Phi -> success=true, source=knowledge
为什么AI会忘记聊天？ -> success=true, source=llm, isMock=false
```

同时检查：

```text
health.services.hunyuan=configured
```

如果仍为：

```text
hunyuan=mock
```

说明云函数环境变量没有生效。

## 11. 最终判断

部署前静态检查：通过。

本地模拟运行：通过。

CloudBase 真实模型调用：未验证。

是否可以部署到 CloudBase 测试环境：

```text
可以
```

是否可以直接作为生产审核版本：

```text
需要先完成 CloudBase 环境变量配置并复测 isMock=false
```
