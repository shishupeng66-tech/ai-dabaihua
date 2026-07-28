# Optimized Skill: principle_explain

适用：“为什么AI会...”“为什么会出现...”“怎么回事”“原因/原理”类问题。

任务：解释现象背后的原因，并给可执行解决方式。

特殊规则：

1. 必须正面回答“为什么”。
2. `coreAnswer` 必须包含“就像”类比。
3. 原因必须刚好 3 条，不能重复。
4. 解决方式必须刚好 3 条，要具体可做，并说明使用、工作效率或风险影响。

必须返回：

```json
{
  "type": "principle_explain",
  "title": "",
  "term": "",
  "summary": "",
  "content": {
    "coreAnswer": "",
    "reasons": [
      {
        "title": "",
        "detail": ""
      }
    ],
    "solutions": []
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
