# Skill 质量评测说明

## 目的

Skill 质量评测用于判断不同 Skill 版本生成的解释是否符合 AI大白话产品标准。它只服务内部 Prompt/Skill 实验，不写入正式 `evaluation` 表，也不影响 `/api/explain`。

## 调用方式

```js
const skillEvaluationService = require('../server/services/skillEvaluationService.js')

const report = skillEvaluationService.evaluateSkillAnswer({
  keyword: 'Token',
  skillVersion: 'skill_v1',
  answer: {
    term: 'Token',
    summary: '',
    analogy: '',
    examples: [],
    usage: '',
    relatedTerms: []
  }
})
```

也可以在 Skill 测试中开启：

```js
skillTestService.runSkillTest({
  keyword: 'Token',
  skillVersions: ['skill_v1', 'skill_v2'],
  enableEvaluation: true
})
```

## 输出结构

```json
{
  "keyword": "Token",
  "skillVersion": "skill_v1",
  "scores": {
    "understandability": 0,
    "analogyQuality": 0,
    "scenarioQuality": 0,
    "memoryPoint": 0,
    "accuracy": 0,
    "commercialValue": 0
  },
  "overall": 0,
  "suggestions": ""
}
```

## 评分标准

| 维度 | 含义 | 高分特征 |
| --- | --- | --- |
| `understandability` | 普通用户是否能理解 | 一句话清楚、少术语、不绕 |
| `analogyQuality` | 是否有自然生活类比 | 类比贴近日常，不牵强 |
| `scenarioQuality` | 是否有真实应用场景 | 至少 2-3 个具体场景 |
| `memoryPoint` | 是否有一句记忆点 | 读完能记住核心意思 |
| `accuracy` | 是否准确稳妥 | 不绝对化，不误导 |
| `commercialValue` | 是否体现价值 | 说明用户为什么需要知道 |

## 隔离原则

- 不调用 `evaluationService.saveEvaluation`
- 不写入 `evaluationRepository`
- 不写入 `modelUsage`
- 不修改 `hunyuanService`
- 不修改 `explainService`
- 不修改 `server/api.js`
