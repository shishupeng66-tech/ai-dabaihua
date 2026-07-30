# AI大白话小程序上线前项目清理报告

检查时间：2026-07-30

本次目标是上线前整理，不做业务重构。已直接处理低风险项：删除普通调试日志、优化小程序上传包排除规则。未删除业务文件、知识库内容、AI 调用流程。

## 1. 删除文件列表

本次未直接删除文件。

工作区检查时已存在一个删除状态文件：

```text
AI大白话前端插图组件素材包.zip
```

该删除状态不是本次清理操作产生的，本次未恢复、未继续处理。

原因：

- `assets/home/hero-bubble-white.png` 当前未被页面引用，但属于首页/结果页同一套素材，删除收益只有约 `23KB`，上线稳定性优先，建议确认后再删。
- `data/knowledge/terms.backup-before-AI-model-import.json`、`data/knowledge/imports/`、知识库扩展 JSON 属于导入过程文件，已通过 `project.config.json` 排除上传包，不影响包体。建议后续归档或迁移到仓库外备份。
- `tools/`、`docs/`、`database/` 已在上传包中忽略，不影响小程序包体。

建议删除或归档列表：

| 类型 | 路径 | 建议 |
| --- | --- | --- |
| 未使用图片 | `assets/home/hero-bubble-white.png` | 确认设计不再使用后删除 |
| 导入备份 | `data/knowledge/terms.backup-before-AI-model-import.json` | 移到仓库外或保留但继续忽略上传 |
| 导入批次 | `data/knowledge/imports/` | 移到 `docs/archive` 或仓库外 |
| 导入中间文件 | `data/knowledge/AI大白话知识库扩展_01_AI模型生态_01.json` 到 `_10.json` | 移到归档目录或仓库外 |
| 历史报告 | `docs/archive/` | 已忽略上传，可保留 |

## 2. 修改文件列表

| 文件 | 修改内容 | 是否影响业务逻辑 |
| --- | --- | --- |
| `app.js` | 删除启动时 `console.log` | 否 |
| `pages/result/result.js` | 删除结果页运行时排查 `console.log`，保留 `console.error` | 否 |
| `project.config.json` | 增加 `data/knowledge` 上传包忽略规则 | 否，运行时读取 `utils/knowledgeData.js` |
| `docs/pre-release-cleanup-report.md` | 新增本报告 | 否 |

## 3. 无用文件检查

### 未使用图片资源

检测到 `assets/home` 共 6 个图片资源：

```text
assets/home/hero-woman.png
assets/home/hero-robot.png
assets/home/hero-bubble-orange.png
assets/home/hero-bubble-white.png
assets/home/hero-coffee.png
assets/home/hero-shelf-plant.png
```

当前疑似未被页面引用：

```text
assets/home/hero-bubble-white.png
```

未直接删除，原因是该文件属于统一插画组件包，删除收益小，误删后可能影响后续 UI 调整。

### 未引用组件

当前小程序页面没有发现自定义组件引用问题。页面四件套均存在：

```text
pages/index/index
pages/result/result
pages/simpleExplain/simpleExplain
```

### 未使用 JS 文件

未直接删除 JS 文件。

说明：

- `tools/importKnowledge.js`、`tools/knowledgeQualityCheck.js` 是知识库维护工具，已被上传包忽略。
- `server/database/repositoryFactory.js`、`server/models/*` 属于生产服务端预留结构，虽然小程序端当前不直接调用，但不建议在上线前临时删除。
- `utils/storage.js` 当前疑似未被主链路引用，但属于本地存储封装，删除前需要确认无历史页面或后续功能依赖。

### 测试、临时、备份、导入文件

发现备份/导入类文件：

```text
data/knowledge/terms.backup-before-AI-model-import.json
data/knowledge/imports/batch001.json
...
data/knowledge/imports/batch010.json
data/knowledge/AI大白话知识库扩展_01_AI模型生态_01.json
...
data/knowledge/AI大白话知识库扩展_01_AI模型生态_10.json
```

处理结果：

- 未删除。
- 已通过 `project.config.json` 的 `data/knowledge` 忽略规则排除出小程序上传包。

## 4. 小程序包体优化情况

优化前估算：

```json
{
  "includedMB": 2.12,
  "includedFileCount": 62
}
```

优化后估算：

```json
{
  "includedMB": 1.25,
  "includedFileCount": 51
}
```

主要变化：

- 上传包不再包含 `data/knowledge/terms.json`。
- 上传包不再包含 `data/knowledge` 下的备份、导入批次、扩展 JSON。
- 运行时仍使用 `utils/knowledgeData.js`，知识库命中链路不变。

当前最大包内文件：

```text
utils/knowledgeData.js                  827015 bytes
assets/home/hero-woman.png              175543 bytes
assets/home/hero-robot.png              122829 bytes
assets/home/hero-bubble-orange.png       30500 bytes
assets/home/hero-bubble-white.png        23288 bytes
```

剩余包体风险：

- `utils/knowledgeData.js` 仍有约 `827KB`，后续知识库继续增长时仍可能逼近主包限制。
- 最优生产方案是把知识库迁移到云端或独立分包/缓存同步，不再把完整词库打进主包。

## 5. 代码上线清理

已删除普通调试日志：

```text
app.js
pages/result/result.js
```

保留错误日志：

```text
pages/result/result.js console.error
utils/storage.js console.error
```

保留原因：

- 错误日志用于异常排查。
- 当前还没有统一生产日志 SDK，直接删除会降低排障能力。

复查结果：

- 未发现 `console.log`。
- 未发现 `debugger`。
- 未发现 `TODO/FIXME`。

## 6. 安全检查结果

检查关键词：

```text
API_KEY
SECRET
PASSWORD
DATABASE_URL
CLOUDBASE_AI_API_KEY
HUNYUAN_API_KEY
Bearer
eyJ
```

结果：

- 未发现真实 API Key、JWT、密码、数据库连接串明文。
- `config/env.js` 只读取运行时环境变量。
- `server/services/hunyuanService.js` 使用 `Authorization: Bearer ${env.CLOUDBASE_AI_API_KEY}`。

上线风险：

- 当前 `utils/api.js` 仍直接 `require('../server/api.js')`，也就是服务端 mock 层仍被小程序端引用。
- 生产环境不能把真实 `CLOUDBASE_AI_API_KEY` 打入小程序包。
- 正式上线应将 `server/` 部署到 CloudBase 云函数或 HTTP 服务，小程序只请求云端 API。

## 7. 生产环境检查

### 混元

`server/services/hunyuanService.js` 当前逻辑：

- 有 `CLOUDBASE_AI_API_KEY` 时，请求 CloudBase AI Gateway。
- 没有 Key 时，返回 mock 解释。
- 支持 24 小时内存缓存。

风险：

- mock fallback 适合开发环境，但生产环境需要监控 Key 缺失，不能静默返回 mock。
- 当前缓存是内存级，服务重启后失效。

### Database

`server/database/connection.js` 当前逻辑：

- 有 `DATABASE_URL` 或注入 client 时视为可用。
- 否则仍是 mock/memory 状态。

风险：

- 反馈、日志等生产数据如果仍使用内存实现，服务重启会丢失。
- 上线前需要接入腾讯云 PostgreSQL 或 CloudBase 数据库。

### 环境变量

当前需要重点确认：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
HUNYUAN_MODEL
DATABASE_URL
```

开发/生产区别：

- 开发环境允许 mock fallback。
- 生产环境必须注入 CloudBase AI Key，并把服务端代码部署在云端。

## 8. 数据检查

`data/knowledge/terms.json` 检查结果：

```json
{
  "count": 474,
  "errorCount": 0,
  "duplicateTermCount": 0,
  "duplicateIdCount": 0,
  "duplicateAliasCount": 52
}
```

字段完整性通过：

```text
term
translation
professionalExplanation
lifeExamples
aiExample
relatedTerms
```

重复 alias 示例：

```text
人工智能 -> AI / Artificial Intelligence
large language model -> LLM / 大语言模型
提示词工程 -> Prompt / Prompt Engineering
ai智能体 -> Agent / 智能体
检索增强 -> RAG / 检索增强生成
向量嵌入 -> Embedding / 嵌入向量
模型微调 -> Fine-tuning / 微调
```

风险：

- term/id 没有重复。
- alias 重复会造成搜索命中歧义，尤其是中英文同义词条并存时。

建议：

- 上线前优先清理高频入口词的 alias：`AI`、`LLM`、`Prompt`、`Agent`、`RAG`、`Embedding`、`微调`。
- 或在搜索层增加主词优先级，但这属于搜索逻辑变更，本次未改。

## 9. 小程序配置检查

页面注册：

```json
[
  "pages/index/index",
  "pages/result/result",
  "pages/simpleExplain/simpleExplain"
]
```

页面文件检查通过：

```text
pages/index/index.js/wxml/wxss/json
pages/result/result.js/wxml/wxss/json
pages/simpleExplain/simpleExplain.js/wxml/wxss/json
```

配置风险：

- `project.config.json` 中 `urlCheck=false`，上线前需确认微信开发者工具上传时的生产配置。
- `project.config.json` 的 `libVersion=2.19.4`，`project.private.config.json` 显示 `3.17.0`，建议统一以真实上传基础库为准。
- `uploadWithSourceMap=true`，如果不需要线上 sourcemap，可在正式发布流程中确认是否关闭。

## 10. 验证结果

### JSON 检查

通过：

```text
OK app.json
OK project.config.json
OK sitemap.json
OK data/knowledge/terms.json
OK data/knowledge/version.json
```

### JS 语法检查

通过：

```text
OK JS syntax checked: 32
```

### 小程序关键页面检查

通过：

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

### API 链路测试

通过：

```json
[
  {
    "keyword": "API",
    "success": true,
    "source": "knowledge",
    "hasData": true,
    "term": "API"
  },
  {
    "keyword": "Phi",
    "success": true,
    "source": "knowledge",
    "hasData": true,
    "term": "Phi"
  },
  {
    "keyword": "Claude",
    "success": true,
    "source": "knowledge",
    "hasData": true,
    "term": "Claude"
  },
  {
    "keyword": "为什么AI会忘记聊天",
    "success": true,
    "source": "llm",
    "hasData": true,
    "term": "为什么AI会忘记聊天"
  }
]
```

说明：

- 本地 Node 测试可验证 API 返回结构。
- 未调用微信开发者工具自动化编译；需要在开发者工具中执行清缓存、编译、预览上传前检查。

## 11. 上线前剩余风险

必须确认：

1. 生产环境不要把真实 `CLOUDBASE_AI_API_KEY` 放进小程序端。
2. CloudBase AI Gateway 在生产环境变量下真实可用。
3. 反馈、日志、搜索记录是否需要持久化，当前存在 memory/mock 风险。
4. 微信开发者工具真实上传包体是否与估算一致，目标应低于 `2MB`。

建议发布前处理：

1. 清理重复 alias，减少搜索误命中。
2. 删除或归档未使用素材和导入中间文件。
3. 统一基础库版本。
4. 确认 `urlCheck`、`uploadWithSourceMap` 的正式发布配置。

## 12. 是否建议发布

结论：谨慎发布。

当前代码层面：

- JSON 检查通过。
- JS 语法检查通过。
- 关键页面文件检查通过。
- API 基础链路通过。
- 包体估算已降到 `1.25MB`。

但正式发布前必须完成：

- 真实微信开发者工具编译/预览检查。
- 生产环境密钥注入方式确认。
- 确认 `server/` 不会以携带密钥的形式进入小程序端生产包。

满足以上条件后，可以进入小范围灰度发布。
