# AI大白话生产版解释数据协议 v1

## 目标

本协议用于统一 AI大白话后续所有解释结果的数据结构，让知识库命中结果和 LLM 生成结果可以用同一套格式返回，并支持结果页按 `type` 动态渲染不同组件。

支持 6 种解释模式：

| type | 场景 | 示例输入 |
| --- | --- | --- |
| `term_explain` | 普通概念解释 | `Token`、`API`、`Agent` |
| `principle_explain` | 原理解释 | `为什么AI会忘记聊天内容？` |
| `industry_explain` | 行业解释 | `用医生行业解释AI Agent` |
| `compare` | 对比解释 | `RAG和微调有什么区别？` |
| `value_explain` | 价值解释 | `普通人为什么需要了解大模型？` |
| `learning_plan` | 学习规划 | `我想做AI客服，需要学习什么？` |

## 统一返回格式

所有解释结果统一返回以下结构：

```json
{
  "success": true,
  "source": "knowledge",
  "matchType": "exact",
  "score": 100,
  "data": {
    "type": "term_explain",
    "title": "Token是什么？",
    "term": "Token",
    "summary": "Token就是AI理解文字时拆开的最小单位。",
    "content": {},
    "relatedTerms": [],
    "meta": {
      "id": "token",
      "category": "大模型基础",
      "difficultyLevel": "beginner",
      "targetAudience": "normal",
      "version": "1.0.0",
      "updatedAt": "2026-07-28T00:00:00.000Z"
    }
  }
}
```

## 顶层字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `success` | boolean | 是 | 请求是否成功 |
| `source` | string | 是 | 数据来源：`knowledge`、`llm`、`cache` |
| `matchType` | string | 否 | 知识库匹配类型：`exact`、`alias`、`keyword`、`semantic`、`none` |
| `score` | number | 否 | 知识库匹配分数或置信度 |
| `cacheHit` | boolean | 否 | 是否命中模型结果缓存 |
| `data` | object | 是 | 统一解释数据 |
| `error` | object | 否 | 失败时返回错误信息 |

## data 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 是 | 解释模式 |
| `title` | string | 是 | 结果页标题 |
| `term` | string | 否 | 标准词条名；问题类输入可为空或填核心主题 |
| `summary` | string | 是 | 一句话解释，用于结果页首屏摘要 |
| `content` | object | 是 | 按 `type` 区分的正文结构 |
| `relatedTerms` | string[] | 否 | 相关概念 |
| `meta` | object | 否 | 分类、版本、难度、受众等元信息 |

## content 结构

### 1. term_explain

用于普通概念解释。

```json
{
  "oneSentence": "Token就是AI理解文字时拆开的最小单位。",
  "analogy": "可以理解成乐高积木，AI把一句话拆成一块块小积木来处理。",
  "howItWorks": "模型不会直接按整句话理解文字，而是先把文字拆成Token，再根据这些Token预测后续内容。",
  "examples": [
    "“你好”可能会被拆成“你”和“好”两个Token。",
    "长文章会消耗更多Token，因此可能受到上下文窗口限制。"
  ],
  "importance": "理解Token可以帮助你判断AI为什么有字数限制、为什么会计费、为什么长对话会被截断。",
  "notes": [
    "Token不一定等于一个汉字或一个英文单词。",
    "不同模型的Token拆分规则可能不同。"
  ],
  "relatedConcepts": [
    "上下文窗口",
    "Prompt",
    "大模型"
  ]
}
```

### 2. principle_explain

用于解释原因、机制、原理。

```json
{
  "coreAnswer": "AI会忘记聊天内容，主要是因为它一次只能看到有限长度的上下文。",
  "reasons": [
    {
      "title": "上下文窗口有限",
      "detail": "对话太长后，前面的内容可能超出模型能看到的范围。"
    },
    {
      "title": "新会话不会自动继承旧会话",
      "detail": "很多产品会把不同会话隔离，避免信息混在一起。"
    },
    {
      "title": "隐私和成本限制",
      "detail": "长期保存全部聊天记录会增加隐私风险和计算成本。"
    }
  ],
  "solutions": [
    "在长对话中主动总结前文。",
    "把关键背景重新告诉AI。",
    "使用支持长期记忆或知识库的产品能力。"
  ]
}
```

### 3. industry_explain

用于按指定行业解释概念。

```json
{
  "industry": "医生行业",
  "coreAnswer": "AI Agent像一个会自己查资料、做判断、安排下一步的小医生助手。",
  "roleMapping": [
    {
      "aiConcept": "目标",
      "industryRole": "医生接到诊疗任务",
      "description": "用户给Agent一个目标，就像病人提出一个需要处理的问题。"
    },
    {
      "aiConcept": "工具调用",
      "industryRole": "查病历、看检查单、查指南",
      "description": "Agent会调用工具获取信息，而不是只靠一句话回答。"
    },
    {
      "aiConcept": "执行",
      "industryRole": "给出建议或安排流程",
      "description": "Agent会把任务拆解并推进。"
    }
  ],
  "workflow": [
    "接收目标",
    "收集必要信息",
    "判断下一步",
    "调用工具或资料",
    "输出建议或执行结果"
  ],
  "scenarios": [
    "智能导诊",
    "用药提醒",
    "病例资料整理"
  ],
  "safetyBoundaries": [
    "医疗场景不能把AI建议当作最终诊断。",
    "涉及治疗、用药、检查结果时必须由专业医生确认。"
  ]
}
```

### 4. compare

用于两个或多个概念对比。

```json
{
  "oneSentenceDifference": "RAG像给AI外挂资料库现查现用，微调像重新训练AI让它内化某种能力。",
  "items": [
    {
      "name": "RAG",
      "shortDefinition": "先检索外部资料，再生成答案。"
    },
    {
      "name": "微调",
      "shortDefinition": "用特定数据继续训练模型，让模型适应任务或风格。"
    }
  ],
  "dimensions": [
    {
      "dimension": "知识更新",
      "left": "适合频繁更新的资料",
      "right": "更新成本较高",
      "conclusion": "资料经常变，优先选RAG。"
    },
    {
      "dimension": "成本",
      "left": "通常成本更低",
      "right": "训练和维护成本更高",
      "conclusion": "预算有限先考虑RAG。"
    },
    {
      "dimension": "能力改变",
      "left": "主要补充外部知识",
      "right": "可以改变模型风格和任务能力",
      "conclusion": "想改变模型说话方式或专业能力，可考虑微调。"
    }
  ],
  "recommendation": [
    "做企业知识库问答，优先RAG。",
    "让模型长期保持某种专业语气或固定任务能力，再考虑微调。",
    "实际项目中两者可以组合使用。"
  ]
}
```

### 5. value_explain

用于解释“为什么需要知道”。

```json
{
  "currentChange": "大模型正在进入搜索、办公、客服、教育、创作等日常工具。",
  "userImpact": [
    {
      "title": "提高效率",
      "detail": "会用大模型的人可以更快写文档、查资料、整理思路。"
    },
    {
      "title": "避免被误导",
      "detail": "了解AI幻觉和生成内容风险，可以降低被骗或误用的概率。"
    },
    {
      "title": "跟上工作变化",
      "detail": "很多岗位会逐渐要求能使用AI工具。"
    }
  ],
  "actionSuggestions": [
    "先学会向AI清楚提问。",
    "把AI用于一个具体工作场景，比如写周报或整理客服话术。",
    "对AI输出保持核查习惯。"
  ]
}
```

### 6. learning_plan

用于学习路径、入门规划。

```json
{
  "goal": "做一个能回答常见问题的AI客服。",
  "stages": [
    {
      "stage": "第一阶段",
      "title": "理解业务问题",
      "tasks": [
        "整理用户最常问的50个问题。",
        "写出标准答案和禁答范围。"
      ],
      "output": "一份客服知识库草稿。"
    },
    {
      "stage": "第二阶段",
      "title": "学习AI客服基础",
      "tasks": [
        "理解Prompt、知识库、RAG、上下文窗口。",
        "试用一个现成AI客服平台。"
      ],
      "output": "能配置一个基础问答机器人。"
    },
    {
      "stage": "第三阶段",
      "title": "上线和优化",
      "tasks": [
        "收集用户真实问题。",
        "统计答错、答不出、答太慢的问题。",
        "持续补充知识库。"
      ],
      "output": "可持续优化的AI客服流程。"
    }
  ],
  "pitfalls": [
    "不要一开始就追求训练模型。",
    "不要忽视业务知识整理。",
    "不要让AI直接处理高风险承诺、退款、医疗、法律等问题。"
  ]
}
```

## 知识库和 LLM 返回统一规则

知识库命中和 LLM 生成必须返回同样的 `data` 结构。

区别只体现在顶层来源字段：

```json
{
  "success": true,
  "source": "knowledge",
  "matchType": "exact",
  "score": 100,
  "data": {}
}
```

```json
{
  "success": true,
  "source": "llm",
  "matchType": "none",
  "score": 0,
  "cacheHit": false,
  "data": {}
}
```

推荐规则：

1. 业务层只判断 `success` 和 `data.type`。
2. 结果页不直接判断知识库字段或 LLM 字段。
3. 知识库词条需要提前存储对应 `type` 和 `content`。
4. LLM fallback 必须按同一协议生成结构化 JSON。
5. 旧字段如 `explanation`、`analogy`、`examples` 可在迁移期映射到 `content` 内，不建议继续作为主字段扩展。

## result 页面动态渲染建议

结果页可以按 `data.type` 选择组件：

| type | 推荐组件 |
| --- | --- |
| `term_explain` | 概念解释卡、类比卡、案例列表、注意事项、相关词 |
| `principle_explain` | 核心答案卡、原因列表、解决方式列表 |
| `industry_explain` | 行业说明卡、角色映射表、流程步骤、安全边界 |
| `compare` | 一句话区别卡、对比表、使用建议 |
| `value_explain` | 当前变化卡、影响列表、行动建议 |
| `learning_plan` | 目标卡、阶段时间线、避坑建议 |

渲染原则：

1. `title` 和 `summary` 始终显示在顶部。
2. `content` 内字段按 `type` 渲染，不做大段文字堆叠。
3. 数组字段优先用列表、步骤、表格、标签展示。
4. 字段缺失时组件应自动隐藏。
5. `relatedTerms` 始终可作为底部推荐词渲染。

## 完整 JSON 示例

### term_explain 示例

```json
{
  "success": true,
  "source": "knowledge",
  "matchType": "exact",
  "score": 100,
  "cacheHit": false,
  "data": {
    "type": "term_explain",
    "title": "Token是什么？",
    "term": "Token",
    "summary": "Token就是AI理解文字时拆开的最小单位。",
    "content": {
      "oneSentence": "Token就是AI理解文字时拆开的最小单位。",
      "analogy": "可以理解成乐高积木，AI把一句话拆成一块块小积木来处理。",
      "howItWorks": "模型不会直接按整句话理解文字，而是先把文字拆成Token，再根据这些Token预测后续内容。",
      "examples": [
        "“你好”可能会被拆成“你”和“好”两个Token。",
        "长文章会消耗更多Token，因此可能受到上下文窗口限制。"
      ],
      "importance": "理解Token可以帮助你判断AI为什么有字数限制、为什么会计费、为什么长对话会被截断。",
      "notes": [
        "Token不一定等于一个汉字或一个英文单词。",
        "不同模型的Token拆分规则可能不同。"
      ],
      "relatedConcepts": [
        "上下文窗口",
        "Prompt",
        "大模型"
      ]
    },
    "relatedTerms": [
      "上下文窗口",
      "Prompt",
      "大模型"
    ],
    "meta": {
      "id": "token",
      "category": "大模型基础",
      "difficultyLevel": "beginner",
      "targetAudience": "normal",
      "version": "1.0.0",
      "updatedAt": "2026-07-28T00:00:00.000Z"
    }
  }
}
```

### principle_explain 示例

```json
{
  "success": true,
  "source": "llm",
  "matchType": "none",
  "score": 0,
  "cacheHit": false,
  "data": {
    "type": "principle_explain",
    "title": "为什么AI会忘记聊天内容？",
    "term": "上下文窗口",
    "summary": "AI会忘记聊天内容，主要是因为它一次只能看到有限长度的上下文。",
    "content": {
      "coreAnswer": "AI会忘记聊天内容，主要是因为它一次只能看到有限长度的上下文。",
      "reasons": [
        {
          "title": "上下文窗口有限",
          "detail": "对话太长后，前面的内容可能超出模型能看到的范围。"
        },
        {
          "title": "新会话隔离",
          "detail": "很多产品会把不同会话隔离，避免信息混在一起。"
        },
        {
          "title": "隐私和成本限制",
          "detail": "长期保存全部聊天记录会增加隐私风险和计算成本。"
        }
      ],
      "solutions": [
        "在长对话中主动总结前文。",
        "把关键背景重新告诉AI。",
        "使用支持长期记忆或知识库的产品能力。"
      ]
    },
    "relatedTerms": [
      "上下文窗口",
      "长期记忆",
      "Prompt"
    ],
    "meta": {
      "category": "AI使用常识",
      "difficultyLevel": "beginner",
      "targetAudience": "normal",
      "version": "1.0.0"
    }
  }
}
```

### industry_explain 示例

```json
{
  "success": true,
  "source": "llm",
  "matchType": "none",
  "score": 0,
  "cacheHit": true,
  "data": {
    "type": "industry_explain",
    "title": "用医生行业解释AI Agent",
    "term": "AI Agent",
    "summary": "AI Agent像一个会自己查资料、做判断、安排下一步的小医生助手。",
    "content": {
      "industry": "医生行业",
      "coreAnswer": "AI Agent像一个会自己查资料、做判断、安排下一步的小医生助手。",
      "roleMapping": [
        {
          "aiConcept": "目标",
          "industryRole": "医生接到诊疗任务",
          "description": "用户给Agent一个目标，就像病人提出一个需要处理的问题。"
        },
        {
          "aiConcept": "工具调用",
          "industryRole": "查病历、看检查单、查指南",
          "description": "Agent会调用工具获取信息，而不是只靠一句话回答。"
        }
      ],
      "workflow": [
        "接收目标",
        "收集必要信息",
        "判断下一步",
        "调用工具或资料",
        "输出建议或执行结果"
      ],
      "scenarios": [
        "智能导诊",
        "用药提醒",
        "病例资料整理"
      ],
      "safetyBoundaries": [
        "医疗场景不能把AI建议当作最终诊断。",
        "涉及治疗、用药、检查结果时必须由专业医生确认。"
      ]
    },
    "relatedTerms": [
      "Agent",
      "工具调用",
      "工作流"
    ],
    "meta": {
      "category": "AI应用",
      "difficultyLevel": "intermediate",
      "targetAudience": "normal",
      "version": "1.0.0"
    }
  }
}
```

### compare 示例

```json
{
  "success": true,
  "source": "llm",
  "matchType": "none",
  "score": 0,
  "cacheHit": false,
  "data": {
    "type": "compare",
    "title": "RAG和微调有什么区别？",
    "term": "RAG vs 微调",
    "summary": "RAG像给AI外挂资料库现查现用，微调像重新训练AI让它内化某种能力。",
    "content": {
      "oneSentenceDifference": "RAG像给AI外挂资料库现查现用，微调像重新训练AI让它内化某种能力。",
      "items": [
        {
          "name": "RAG",
          "shortDefinition": "先检索外部资料，再生成答案。"
        },
        {
          "name": "微调",
          "shortDefinition": "用特定数据继续训练模型，让模型适应任务或风格。"
        }
      ],
      "dimensions": [
        {
          "dimension": "知识更新",
          "left": "适合频繁更新的资料",
          "right": "更新成本较高",
          "conclusion": "资料经常变，优先选RAG。"
        },
        {
          "dimension": "成本",
          "left": "通常成本更低",
          "right": "训练和维护成本更高",
          "conclusion": "预算有限先考虑RAG。"
        }
      ],
      "recommendation": [
        "做企业知识库问答，优先RAG。",
        "让模型长期保持某种专业语气或固定任务能力，再考虑微调。",
        "实际项目中两者可以组合使用。"
      ]
    },
    "relatedTerms": [
      "RAG",
      "微调",
      "知识库"
    ],
    "meta": {
      "category": "大模型应用",
      "difficultyLevel": "intermediate",
      "targetAudience": "developer",
      "version": "1.0.0"
    }
  }
}
```

### value_explain 示例

```json
{
  "success": true,
  "source": "llm",
  "matchType": "none",
  "score": 0,
  "cacheHit": false,
  "data": {
    "type": "value_explain",
    "title": "普通人为什么需要了解大模型？",
    "term": "大模型",
    "summary": "普通人了解大模型，是为了更好使用AI工具、避免被误导，并跟上工作和生活方式的变化。",
    "content": {
      "currentChange": "大模型正在进入搜索、办公、客服、教育、创作等日常工具。",
      "userImpact": [
        {
          "title": "提高效率",
          "detail": "会用大模型的人可以更快写文档、查资料、整理思路。"
        },
        {
          "title": "避免被误导",
          "detail": "了解AI幻觉和生成内容风险，可以降低被骗或误用的概率。"
        }
      ],
      "actionSuggestions": [
        "先学会向AI清楚提问。",
        "把AI用于一个具体工作场景，比如写周报或整理客服话术。",
        "对AI输出保持核查习惯。"
      ]
    },
    "relatedTerms": [
      "大模型",
      "Prompt",
      "AI幻觉"
    ],
    "meta": {
      "category": "AI通识",
      "difficultyLevel": "beginner",
      "targetAudience": "normal",
      "version": "1.0.0"
    }
  }
}
```

### learning_plan 示例

```json
{
  "success": true,
  "source": "llm",
  "matchType": "none",
  "score": 0,
  "cacheHit": false,
  "data": {
    "type": "learning_plan",
    "title": "我想做AI客服，需要学习什么？",
    "term": "AI客服",
    "summary": "做AI客服，先学业务问题整理，再学知识库、Prompt、对话流程和上线后的持续优化。",
    "content": {
      "goal": "做一个能回答常见问题的AI客服。",
      "stages": [
        {
          "stage": "第一阶段",
          "title": "理解业务问题",
          "tasks": [
            "整理用户最常问的50个问题。",
            "写出标准答案和禁答范围。"
          ],
          "output": "一份客服知识库草稿。"
        },
        {
          "stage": "第二阶段",
          "title": "学习AI客服基础",
          "tasks": [
            "理解Prompt、知识库、RAG、上下文窗口。",
            "试用一个现成AI客服平台。"
          ],
          "output": "能配置一个基础问答机器人。"
        },
        {
          "stage": "第三阶段",
          "title": "上线和优化",
          "tasks": [
            "收集用户真实问题。",
            "统计答错、答不出、答太慢的问题。",
            "持续补充知识库。"
          ],
          "output": "可持续优化的AI客服流程。"
        }
      ],
      "pitfalls": [
        "不要一开始就追求训练模型。",
        "不要忽视业务知识整理。",
        "不要让AI直接处理高风险承诺、退款、医疗、法律等问题。"
      ]
    },
    "relatedTerms": [
      "AI客服",
      "RAG",
      "知识库",
      "Prompt"
    ],
    "meta": {
      "category": "AI落地",
      "difficultyLevel": "beginner",
      "targetAudience": "business",
      "version": "1.0.0"
    }
  }
}
```

## 兼容建议

迁移期可以把旧字段映射到新结构：

| 旧字段 | 新字段 |
| --- | --- |
| `explanation` | `summary` 或 `content.oneSentence` |
| `analogy` | `content.analogy` |
| `examples` | `content.examples` 或对应 type 的场景字段 |
| `usage` | `content.importance`、`content.userImpact` 或 `content.actionSuggestions` |
| `relatedTerms` | `data.relatedTerms` |

最终生产版应以本协议为主，不再让 result 页面直接依赖散落字段。
