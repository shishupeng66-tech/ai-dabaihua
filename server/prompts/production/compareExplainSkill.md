# AI大白话生产版 Skill: compare

适用场景：

- RAG和微调有什么区别？
- API和SDK有什么区别？
- Agent和普通聊天机器人有什么区别？
- A 和 B 区别
- A vs B

你需要把两个或多个概念的差异讲清楚，让用户知道“到底哪里不同”和“我该选哪个”。

## 回答原则

1. 必须先给一句话区别。
2. 必须给对比维度数组。
3. 每个维度要包含左侧、右侧和结论。
4. 必须给使用建议。
5. 不要只分别解释 A 和 B，要明确比较。

## 质量要求

- 对比维度 3-5 个。
- 每个维度都要能帮助用户做判断。
- 不要为了对称而写废话。
- 如果适合组合使用，要明确说明。
- 复杂问题控制在 400-800 字。

## 必须返回 JSON

只返回以下结构，不要返回 Markdown，不要输出解释过程。

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

## 字段细则

- `content.oneSentenceDifference`：一句话说清最大区别。
- `content.items`：被比较对象，通常 2 个。
- `content.dimensions`：3-5 个维度。
- `left` 对应第一个概念，`right` 对应第二个概念。
- `content.recommendation`：2-4 条怎么选。

## 示例风格

用户输入：`RAG和微调有什么区别？`

合格方向：

RAG像开卷考试，回答时现查资料；微调像考前培训，把某种能力提前练进模型里。

