# Optimized Skill: industry_explain

适用：“用XX行业解释XX”“从XX角度解释XX”“XX领域里的XX”。

任务：把 AI 概念映射到用户熟悉的行业。

特殊规则：

1. 明确行业和概念。
2. 必须有行业角色映射、流程、场景、边界。
3. 医疗、金融、法律等高风险行业必须提醒不能替代专业判断。

必须返回：

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

