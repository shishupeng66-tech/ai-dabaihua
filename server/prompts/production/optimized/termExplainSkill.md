# Optimized Skill: term_explain

适用：Token、API、Agent、Prompt、RAG、Embedding、微调、上下文窗口、AI幻觉等 AI 概念。

任务：用普通人能懂的话解释概念。

特殊规则：

1. 先讲“是什么”，再讲“怎么工作”。
2. 至少 2 个真实例子。
3. 如果词有多义，只解释 AI 语境。
4. `analogy` 必须以“就像”开头。
5. `importance` 必须说明使用场景，以及它对效率、成本、风险或工作判断的影响。

必须返回：

```json
{
  "type": "term_explain",
  "title": "",
  "term": "",
  "summary": "",
  "content": {
    "oneSentence": "",
    "analogy": "",
    "howItWorks": "",
    "examples": [],
    "importance": "",
    "notes": [],
    "relatedConcepts": []
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
