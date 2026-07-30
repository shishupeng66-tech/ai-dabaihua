# AI大白话结果页重设计报告

## 修改目标

将 `pages/result` 从偏“结果展示/知识库浏览”的页面，改为“AI解释卡片页面”。

用户进入结果页后，只看到 AI 已经生成的一份易懂解释，不展示知识库、数据库、词条来源等内部概念。

## 修改文件

- `pages/result/result.js`
- `pages/result/result.wxml`
- `pages/result/result.wxss`
- `utils/knowledge.js`
- `project.config.json`

## 页面结构

### 1. 顶部解释标题卡

标题规则：

- 输入是短词：显示 `API是什么？`
- 输入是长问题：显示用户原问题
- 标题最多展示两行，超出自动截断

页面文案：

- `AI 已为你生成解释`

不展示：

- 来源
- 知识库
- 数据库
- 词条

### 2. AI一句话解释

标题：

- `大白话解释`

优先展示：

- `professionalExplanation`

兼容旧字段：

- `summary`
- `explanation`
- `content.oneSentence`
- `content.coreAnswer`

### 3. 生活中的理解

重点展示：

- `lifeExamples`

兼容旧字段：

- `lifeExample`
- `examples`
- `analogy`

交互：

- 默认随机展示一个生活案例
- 点击 `换一个例子` 后，在 `lifeExamples` 中随机切换
- 如果只有一个案例，不显示切换按钮

插图：

- 使用通用 AI 助手、人物、聊天气泡和生活元素组合
- 不绑定固定点餐场景，适用于 API、Token、Phi、Claude、长问题等不同解释内容

### 4. AI里面怎么用

标题：

- `AI里面怎么用`

优先展示：

- `aiExample`

兼容旧字段：

- `usage`
- `content.importance`

### 5. 继续学习

展示：

- `relatedTerms`

交互：

- 点击相关词继续跳转到结果页解释

## 数据兼容

当前结果页适配以下新版字段：

```json
{
  "term": "",
  "translation": {
    "english": "",
    "chinese": ""
  },
  "professionalExplanation": "",
  "lifeExamples": [],
  "aiExample": "",
  "relatedTerms": []
}
```

同时兼容旧字段：

```json
{
  "summary": "",
  "explanation": "",
  "analogy": "",
  "examples": [],
  "usage": "",
  "lifeExample": {}
}
```

## 必要修复

`utils/knowledge.js` 做了一个必要修复：

- 支持 `lifeExamples` 数组
- 继续兼容旧 `lifeExample`
- 避免长问题因为包含短词 `AI` 而误命中知识库

规则调整：

- `term` 完全匹配仍为 100 分
- `aliases` 完全匹配仍为 80 分
- keyword 包含匹配仍为 60 分
- 但短词不参与长句包含匹配，避免 `为什么AI会忘记聊天？` 被误判为 `AI`

## 编译包体处理

`project.config.json` 增加了对原始素材包和知识库导入备份文件的忽略。

原因：

- `AI大白话前端插图组件素材包` 原始图片体积较大
- 页面实际引用的是 `assets/home` 下的小尺寸可用素材
- 忽略原始素材包后，小程序预览包体从约 `102MB` 降到约 `1.32MB`

## 测试结果

测试输入：

- `API`
- `Token`
- `Phi`
- `Claude`
- `混元`
- `为什么AI会忘记聊天？`

结果：

| 输入 | source | 标题 | summary | lifeExamples | 可切换案例 | aiExample |
| --- | --- | --- | --- | --- | --- | --- |
| API | knowledge | API是什么？ | 正常 | 3 | 是 | 正常 |
| Token | knowledge | Token是什么？ | 正常 | 3 | 是 | 正常 |
| Phi | knowledge | Phi是什么？ | 正常 | 3 | 是 | 正常 |
| Claude | knowledge | Claude是什么？ | 正常 | 3 | 是 | 正常 |
| 混元 | knowledge | 混元是什么？ | 正常 | 3 | 是 | 正常 |
| 为什么AI会忘记聊天？ | llm | 为什么AI会忘记聊天？ | 正常 | 3 | 是 | 正常 |

生活案例切换测试：

```json
{
  "switched": true
}
```

静态检查：

- `pages/result/result.js` 语法检查通过
- `utils/knowledge.js` 语法检查通过
- `app.json` / `project.config.json` JSON 检查通过
- `app.json` 页面文件检查通过
- 小程序包体估算：`1.32MB`

## 是否影响后端

未修改：

- `server/api.js`
- `explainService`
- `knowledgeService`
- `hunyuanService`
- API 调用流程
- `data/knowledge/terms.json`

本次只调整结果页展示层、结果页数据适配，以及必要的知识库搜索误判修复。
