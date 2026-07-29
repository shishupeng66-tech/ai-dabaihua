# 前端详情页白屏链路检查报告

## 检查结论

搜索 `Phi` 的前端链路本身可以走通：

`pages/index/index.js` 搜索输入 -> `wx.navigateTo('/pages/result/result?term=Phi')` -> `pages/result/result.js` 的 `onLoad(options)` 接收 `term` -> `utils/api.js` -> `server/api.js` -> `explainService` -> `utils/knowledge.js` 命中 `terms.json`。

本地模拟 `api.explainTerm('Phi')` 返回成功，`source=knowledge`，命中词条 `Phi`。因此白屏不是因为 `Phi` 不存在，也不是因为跳转参数丢失。

## 白屏原因

### 主要原因：详情展示层没有完整适配新知识库字段

当前新知识库结构是：

```json
{
  "term": "",
  "translation": {},
  "professionalExplanation": "",
  "lifeExamples": [],
  "aiExample": "",
  "relatedTerms": []
}
```

但前端归一化和详情页仍主要使用旧字段：

- `lifeExample`
- `examples`
- `summary`
- `explanation`
- `usage`

具体表现：

- `utils/knowledge.js` 只识别旧字段 `entry.lifeExample`，没有把新字段 `entry.lifeExamples[]` 转成前端可渲染的案例列表。
- `pages/result/result.js` 的 `createTermSections()` 只读取 `data.lifeExample`，没有读取 `data.lifeExamples`。
- `normalizeResultData()` 生成 `examples` 时使用 `data.examples || [data.aiExample]`，所以 `Phi` 的 3 个生活案例不会进入页面展示。

这会导致新结构词条的核心生活案例丢失。若某些新词条同时缺少旧字段兜底，页面可能只剩少量 section，甚至在小程序渲染层表现为空白。

### 次要风险：WXML 使用较多复杂表达式

`pages/result/result.wxml` 中存在较多表达式：

- `{{resultData.summary || resultData.explanation}}`
- `{{resultData.type === 'term_explain'}}`
- `{{section.type === 'list' || section.type === 'steps' || section.type === 'warning-list'}}`
- `{{item.title || item.aiConcept || item.name || item.dimension || item.stage}}`

这些表达式在大多数基础库可用，但如果微信开发者工具或真机基础库较旧，可能出现渲染表达式异常。建议在后续修复时把复杂判断提前放到 JS viewModel 中，WXML 只做简单字段读取。

## 涉及文件

### 搜索入口

- `pages/index/index.js`

关键链路：

```js
wx.navigateTo({
  url: `/pages/result/result?term=${encodeURIComponent(searchText)}`
})
```

结论：跳转参数正常。

### 详情/结果页

- `pages/result/result.js`
- `pages/result/result.wxml`

问题点：

- `createTermSections()` 未读取 `lifeExamples[]`
- `normalizeResultData()` 未把 `lifeExamples[]` 转成 `examples` 或独立 section
- WXML 依赖旧 viewModel 字段渲染

### 知识库归一化

- `utils/knowledge.js`

问题点：

```js
const lifeExample = entry.lifeExample && typeof entry.lifeExample === 'object'
  ? entry.lifeExample
  : null
```

这里只兼容旧的单个 `lifeExample`，没有处理新的数组 `lifeExamples`。

### 知识库加载

- `utils/knowledgeLoader.js`

结论：可以读取数组型 `terms.json`，这里不是主要问题。

## 字段兼容差异

| 新字段 | 当前前端读取情况 | 问题 |
| --- | --- | --- |
| `term` | 已读取 | 正常 |
| `translation` | 已读取 | 正常 |
| `professionalExplanation` | 已读取 | 正常 |
| `lifeExamples[]` | 未完整读取 | 主要问题 |
| `aiExample` | 已读取 | 正常 |
| `relatedTerms` | 已读取 | 正常 |
| `summary` | 仍作为旧字段读取 | 需要保留兜底即可 |
| `example` / `usage` | 旧字段兼容逻辑仍存在 | 不应作为新结构主路径 |

## 修复方案

需要修改代码，但本次未修改。

建议分两层修：

### 方案一：修 `utils/knowledge.js`

在 `normalizeEntry(entry)` 中增加新结构兼容：

- 如果存在 `entry.lifeExamples[]`，保留为 `lifeExamples`
- 将 `lifeExamples` 转成 `examples` 列表，供旧 WXML 列表区继续渲染
- 将第一个生活案例兼容成 `lifeExample`，避免旧字段为空

### 方案二：修 `pages/result/result.js`

在 `createTermSections()` 中增加独立生活案例 section：

- `createSection('lifeExamples', '生活例子', data.lifeExamples, 'object-list')`
- 或将 3 个案例转成 list 文本：`title：content`

同时在 `normalizeResultData()` 中把：

```js
const examples = compactList(content.examples || data.examples || [data.aiExample])
```

调整为优先包含 `data.lifeExamples`。

### 方案三：降低 WXML 表达式复杂度

将 WXML 中复杂判断提前在 JS 中处理，例如：

- `resultData.summaryText`
- `resultData.typeLabel`
- `section.isList`
- `item.displayTitle`

WXML 只读取简单字段，减少基础库兼容风险。

## 是否需要修改代码

需要。

建议修改范围：

- `utils/knowledge.js`
- `pages/result/result.js`
- 必要时简化 `pages/result/result.wxml`

不需要修改：

- `data/knowledge/terms.json`
- `pages/index/index.js`
- `server/`
- `utils/knowledgeLoader.js`

## 本次未修改内容

本次只生成检查报告，没有修改业务代码，也没有修改知识库。
