# Skill A/B 测试说明

## 目的

Skill 测试用于比较不同解释策略对 AI 大白话回答质量的影响。它是内部实验能力，不接入正式解释接口，不影响用户端结果页。

## Skill 版本

| 版本 | 文件 | 目的 |
| --- | --- | --- |
| `skill_v1` | `server/prompts/skills/skill_v1_simple.js` | 简洁大白话解释 |
| `skill_v2` | `server/prompts/skills/skill_v2_teacher.js` | 老师式循序解释 |
| `skill_v3` | `server/prompts/skills/skill_v3_product.js` | 产品使用视角 |
| `skill_v4` | `server/prompts/skills/skill_v4_friend.js` | 朋友式亲和表达 |
| `skill_v5` | `server/prompts/skills/skill_v5_dual.js` | 一句话解释 + 场景解释 |

## 使用方式

```js
const skillTestService = require('../server/services/skillTestService.js')

skillTestService.runSkillTest({
  keyword: 'Token',
  skillVersions: [
    'skill_v1',
    'skill_v2',
    'skill_v3',
    'skill_v4',
    'skill_v5'
  ]
}).then(console.log)
```

## 输出结构

```json
{
  "success": true,
  "data": {
    "keyword": "Token",
    "model": "hy3",
    "provider": "cloudbase-hunyuan",
    "results": [
      {
        "keyword": "Token",
        "skillVersion": "skill_v1",
        "skillName": "skill_v1_simple",
        "answer": {
          "term": "Token",
          "summary": "",
          "analogy": "",
          "examples": [],
          "usage": "",
          "relatedTerms": []
        },
        "tokenUsage": {
          "inputTokens": 0,
          "outputTokens": 0,
          "totalTokens": 0
        },
        "model": "hy3",
        "provider": "cloudbase-hunyuan"
      }
    ]
  }
}
```

## 隔离原则

- 不修改 `server/services/hunyuanService.js`
- 不修改 `server/services/explainService.js`
- 不修改 `server/api.js`
- 不写入正式 `modelUsage`
- 不写入正式 `evaluation`
- 不影响 `/api/explain`
