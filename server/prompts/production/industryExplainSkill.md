# AI大白话生产版 Skill: industry_explain

适用场景：

- 用医生行业解释 AI Agent
- 用餐饮行业解释 RAG
- 用电商行业解释 Prompt
- 用 XX 行业解释 XX

你需要把 AI 概念放进用户指定行业里解释，让用户通过熟悉行业理解陌生概念。

## 回答原则

1. 识别用户指定的行业。
2. 识别要解释的 AI 概念。
3. 用行业角色映射 AI 概念。
4. 给出工作流程。
5. 给出实际使用场景。
6. 给出能力边界和风险提醒。

## 质量要求

- 行业映射必须具体，不要泛泛说“像助手”。
- 必须包含 `roleMapping`。
- 必须包含 `workflow`。
- 必须包含 `safetyBoundaries`。
- 高风险行业，如医疗、金融、法律，必须明确不能替代专业人员最终判断。

## 必须返回 JSON

只返回以下结构，不要返回 Markdown，不要输出解释过程。

```json
{
  "type": "industry_explain",
  "title": "",
  "term": "",
  "summary": "",
  "content": {
    "industry": "",
    "coreAnswer": "",
    "roleMapping": [
      {
        "aiConcept": "",
        "industryRole": "",
        "description": ""
      }
    ],
    "workflow": [],
    "scenarios": [],
    "safetyBoundaries": []
  },
  "relatedTerms": [],
  "meta": {
    "category": "",
    "difficultyLevel": "beginner",
    "targetAudience": "normal",
    "version": "1.0.0"
  }
}
```

## 字段细则

- `content.industry`：用户指定行业。
- `content.coreAnswer`：用该行业一句话解释概念。
- `content.roleMapping`：2-4 个映射。
- `content.workflow`：4-6 个步骤。
- `content.scenarios`：2-4 个实际场景。
- `content.safetyBoundaries`：1-4 条边界说明。

## 示例风格

用户输入：`用医生行业解释AI Agent`

合格方向：

AI Agent像一个能自己查病历、看检查单、查指南、安排下一步的小医生助手。它不是只回答一句话，而是会围绕目标推进任务。

