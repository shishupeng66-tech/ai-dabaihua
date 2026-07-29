# AI大白话 Result 页面 v2 改造方案

## 目标

将 `pages/result` 从固定字段展示升级为“协议驱动的动态结果页”，兼容旧知识库字段，同时支持 `docs/ai-explanation-schema-v1.md` 中定义的 6 种生产版解释类型。

本方案只分析页面改造方向，不包含代码实现。

## 1. 当前 Result 页面分析

当前涉及文件：

- `pages/result/result.js`
- `pages/result/result.wxml`
- `pages/result/result.wxss`

### result.js 当前数据流

页面参数：

- `onLoad(options)` 读取 `options.term`
- 使用 `decodeURIComponent(options.term || '')`
- 设置页面标题：`wx.setNavigationBarTitle({ title: term })`
- 调用 `loadExplanation(term)`

API 调用：

- `api.explainTerm(term)`
- 期望返回：

```js
{
  success: true,
  source: 'knowledge' | 'llm',
  data: {}
}
```

保存到 `data` 的字段：

| data 字段 | 作用 |
| --- | --- |
| `term` | 当前查询词 |
| `isLoading` | loading 状态 |
| `resultData` | API 返回的解释主体 |
| `source` | 来源：knowledge / llm |
| `sourceText` | 来源展示文案 |
| `errorText` | 错误文案 |
| `isFavorite` | 是否收藏 |
| `relatedTerms` | 相关词 |

当前交互：

- 收藏：`favorite.addFavorite(resultData.term)` / `favorite.removeFavorite(resultData.term)`
- 复制：拼接 `term / summary / explanation / analogy / usage / examples`
- 反馈：`analytics.recordFeedback('helpful' | 're_explain')`
- 相关词点击：跳转当前 result 页面
- 分享：使用 `resultData.term || term`

### result.wxml 当前展示字段

当前 WXML 是固定结构：

| 区块 | 使用字段 |
| --- | --- |
| 标题 | `resultData.term` |
| 大白话解释 | `resultData.explanation` |
| 类比 | `resultData.analogy` |
| 示例 | `resultData.examples` |
| 相关词 | `relatedTerms` |
| 收藏/复制 | `isFavorite`、`resultData` |

当前不展示但 JS 中存在：

- `sourceText`
- `errorText`
- `summary`
- `usage`
- `type`
- `content`
- `meta`
- `tokenUsage`
- `intent`
- `skillName`

### result.wxss 当前样式能力

已有样式基础：

- 页面容器：`.page`
- 内容淡入：`.result-content`
- 顶部标题区：`.term-header`
- 操作按钮：`.term-actions`、`.action-btn`
- 通用区块：`.section`、`.section-title`
- 卡片：`.explanation-card`、`.analogy-card`、`.examples-card`
- 列表项：`.example-item`
- 相关词标签：`.related-tags`、`.related-tag`
- loading：WXML 已使用 `.loading-container`、`.loading-spinner`、`.loading-text`，但当前 wxss 片段中未看到完整定义

当前页面问题：

1. 强依赖旧字段：`explanation`、`analogy`、`examples`。
2. 不支持 `data.type` 动态分支。
3. 新协议字段都在 `content` 内，当前页面不会展示。
4. `copy` 拼接逻辑只适配旧字段。
5. 错误态有 `errorText` 但 WXML 未展示。
6. `sourceText` 已设置但 WXML 未展示。
7. 收藏默认使用 `resultData.term`，对问题类结果需要 fallback。

## 2. 新协议映射分析

协议文件：`docs/ai-explanation-schema-v1.md`

统一返回结构：

```json
{
  "success": true,
  "source": "knowledge",
  "matchType": "exact",
  "score": 100,
  "cacheHit": false,
  "data": {
    "type": "term_explain",
    "title": "",
    "term": "",
    "summary": "",
    "content": {},
    "relatedTerms": [],
    "meta": {}
  }
}
```

### 顶层字段映射

| API 字段 | result 页面用途 |
| --- | --- |
| `success` | 判断是否成功 |
| `source` | 展示来源：知识库 / AI实时解释 |
| `matchType` | 可用于内部调试或后续灰度展示 |
| `score` | 可用于知识库命中质量分析，不建议用户端直接展示 |
| `cacheHit` | 可用于调试，不建议默认展示 |
| `data` | 页面主体数据 |

### data 字段映射

| 新协议字段 | 页面建议 |
| --- | --- |
| `data.type` | 决定动态组件 |
| `data.title` | 页面主标题，优先级高于 `term` |
| `data.term` | 收藏、分享、相关词跳转的核心对象 |
| `data.summary` | 顶部摘要 / 记忆卡 |
| `data.content` | 各类型组件数据源 |
| `data.relatedTerms` | 底部相关词 |
| `data.meta` | 可展示分类、难度，也可隐藏 |

### 旧字段兼容映射

知识库旧字段可能仍返回：

```js
{
  term,
  explanation,
  summary,
  analogy,
  examples,
  usage,
  relatedTerms
}
```

建议在 result.js 增加页面级标准化，不改变 API：

| 旧字段 | v2 展示字段 |
| --- | --- |
| `term` | `data.term` / `title` fallback |
| `explanation` | `summary` 或 `content.oneSentence` |
| `summary` | `summary` |
| `analogy` | `content.analogy` |
| `examples` | `content.examples` |
| `usage` | `content.importance` |
| `relatedTerms` | `relatedTerms` |

标准化后的页面内部结构建议：

```js
viewModel = {
  type: 'term_explain',
  title: '',
  term: '',
  summary: '',
  sourceText: '',
  sections: [],
  relatedTerms: []
}
```

## 3. 动态结果组件结构设计

### 总体页面结构

建议 result 页面分为：

1. 状态层：loading / error / result
2. 顶部信息：标题、摘要、来源、收藏、复制
3. 动态内容区：按 `type` 渲染组件
4. 反馈区：有帮助、重新解释
5. 相关词区

页面伪结构：

```xml
<view class="page">
  <loading-state wx:if="{{isLoading}}" />
  <error-state wx:elif="{{errorText}}" />
  <view wx:else>
    <result-header />
    <dynamic-result-content />
    <result-feedback />
    <related-terms />
  </view>
</view>
```

### term_explain

展示内容：

- 一句话理解：`content.oneSentence` 或 `summary`
- 类比：`content.analogy`
- 工作方式：`content.howItWorks`
- 示例：`content.examples`
- 为什么重要：`content.importance`
- 注意事项：`content.notes`
- 相关概念：`content.relatedConcepts`

推荐组件：

| 数据 | 组件 |
| --- | --- |
| `summary` / `oneSentence` | `memory-card` |
| `analogy` | `analogy-card` |
| `howItWorks` | `explain-section` |
| `examples` | `example-list` |
| `importance` | `value-card` |
| `notes` | `warning-card` |

### principle_explain

展示内容：

- 核心答案：`content.coreAnswer`
- 原因列表：`content.reasons`
- 解决方式：`content.solutions`

推荐组件：

| 数据 | 组件 |
| --- | --- |
| `coreAnswer` | `memory-card` |
| `reasons` | `reason-list` |
| `solutions` | `action-list` |

原因列表建议展示为编号卡：

```js
[
  { title: '上下文窗口有限', detail: '...' }
]
```

### industry_explain

展示内容：

- 行业：`content.industry`
- 核心解释：`content.coreAnswer`
- 行业角色映射：`content.roleMapping`
- 工作流程：`content.workflow`
- 使用场景：`content.scenarios`
- 边界提醒：`content.safetyBoundaries`

推荐组件：

| 数据 | 组件 |
| --- | --- |
| `coreAnswer` | `memory-card` |
| `roleMapping` | `mapping-card` |
| `workflow` | `flow-steps` |
| `scenarios` | `example-list` |
| `safetyBoundaries` | `warning-card` |

### compare / compare_explain

协议中 type 是 `compare`，Intent 中是 `compare_explain`。

页面建议兼容：

```js
isCompare = type === 'compare' || type === 'compare_explain'
```

展示内容：

- 一句话区别：`content.oneSentenceDifference`
- 对比对象：`content.items`
- 对比维度数组：`content.dimensions`
- 选择建议：`content.recommendation`

推荐组件：

| 数据 | 组件 |
| --- | --- |
| `oneSentenceDifference` | `memory-card` |
| `dimensions` | `comparison-card` |
| `recommendation` | `action-list` |

对比表字段：

```js
{
  dimension: '',
  left: '',
  right: '',
  conclusion: ''
}
```

### value_explain

展示内容：

- 变化：`content.currentChange`
- 影响：`content.userImpact`
- 行动建议：`content.actionSuggestions`

推荐组件：

| 数据 | 组件 |
| --- | --- |
| `currentChange` | `memory-card` |
| `userImpact` | `impact-list` |
| `actionSuggestions` | `action-list` |

### learning_plan

展示内容：

- 学习目标：`content.goal`
- 阶段路线：`content.stages`
- 避坑建议：`content.pitfalls`

推荐组件：

| 数据 | 组件 |
| --- | --- |
| `goal` | `memory-card` |
| `stages` | `roadmap-card` |
| `pitfalls` | `warning-card` |

阶段字段：

```js
{
  stage: '阶段1',
  title: '',
  learningGoal: '',
  practiceGoal: '',
  tasks: [],
  output: ''
}
```

## 4. 微信小程序组件结构设计

建议新增目录：

```text
components/
  result/
    result-header/
      index.js
      index.wxml
      index.wxss
      index.json
    memory-card/
      index.js
      index.wxml
      index.wxss
      index.json
    analogy-card/
      index.js
      index.wxml
      index.wxss
      index.json
    example-list/
      index.js
      index.wxml
      index.wxss
      index.json
    reason-list/
      index.js
      index.wxml
      index.wxss
      index.json
    action-list/
      index.js
      index.wxml
      index.wxss
      index.json
    mapping-card/
      index.js
      index.wxml
      index.wxss
      index.json
    flow-steps/
      index.js
      index.wxml
      index.wxss
      index.json
    comparison-card/
      index.js
      index.wxml
      index.wxss
      index.json
    roadmap-card/
      index.js
      index.wxml
      index.wxss
      index.json
    warning-card/
      index.js
      index.wxml
      index.wxss
      index.json
    related-terms/
      index.js
      index.wxml
      index.wxss
      index.json
    feedback-actions/
      index.js
      index.wxml
      index.wxss
      index.json
```

### 组件职责

| 组件 | 作用 |
| --- | --- |
| `result-header` | 标题、摘要、来源、收藏、复制 |
| `memory-card` | 一句话理解 / 核心答案 / 一句话区别 |
| `analogy-card` | 生活类比 |
| `example-list` | 示例、场景 |
| `reason-list` | 原因拆解 |
| `action-list` | 解决方式、选择建议、行动建议 |
| `mapping-card` | 行业角色映射 |
| `flow-steps` | 工作流程 |
| `comparison-card` | 对比表 |
| `roadmap-card` | 学习阶段路线 |
| `warning-card` | 注意事项、边界提醒、避坑 |
| `related-terms` | 相关词跳转 |
| `feedback-actions` | 有帮助、重新解释 |

### 页面动态渲染方式

方案 A：WXML 条件渲染。

优点：小程序原生简单，开发成本低。  
缺点：result.wxml 会变长。

```xml
<block wx:if="{{viewModel.type === 'term_explain'}}">
  <memory-card text="{{content.oneSentence}}" />
  <analogy-card text="{{content.analogy}}" />
  <example-list items="{{content.examples}}" />
</block>
```

方案 B：JS 生成 sections 数组。

优点：WXML 更统一，扩展新类型更容易。  
缺点：复杂组件如对比表、路线图仍需要按 type 判断。

```js
sections: [
  { component: 'memory-card', title: '一句话理解', data: {} },
  { component: 'analogy-card', title: '打个比方', data: {} }
]
```

推荐：第一版使用方案 A，保证稳定；第二版再抽象 sections。

## 5. 收藏、复制、历史、状态设计

### 收藏功能

当前收藏以 `resultData.term` 为 key。

v2 建议 key 优先级：

```js
favoriteKey = resultData.term || resultData.title || term
```

收藏展示文案：

- 术语类：收藏词条
- 问题类：收藏解释

风险：

- `industry_explain`、`learning_plan` 不是传统词条，直接用 `term` 可能重复。
- 建议未来 favorite 结构升级为：

```js
{
  id: '',
  type: '',
  title: '',
  term: '',
  query: '',
  createdAt: ''
}
```

### 复制功能

当前复制逻辑只拼旧字段。

v2 建议新增 `buildCopyText(viewModel)`：

不同 type 输出不同文本：

- `term_explain`：标题、summary、类比、工作方式、例子、重要性
- `principle_explain`：核心答案、原因、解决方式
- `industry_explain`：行业映射、流程、边界
- `compare`：一句话区别、对比维度、选择建议
- `value_explain`：变化、影响、行动建议
- `learning_plan`：目标、阶段、避坑

复制仍使用 `wx.setClipboardData`。

### 历史记录

当前搜索历史主要在请求层/服务层记录，result 页面不直接管理。

v2 页面建议不新增历史写入，避免重复记录。

如果后续需要页面级历史，可记录：

```js
{
  query: term,
  type: resultData.type,
  title: resultData.title,
  source,
  time
}
```

### loading 状态

当前已有：

- `isLoading`
- loading WXML

建议：

1. loading 文案改为中性：“正在生成解释...”
2. v2 LLM 场景可能更慢，可增加 skeleton 卡片。
3. 知识库命中通常较快，不需要区分展示。

### 错误状态

当前 JS 设置 `errorText`，但 WXML 未展示错误区。

建议新增：

- 错误卡片
- 重试按钮
- 返回首页按钮

错误状态结构：

```xml
<view wx:if="{{!isLoading && errorText}}" class="error-state">
  <text>{{errorText}}</text>
  <button bindtap="onReExplainTap">重试</button>
</view>
```

## 6. 推荐文件结构

第一阶段最小改造：

```text
pages/result/
  result.js
  result.wxml
  result.wxss
  result.json

components/result/
  memory-card/
  analogy-card/
  example-list/
  reason-list/
  action-list/
  mapping-card/
  flow-steps/
  comparison-card/
  roadmap-card/
  warning-card/
```

第二阶段增强：

```text
components/result/
  result-header/
  related-terms/
  feedback-actions/
  error-state/
  loading-state/

utils/
  resultFormatter.js
  copyFormatter.js
```

注意：如果严格不想新增 utils，可把 `normalizeResultData` 和 `buildCopyText` 先放在 `pages/result/result.js` 内部。

## 7. 改造步骤

### Step 1：页面数据标准化

在 `result.js` 中新增内部方法：

- `normalizeResultData(apiResult, query)`
- `normalizeLegacyTermData(data, query)`
- `getFavoriteKey(resultData, query)`
- `buildCopyText(resultData)`

目标：

- 旧知识库字段也能变成 `term_explain`
- 新协议直接透传
- WXML 不直接处理复杂 fallback

### Step 2：顶部区域改造

展示：

- `resultData.title || resultData.term || term`
- `resultData.summary`
- `sourceText`
- 收藏按钮
- 复制按钮

### Step 3：按 type 条件渲染

先在 `result.wxml` 中用 `wx:if` 支持 6 类：

- `term_explain`
- `principle_explain`
- `industry_explain`
- `compare`
- `value_explain`
- `learning_plan`

兼容：

- `compare_explain` 映射为 `compare`

### Step 4：抽组件

优先抽通用组件：

1. `memory-card`
2. `example-list`
3. `warning-card`
4. `comparison-card`
5. `roadmap-card`

### Step 5：复制逻辑升级

改为按 type 输出文本，不再假设 `examples` 一定在根字段。

### Step 6：错误态补齐

WXML 增加错误状态展示，保留 toast。

### Step 7：视觉统一

复用现有 Apple 风格：

- 大标题
- 白色/玻璃卡片
- 圆角
- 柔和阴影
- 分组区块

不要在 v2 首版大幅改视觉，只改信息结构。

## 8. 风险点

### 风险 1：知识库旧字段和新协议并存

问题：

- 知识库命中可能没有 `type/content`。
- LLM v2 有 `type/content`。

建议：

- 页面层做标准化。
- 不要求后端一次性迁移完所有知识库。

### 风险 2：compare 命名不一致

问题：

- Intent 使用 `compare_explain`。
- Schema 使用 `compare`。

建议：

- 页面统一归一化：

```js
type === 'compare_explain' ? 'compare' : type
```

### 风险 3：复制功能遗漏字段

问题：

- 不同 type 的 content 字段完全不同。

建议：

- 单独设计 `buildCopyTextByType`。
- 缺字段时跳过，不输出 undefined。

### 风险 4：收藏 key 不稳定

问题：

- 问题类解释不一定有标准 `term`。

建议：

- 收藏 key 使用 `term || title || query`。
- 后续升级 favorite 数据结构。

### 风险 5：WXML 过长

问题：

- 6 种类型全部写在 result.wxml 会膨胀。

建议：

- 第一版可以接受。
- 第二版抽组件，保留页面只做编排。

### 风险 6：结果页一次性重构影响现有可用性

建议：

- 先做兼容型改造，不删除旧字段展示。
- 可保留 fallback 区块：

```xml
<block wx:if="{{!resultData.type}}">
  <!-- old result layout -->
</block>
```

### 风险 7：生产 v2 LLM 输出偶发字段缺失

建议：

- 所有组件都要支持空字段隐藏。
- `summary` 缺失时 fallback 到 `content.oneSentence/coreAnswer/oneSentenceDifference/goal`。

## 9. 推荐首版验收标准

1. `Token是什么` 知识库命中仍能正常展示。
2. `为什么AI会忘记聊天` 展示核心答案、原因、解决方式。
3. `RAG和微调区别` 展示对比表。
4. `用医生行业解释Agent` 展示行业映射、流程、边界提醒。
5. 收藏可用。
6. 复制文本不出现 `undefined`。
7. loading 和错误状态可见。
8. 相关词点击仍可跳转。
9. result 页面可以兼容旧字段和新协议字段。

