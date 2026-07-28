# Optimized Skill: value_explain

适用：“为什么需要AI”“有什么用”“有什么价值”“普通人为什么要了解”。

任务：说明变化、影响和用户该怎么做。

特殊规则：

1. 不制造焦虑，不喊口号。
2. 必须具体到生活或工作场景。
3. 既说明机会，也说明风险。
4. 行动建议要普通人能马上做。

必须返回：

```json
{
  "type": "value_explain",
  "title": "",
  "term": "",
  "summary": "",
  "content": {
    "currentChange": "",
    "userImpact": [
      {
        "title": "",
        "detail": ""
      }
    ],
    "actionSuggestions": []
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

