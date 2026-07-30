# AI大白话小程序上线前检查报告

检查时间：2026-07-30

本次只做上线前检查并生成报告，未修改业务代码。

## 总体结论

当前项目功能链路可以本地运行，但不建议直接上线。

主要阻塞风险：

1. 主包估算约 `2.12MB`，超过普通小程序主包 `2MB` 风险线。
2. `pages/result/result.js` 存在多处 `console.log` 调试代码。
3. 当前本地健康检查显示 `hunyuan=mock`、`database=mock`，生产环境变量未在本地验证。
4. `terms.json` 与 `utils/knowledgeData.js` 同时进入包，知识库数据重复占用约 `1.65MB`。
5. 知识库 alias 存在多处跨词条重复，会带来搜索命中歧义。

## 1. 前端检查

### 页面白屏风险

页面注册检查通过：

```json
{
  "pages": [
    "pages/index/index",
    "pages/result/result",
    "pages/simpleExplain/simpleExplain"
  ]
}
```

页面四件套检查通过：

- `pages/index/index`
- `pages/result/result`
- `pages/simpleExplain/simpleExplain`

均存在：

- `.js`
- `.wxml`
- `.wxss`
- `.json`

WXML 标签结构检查通过：

| 页面 | view | text | button | image |
| --- | --- | --- | --- | --- |
| `pages/index/index.wxml` | 11/11 | 9/9 | 1/1 | 5 |
| `pages/result/result.wxml` | 28/28 | 20/20 | 5/5 | 3 |
| `pages/simpleExplain/simpleExplain.wxml` | 6/6 | 6/6 | 0/0 | 0 |

结果页本地数据渲染链路检查：

```json
[
  {
    "term": "API",
    "success": true,
    "source": "knowledge",
    "renderable": true
  },
  {
    "term": "Token",
    "success": true,
    "source": "knowledge",
    "renderable": true
  },
  {
    "term": "Phi",
    "success": true,
    "source": "knowledge",
    "renderable": true
  }
]
```

结论：

- 当前页面结构层面没有明确白屏风险。
- 之前的 `terms.json/terms.js module not defined` 风险已通过 `utils/knowledgeData.js` 规避。
- 仍需在微信开发者工具执行“清缓存并编译”后复测。

### console 调试代码

发现调试代码：

```text
app.js:4 console.log('AI大白话小程序启动')
pages/result/result.js:223 console.log('[result:onLoad] options =', options)
pages/result/result.js:225 console.log('[result:onLoad] keyword =', term)
pages/result/result.js:233 console.log('[result:loadExplanation:start] term =', term)
pages/result/result.js:257 console.log('[result:loadExplanation:success] resultData =', viewModel)
pages/result/result.js:269 console.log('[result:loadExplanation:final] this.data.resultData =', this.data.resultData)
pages/result/result.js:281 console.log('[result:loadExplanation:final] this.data.resultData =', this.data.resultData)
pages/result/result.js:282 console.log('[result:loadExplanation:final] this.data.errorText =', this.data.errorText)
```

保留的错误日志：

```text
pages/result/result.js:273 console.error('[result:loadExplanation:error]', err)
pages/result/result.js:354 console.error('[result:lifeExampleFeedback:error]', err)
utils/storage.js 多处 console.error
```

建议：

- 上线前删除普通 `console.log`。
- `console.error` 可保留，但生产环境建议接入统一 logger，避免泄露完整请求内容。

### 未使用资源

`assets/home` 共 6 个资源。

检测到疑似未使用资源：

```text
assets/home/hero-bubble-white.png
```

说明：

- 当前首页和结果页没有直接引用该图。
- 若后续不再使用，可以移除或从上传包排除。

### 路径错误

图片路径检查通过：

```text
/assets/home/hero-shelf-plant.png exists
/assets/home/hero-woman.png exists
/assets/home/hero-robot.png exists
/assets/home/hero-bubble-orange.png exists
/assets/home/hero-coffee.png exists
```

页面跳转路径检查：

```text
pages/index -> /pages/result/result?term=xxx
pages/result -> /pages/simpleExplain/simpleExplain?term=xxx
```

对应页面均已注册。

## 2. 后端检查

### 环境变量

`config/env.js` 当前从运行时环境读取：

```js
API_BASE_URL
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
DATABASE_URL
HUNYUAN_MODEL
```

检查结果：

- 未发现真实 API Key 写死在代码里。
- 未发现 JWT/API Key 明文提交到项目文件。
- 文档中只出现占位说明。

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

风险：

- 当前本地环境没有验证真实 `CLOUDBASE_AI_API_KEY`。
- `DATABASE_URL` 未配置时数据库仍是 mock/memory。
- 上线前必须在腾讯云环境确认真实环境变量注入。

### API 密钥

当前代码通过：

```js
Authorization: `Bearer ${env.CLOUDBASE_AI_API_KEY}`
```

风险：

- 目前服务端代码在小程序包内被前端 `utils/api.js` 直接 require。
- 如果真实 `CLOUDBASE_AI_API_KEY` 被打进小程序端，会有泄露风险。

建议：

- 生产版本应把 `server/` 放到云函数/云托管，不应随小程序前端包发布。
- 小程序端只请求云函数或 HTTPS API。

### 错误处理

已有：

- `server/api.js` 有 `observeApi()` 包装请求日志和错误日志。
- `loggerService.logError()` 会记录错误类型、message、stack。
- `pages/result/result.js` catch 后会显示错误提示。
- `pages/simpleExplain/simpleExplain.js` catch 后会显示错误状态。

风险：

- `loggerService` 当前为内存数组，重启即丢失。
- `stack` 可能包含敏感上下文，生产日志需脱敏。

### 日志

当前日志能力：

- request logs：memory
- error logs：memory
- health：可返回 mock/configured 状态

建议：

- 上线前接入腾讯云日志服务 CLS。
- 对 keyword、stack、请求参数做脱敏或长度截断。

## 3. 数据检查

### terms.json 完整性

检查结果：

```json
{
  "parseOk": true,
  "isArray": true,
  "count": 474,
  "errorCount": 0
}
```

必填字段检查通过：

- `term`
- `translation`
- `professionalExplanation`
- `lifeExamples`
- `aiExample`
- `relatedTerms`

### 数据格式

字段完整性：

- `terms.json` 可正常 JSON.parse。
- 所有词条必填字段无缺失。
- `lifeExamples` 均非空。
- `translation` 均至少包含有效字段。

分类分布：

```json
{
  "AI基础概念": 217,
  "AI开发技术": 68,
  "AI工具和产品": 54,
  "AI模型生态": 34,
  "软件开发": 30,
  "数据库和云计算": 20,
  "普通用户AI应用": 18,
  "企业AI": 14
}
```

风险：

- `level` 字段当前全部为空。
- 如果后续要按难度展示或筛选，需要补齐。

### 重复问题

检查结果：

```json
{
  "duplicateTermCount": 0,
  "duplicateIdCount": 0,
  "duplicateAliasCount": 50
}
```

term/id 无重复。

alias 有跨词条重复，例如：

```text
人工智能 -> AI / Artificial Intelligence
Large Language Model -> LLM / 大语言模型
提示词工程 -> Prompt / Prompt Engineering
AI智能体 -> Agent / 智能体
检索增强 -> RAG / 检索增强生成
模型微调 -> Fine-tuning / 微调
```

风险：

- 搜索时 alias 重复可能导致命中非预期词条。
- 当前搜索只返回最高分，重复 alias 会让排序依赖词条顺序。

建议：

- 上线前至少清理高频 alias：AI、LLM、Prompt、Agent、RAG、微调。
- 或增加 alias 权重/主词优先级。

## 4. 小程序发布检查

### 包体大小

按 `project.config.json` 的 `packOptions.ignore` 估算：

```json
{
  "includedMB": 2.12,
  "includedFileCount": 62
}
```

最大文件：

```text
utils/knowledgeData.js        827015 bytes
data/knowledge/terms.json     826998 bytes
assets/home/hero-woman.png    175543 bytes
assets/home/hero-robot.png    122829 bytes
```

风险：

- 当前主包估算约 `2.12MB`。
- 普通小程序主包限制通常为 `2MB`。
- `project.config.json` 中 `bigPackageSizeSupport=false`。
- 有上传失败风险。

主要原因：

- `terms.json` 和 `utils/knowledgeData.js` 内容重复。
- `data/knowledge/AI大白话知识库扩展_01_AI模型生态_01~09.json` 未全部忽略。
- 当前只忽略了 `_10.json`，其它扩展 JSON 仍可能进入包。

建议：

1. 上线前只保留一个运行时知识库文件。
2. 将 `data/knowledge/terms.json` 和扩展导入 JSON 排除出小程序上传包。
3. 保留 `utils/knowledgeData.js` 给小程序运行时使用。
4. 或迁移为云端知识库查询，前端不携带完整词库。

### 配置文件

`app.json`：

- 页面注册正常。
- `lazyCodeLoading=requiredComponents` 已开启。

`project.config.json`：

- `compileType=miniprogram`
- `miniprogramRoot=null`
- `appid` 已配置。
- `urlCheck=false`，上线前需确认是否符合生产要求。
- `libVersion=2.19.4`

`project.private.config.json`：

- `libVersion=3.17.0`

风险：

- `project.config.json` 和 `project.private.config.json` 基础库版本不一致。
- 上线前应以微信开发者工具实际上传版本为准。

### 发布风险

高风险：

- 包体超过 2MB 风险线。
- server 代码目前被小程序端直接 require，生产密钥不能放入小程序包。
- 存在 `console.log` 调试输出。

中风险：

- 知识库 alias 重复导致搜索命中歧义。
- 日志是内存实现，不适合生产排障。
- 本地健康检查显示混元和数据库均为 mock。

低风险：

- 存在疑似未使用资源 `hero-bubble-white.png`。
- `app.js` 初始化了已弱化或删除的收藏/学习相关本地数据。

## 5. 上线前建议清单

必须处理：

1. 删除生产包中的重复知识库数据，确保主包小于 2MB。
2. 删除 `pages/result/result.js` 和 `app.js` 的 `console.log`。
3. 确认生产环境 `CLOUDBASE_ENV_ID`、`CLOUDBASE_AI_API_KEY`、`MODEL_API_URL` 注入方式。
4. 确认 server 代码不会作为携带密钥的小程序端代码发布。

建议处理：

1. 清理高频重复 alias。
2. 将反馈、日志、搜索记录迁移到云数据库。
3. 删除或排除未使用资源。
4. 统一基础库版本。

可后置：

1. 补齐 `level` 字段。
2. 接入腾讯云 CLS。
3. 对知识库反馈做统计后台。

## 6. 本次检查命令摘要

已执行：

- console/debug 搜索
- require/path 搜索
- app/page 注册检查
- WXML 标签闭合检查
- 图片路径存在性检查
- JS 语法检查
- API 本地链路检查
- `terms.json` 完整性检查
- 重复 term/id/alias 检查
- 包体大小估算
- 密钥明文搜索

结果：

- JS 语法检查通过。
- 基础 API 链路通过。
- 页面结构检查通过。
- 数据完整性通过。
- 存在发布前必须处理的包体和调试日志风险。

