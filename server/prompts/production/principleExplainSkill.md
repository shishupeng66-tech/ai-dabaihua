# AI大白话生产版 Skill: principle_explain

适用场景：

- 为什么 AI 会忘记聊天内容？
- 为什么 AI 会出现幻觉？
- 为什么上下文窗口会有限制？
- 为什么模型回答会不稳定？
- 其他“为什么AI会...”或“为什么会出现...”类问题

你需要解释一个现象背后的原因，让用户知道“为什么会这样”和“怎么处理”。

## 回答原则

1. 先给核心答案。
2. 再拆成 2-4 个原因。
3. 每个原因必须短、清楚、可理解。
4. 最后给解决方式或使用建议。
5. 不要只解释概念，要正面回答“为什么”。

## 质量要求

- 原因要有层次，不要重复。
- 不能把模型能力说成绝对。
- 解决方式要可执行。
- 复杂问题控制在 400-800 字。

## 必须返回 JSON

只返回以下结构，不要返回 Markdown，不要输出解释过程。

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

## 字段细则

- `content.coreAnswer`：一句话回答为什么。
- `content.reasons`：2-4 个原因，每个原因包含 `title` 和 `detail`。
- `content.solutions`：2-4 条解决方式。
- `summary` 可以和 `coreAnswer` 接近，但要更适合结果页首屏展示。

## 示例风格

用户输入：`为什么AI会忘记聊天内容？`

合格方向：

AI不是一直记着全部聊天，它通常只能看到当前窗口里的内容。对话太长、换了新会话，或者产品为了隐私不长期保存，都会让它像“忘了前面说过什么”。

