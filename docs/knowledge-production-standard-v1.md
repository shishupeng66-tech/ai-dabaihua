# AI大白话知识库生产规范 v1

## 一、产品定位

AI大白话不是百科。

它不是为了完整覆盖一个概念的全部技术细节，而是为了让普通用户在 30 秒内理解一个 AI 概念：

- 它是什么
- 像什么
- 用在哪里
- 为什么需要知道
- 容易误解在哪里

内容风格要求：

- 像懂 AI 的朋友在解释
- 少术语，多生活化表达
- 先让用户理解，再补必要边界
- 不追求论文式严谨表达，但必须准确、不误导

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

内容重点：

- 一句话讲明白
- 给生活类比
- 给普通用户使用场景

### 2. 工具产品类

用于解释具体工具、产品能力、接口能力。

示例：

- API
- Copilot
- Cursor
- Codex
- MCP

内容重点：

- 它能帮用户做什么
- 适合谁用
- 和相近工具有什么关系
- 不夸大产品能力

### 3. 技术原理类

用于解释较技术化但用户经常听到的机制。

示例：

- Embedding
- 微调
- 向量数据库
- 模型幻觉
- 多模态

内容重点：

- 解释原理但不堆公式
- 用“工作方式”帮助理解
- 明确适用场景和限制

### 4. 行业应用类

用于解释 AI 在行业里的落地方式。

示例：

- AI客服
- AI设计
- AI写作
- AI教育
- AI医疗助手

内容重点：

- 行业场景
- 用户能怎么用
- 能提升什么
- 有哪些边界和风险

### 5. 用户问题类

用于回答普通用户真实关心的问题。

示例：

- AI会不会替代工作
- 为什么AI会忘记聊天内容
- 普通人为什么需要了解AI
- AI生成内容可信吗

内容重点：

- 直接回答问题
- 不制造焦虑
- 给行动建议
- 说明常见误解

## 三、知识条目标准字段

每个知识条目必须包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 唯一 ID，英文小写短横线 |
| `term` | string | 是 | 标准词条名 |
| `aliases` | string[] | 建议 | 用户可能搜索的说法 |
| `category` | string | 是 | 词条分类 |
| `level` | string | 是 | 入门 / 进阶 / 高阶 |
| `summary` | string | 是 | 50 字以内一句话解释 |
| `analogy` | string | 是 | 生活类比 |
| `examples` | string[] | 是 | 至少 2 个真实场景 |
| `usage` | string | 是 | 用户为什么需要知道 |
| `memoryPoint` | string | 是 | 一句用户能记住的话 |
| `commonQuestion` | string | 是 | 用户最常问的问题 |
| `avoidMisunderstanding` | string[] | 是 | 常见误解和边界 |
| `relatedTerms` | string[] | 是 | 相关词 |
| `searchCount` | number | 是 | 搜索次数，默认 0 |
| `author` | string | 是 | `human` / `ai` |
| `reviewStatus` | string | 是 | `approved` / `pending` / `rejected` |
| `createdAt` | string | 是 | 创建日期 |
| `updatedAt` | string | 是 | 更新日期 |

推荐保留兼容字段：

| 字段 | 说明 |
| --- | --- |
| `difficultyLevel` | `beginner` / `intermediate` / `advanced` |
| `sourceType` | `official` / `community` / `business` / `internal` |
| `targetAudience` | `normal` / `business` / `developer` |
| `version` | 词条版本 |

## 四、内容规则

### summary

要求：

- 50 字以内
- 一句话解释
- 不使用复杂术语
- 用户看完能知道“它大概是什么”

示例：

```text
Token就是AI处理文字时拆出来的小单位。
```

### analogy

要求：

- 必须是生活类比
- 不要使用另一个专业概念解释专业概念
- 最好以“就像……”开头

示例：

```text
就像把一句话拆成一块块积木，AI靠这些小积木理解和生成内容。
```

### examples

要求：

- 至少 2 个真实场景
- 不能空泛
- 尽量覆盖生活、工作或产品使用

示例：

```json
[
  "长文章会消耗更多Token，所以有些AI工具会限制输入长度。",
  "调用模型API时，费用通常会和Token数量有关。"
]
```

### usage

要求：

- 回答“为什么用户需要知道”
- 说明它和用户使用 AI 的关系
- 不写空泛价值

示例：

```text
理解Token后，你会更容易看懂AI为什么有字数限制、为什么会计费、为什么长对话会被截断。
```

### memoryPoint

要求：

- 一句话
- 易记
- 可以略带口语化

示例：

```text
Token就是AI读文字时的一小口。
```

### commonQuestion

要求：

- 用用户真实会问的话
- 尽量贴近搜索输入

示例：

```text
Token是不是就等于一个字？
```

### avoidMisunderstanding

要求：

- 说明常见误解
- 说明能力边界
- 不制造恐慌

示例：

```json
[
  "Token不一定等于一个汉字或一个英文单词。",
  "不同模型的Token计算方式可能不同。"
]
```

## 五、质量标准

每个词条上线前必须按 4 个维度评分，每项 5 分。

| 维度 | 5 分标准 | 低分表现 |
| --- | --- | --- |
| 理解度 | 普通用户 30 秒内能理解 | 定义绕、术语多 |
| 类比质量 | 类比自然、准确、贴近日常 | 类比生硬或误导 |
| 准确性 | 没有明显技术错误或夸大 | 概念混淆、绝对化 |
| 实用性 | 用户知道为什么要了解 | 只解释概念，没有用途 |

上线建议：

- 单项低于 4 分：不建议直接上线
- 总平均分低于 4.5：进入二次修改
- 涉及医疗、法律、金融等高风险领域：必须人工复核

## 六、禁止内容

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
AI更可能先替代重复性强、规则清楚的部分工作，但复杂判断、沟通和责任仍需要人参与。
```

## 七、完整示例

### 示例 1：Token

```json
{
  "id": "token",
  "term": "Token",
  "aliases": ["token是什么", "tokens", "Token限制", "Token消耗"],
  "category": "基础概念类",
  "level": "入门",
  "difficultyLevel": "beginner",
  "sourceType": "internal",
  "targetAudience": "normal",
  "version": "1.0.0",
  "summary": "Token就是AI处理文字时拆出来的小单位。",
  "analogy": "就像把一句话拆成一块块积木，AI靠这些小积木理解和生成内容。",
  "examples": [
    "长文章会消耗更多Token，所以有些AI工具会限制输入长度。",
    "调用模型API时，费用通常会和输入、输出的Token数量有关。"
  ],
  "usage": "理解Token后，你会更容易看懂AI为什么有字数限制、为什么会计费、为什么长对话会被截断。",
  "memoryPoint": "Token就是AI读文字时的一小口。",
  "commonQuestion": "Token是不是就等于一个字？",
  "avoidMisunderstanding": [
    "Token不一定等于一个汉字或一个英文单词。",
    "不同模型的Token计算方式可能不同。"
  ],
  "relatedTerms": ["上下文窗口", "Prompt", "大模型"],
  "searchCount": 0,
  "author": "human",
  "reviewStatus": "approved",
  "createdAt": "2026-07-28",
  "updatedAt": "2026-07-28"
}
```

### 示例 2：Agent

```json
{
  "id": "agent",
  "term": "Agent",
  "aliases": ["agent是什么", "AI Agent", "智能体", "AI智能体"],
  "category": "基础概念类",
  "level": "入门",
  "difficultyLevel": "beginner",
  "sourceType": "internal",
  "targetAudience": "normal",
  "version": "1.0.0",
  "summary": "Agent是能围绕目标自己规划并执行任务的AI助手。",
  "analogy": "就像一个靠谱助理，你交代目标后，它会自己拆步骤、查资料、调用工具推进事情。",
  "examples": [
    "你让Agent整理会议纪要，它可以读取记录、提炼重点、生成待办。",
    "客服Agent可以先查知识库，再根据用户问题给出回答。"
  ],
  "usage": "理解Agent后，你能区分普通聊天机器人和能真正办事的AI工具，也更容易判断一个AI产品是否真的有落地价值。",
  "memoryPoint": "普通AI回答问题，Agent帮你办事。",
  "commonQuestion": "Agent和普通聊天机器人有什么区别？",
  "avoidMisunderstanding": [
    "Agent不是完全自主的真人员工，复杂任务仍需要人设定目标和检查结果。",
    "Agent调用工具时可能出错，关键操作要有确认机制。"
  ],
  "relatedTerms": ["工具调用", "Prompt", "工作流", "RAG"],
  "searchCount": 0,
  "author": "human",
  "reviewStatus": "approved",
  "createdAt": "2026-07-28",
  "updatedAt": "2026-07-28"
}
```

### 示例 3：RAG

```json
{
  "id": "rag",
  "term": "RAG",
  "aliases": ["rag是什么", "检索增强生成", "知识库问答", "RAG技术"],
  "category": "基础概念类",
  "level": "进阶",
  "difficultyLevel": "intermediate",
  "sourceType": "internal",
  "targetAudience": "normal",
  "version": "1.0.0",
  "summary": "RAG是让AI先查资料，再根据资料回答问题。",
  "analogy": "就像开卷考试，AI不是只凭记忆答题，而是先翻资料再组织答案。",
  "examples": [
    "企业客服机器人先查公司产品手册，再回答用户问题。",
    "员工问制度时，AI先检索内部文档，再给出对应解释。"
  ],
  "usage": "理解RAG后，你会知道为什么很多AI知识库能回答公司内部问题，也能判断什么时候不需要直接微调模型。",
  "memoryPoint": "RAG就是给AI一本随时能翻的资料书。",
  "commonQuestion": "RAG和微调有什么区别？",
  "avoidMisunderstanding": [
    "RAG不能保证答案永远正确，资料质量和检索结果会影响回答。",
    "RAG不是训练模型，而是让模型回答前先查外部资料。"
  ],
  "relatedTerms": ["知识库", "向量数据库", "Embedding", "微调"],
  "searchCount": 0,
  "author": "human",
  "reviewStatus": "approved",
  "createdAt": "2026-07-28",
  "updatedAt": "2026-07-28"
}
```

### 示例 4：AI客服

```json
{
  "id": "ai-customer-service",
  "term": "AI客服",
  "aliases": ["AI客服是什么", "智能客服", "客服机器人", "AI客服系统"],
  "category": "行业应用类",
  "level": "入门",
  "difficultyLevel": "beginner",
  "sourceType": "business",
  "targetAudience": "business",
  "version": "1.0.0",
  "summary": "AI客服是用AI自动回答用户常见问题的客服助手。",
  "analogy": "就像一个不休息的前台，能先接待用户、回答常见问题，再把复杂问题转给人工。",
  "examples": [
    "电商用户问退换货规则，AI客服可以根据店铺政策自动回答。",
    "软件用户问功能怎么用，AI客服可以查帮助文档后给出步骤。"
  ],
  "usage": "理解AI客服后，商家能判断哪些问题适合自动化，普通用户也能知道什么时候需要转人工。",
  "memoryPoint": "AI客服适合先处理重复问题，不适合替人做复杂承诺。",
  "commonQuestion": "AI客服能完全替代人工客服吗？",
  "avoidMisunderstanding": [
    "AI客服不适合直接处理高风险退款、赔偿、医疗、法律等判断。",
    "AI客服效果取决于知识库质量和业务流程设计。"
  ],
  "relatedTerms": ["RAG", "知识库", "Prompt", "Agent"],
  "searchCount": 0,
  "author": "human",
  "reviewStatus": "approved",
  "createdAt": "2026-07-28",
  "updatedAt": "2026-07-28"
}
```

### 示例 5：AI会不会替代工作

```json
{
  "id": "will-ai-replace-jobs",
  "term": "AI会不会替代工作",
  "aliases": ["AI会不会替代工作", "AI会抢饭碗吗", "AI会替代哪些工作", "普通人会被AI替代吗"],
  "category": "用户问题类",
  "level": "入门",
  "difficultyLevel": "beginner",
  "sourceType": "internal",
  "targetAudience": "normal",
  "version": "1.0.0",
  "summary": "AI更可能先替代重复性强的任务，而不是一次性替代所有工作。",
  "analogy": "就像洗衣机替代了手洗衣服的一部分劳动，但没有替代所有家务和家庭责任。",
  "examples": [
    "AI可以帮文案人员生成初稿，但选题判断、品牌语气和最终审核仍需要人。",
    "AI客服可以回答常见问题，但复杂投诉、情绪安抚和责任判断仍需要人工。"
  ],
  "usage": "理解这个问题后，用户可以把注意力放在学习如何和AI协作，而不是只停留在焦虑上。",
  "memoryPoint": "AI先替代任务，不是立刻替代整个人。",
  "commonQuestion": "普通人应该怎么避免被AI替代？",
  "avoidMisunderstanding": [
    "不要简单相信AI会替代所有工作。",
    "也不要认为AI完全不会影响自己的岗位。",
    "更现实的做法是识别自己工作中哪些环节会被AI辅助或自动化。"
  ],
  "relatedTerms": ["大模型", "AI工具", "AI客服", "Prompt"],
  "searchCount": 0,
  "author": "human",
  "reviewStatus": "approved",
  "createdAt": "2026-07-28",
  "updatedAt": "2026-07-28"
}
```

## 八、上线检查清单

每个词条提交审核前，必须确认：

- `summary` 是否 50 字以内
- `analogy` 是否是生活类比
- `examples` 是否至少 2 个真实场景
- `usage` 是否回答了“为什么用户需要知道”
- `memoryPoint` 是否易记
- `avoidMisunderstanding` 是否说明常见误解
- 是否没有百科复制、专业堆砌、营销语言
- 是否没有夸大 AI 能力
- 相关词是否准确

