# AI大白话知识库生产规范 v1

## 一、产品定位

AI大白话不是百科。

它的目标不是完整覆盖一个 AI 概念的全部技术细节，而是让普通用户在 30 秒内理解：

- 这个词中文怎么说
- 它专业上大概是什么意思
- 它在生活、工作、商业、技术和 AI 场景里分别像什么
- 它在真实 AI 产品里怎么用
- 它和哪些词有关

内容风格要求：

- 像懂 AI 的朋友在解释
- 少术语，多人话
- 先让用户理解，再补必要边界
- 不写百科式长定义
- 不夸大 AI 能力

## 二、词条分类

### 1. 基础概念类

用于解释 AI 领域最常见的入门概念。

示例：

- Token
- Agent
- RAG
- Prompt
- 大模型
- 上下文窗口

### 2. 工具产品类

用于解释具体工具、产品能力、接口能力。

示例：

- API
- Copilot
- Cursor
- Codex
- MCP

### 3. 技术原理类

用于解释偏技术但普通用户经常听到的机制。

示例：

- Embedding
- 微调
- 向量数据库
- 模型幻觉
- 多模态

### 4. 行业应用类

用于解释 AI 在行业里的落地方式。

示例：

- AI客服
- AI设计
- AI写作
- AI教育
- AI医疗助手

### 5. 用户问题类

用于回答普通用户真实关心的问题。

示例：

- AI会不会替代工作
- 为什么AI会忘记聊天内容
- 普通人为什么需要了解AI
- AI生成内容可信吗

## 三、标准字段

每个正式词条必须包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `term` | string | 是 | 标准词条名称 |
| `aliases` | string[] | 是 | 用户可能搜索的说法 |
| `translation` | object | 是 | 中文翻译和英文全称 |
| `translation.english` | string | 建议 | 英文全称，没有可留空 |
| `translation.chinese` | string | 是 | 中文翻译 |
| `professionalExplanation` | string | 是 | 专业术语简短解释，建议 50 字以内 |
| `lifeExamples` | object[] | 是 | 五个生活化/场景化案例 |
| `aiExample` | string | 是 | AI 产品或 AI 系统中的实际应用案例 |
| `relatedTerms` | string[] | 是 | 相关词 |

## 四、lifeExamples 结构

旧标准中的单个 `lifeExample` 已废弃。

新标准统一使用 `lifeExamples` 数组。每个词条必须包含 5 个案例，分别覆盖：

1. 日常生活
2. 工作场景
3. 商业场景
4. 技术场景
5. AI场景

结构：

```json
{
  "lifeExamples": [
    {
      "type": "daily",
      "title": "日常生活",
      "content": ""
    },
    {
      "type": "work",
      "title": "工作场景",
      "content": ""
    },
    {
      "type": "business",
      "title": "商业场景",
      "content": ""
    },
    {
      "type": "technical",
      "title": "技术场景",
      "content": ""
    },
    {
      "type": "ai",
      "title": "AI场景",
      "content": ""
    }
  ]
}
```

要求：

- 每个案例都必须具体，不能只写概念解释
- 每个案例最好控制在 30-80 字
- 案例之间不要重复表达
- 技术场景可以稍微专业，但仍然要让普通用户看懂
- AI场景必须说明这个词在 AI 产品或模型调用中怎么出现

## 五、内容规则

### translation

要求：

- `english` 写英文全称或常见英文表达
- `chinese` 写通用中文翻译
- 没有明确英文全称时，`english` 可以留空字符串

示例：

```json
{
  "english": "Application Programming Interface",
  "chinese": "应用程序编程接口"
}
```

### professionalExplanation

要求：

- 简短、准确
- 建议 50 字以内
- 不堆术语
- 不写成百科长定义

示例：

```text
API就是让不同软件按照规则互相调用功能的一种接口。
```

### lifeExamples

必须包含 5 个场景：

- `daily`：日常生活类比
- `work`：普通工作场景
- `business`：商业/经营/组织协作场景
- `technical`：技术实现或系统协作场景
- `ai`：AI 产品、模型、智能体或知识库场景

### aiExample

要求：

- 必须是真实 AI 应用语境
- 说明这个词在 AI 产品中如何被使用
- 不写空泛价值判断

示例：

```text
AI大白话调用混元模型时，就是通过API发送请求并获得返回结果。
```

### relatedTerms

要求：

- 3-6 个相关词
- 优先选择知识库中未来会扩展的词
- 不要放太泛的词

## 六、质量标准

每个词条上线前按 4 个维度评分，每项 5 分。

| 维度 | 5 分标准 | 低分表现 |
| --- | --- | --- |
| 理解度 | 普通用户 30 秒内能理解 | 定义绕、术语多 |
| 案例质量 | 5 个场景自然、具体、不重复 | 案例空泛、硬套 |
| 准确性 | 没有明显技术错误或夸大 | 概念混淆、绝对化 |
| 实用性 | 用户知道为什么要了解 | 只解释概念，没有用途 |

上线建议：

- 单项低于 4 分：不建议直接上线
- 平均分低于 4.5：进入二次修改
- 涉及医疗、法律、金融等高风险领域：必须人工复核

## 七、禁止内容

禁止：

1. 百科复制
2. 专业堆砌
3. 营销语言
4. 绝对化 AI 能力
5. 伪造权威来源
6. 把 AI 描述成万能
7. 高风险领域给确定性建议

不推荐表达：

```text
AI一定会完全替代人类工作。
```

推荐表达：

```text
AI更可能先替代重复性强、规则清楚的部分任务，但复杂判断、沟通和责任仍需要人参与。
```

## 八、完整示例

```json
{
  "term": "API",
  "aliases": [
    "api",
    "API是什么",
    "什么是API",
    "应用程序编程接口",
    "接口"
  ],
  "translation": {
    "english": "Application Programming Interface",
    "chinese": "应用程序编程接口"
  },
  "professionalExplanation": "API就是让不同软件按照规则互相调用功能的一种接口。",
  "lifeExamples": [
    {
      "type": "daily",
      "title": "日常生活",
      "content": "就像你在餐厅点餐，只需要看菜单下单，不需要知道厨房怎么炒菜。"
    },
    {
      "type": "work",
      "title": "工作场景",
      "content": "同事之间交接任务时，会约定输入什么、输出什么，API也是软件之间的这种约定。"
    },
    {
      "type": "business",
      "title": "商业场景",
      "content": "电商平台接入支付服务时，不用自己做银行系统，而是通过支付API完成扣款和回调。"
    },
    {
      "type": "technical",
      "title": "技术场景",
      "content": "前端页面提交搜索词，后端通过API接收请求、查询数据，再把结果返回给页面。"
    },
    {
      "type": "ai",
      "title": "AI场景",
      "content": "AI应用调用大模型时，会通过模型API发送问题，并接收模型生成的回答。"
    }
  ],
  "aiExample": "AI大白话调用混元模型时，就是通过API发送请求并获得返回结果。",
  "relatedTerms": [
    "SDK",
    "接口",
    "大模型",
    "Token"
  ]
}
```

## 九、上线检查清单

每个词条提交审核前，必须确认：

- `translation.chinese` 是否清楚
- `professionalExplanation` 是否简短准确
- `lifeExamples` 是否刚好包含 5 个案例
- 5 个案例是否覆盖日常生活、工作场景、商业场景、技术场景、AI场景
- `aiExample` 是否是真实 AI 应用案例
- `relatedTerms` 是否准确
- 是否没有百科复制、专业堆砌、营销语言
- 是否没有夸大 AI 能力
