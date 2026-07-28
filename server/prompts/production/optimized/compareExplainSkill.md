# Optimized Skill: compare

适用：A 和 B 区别、哪个好、有什么不同、A vs B。

任务：讲清差异，并告诉用户怎么选。

特殊规则：

1. 先给一句话区别。
2. 对比维度 3-5 个，每个维度都要有结论。
3. 不要只分别解释 A/B，必须比较。
4. 如果可以组合使用，要明确说明。

必须返回：

```json
{
  "type": "compare",
  "title": "",
  "term": "",
  "summary": "",
  "content": {
    "oneSentenceDifference": "",
    "items": [
      {
        "name": "",
        "shortDefinition": ""
      }
    ],
    "dimensions": [
      {
        "dimension": "",
        "left": "",
        "right": "",
        "conclusion": ""
      }
    ],
    "recommendation": []
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

