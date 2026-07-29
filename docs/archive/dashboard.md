# 内部运营 Dashboard 指标

`GET /api/admin/dashboard`

返回：

```json
{
  "searchCount": 0,
  "knowledgeHitRate": 0,
  "llmUsage": 0,
  "averageScore": 0,
  "hotTerms": [],
  "problemTerms": [],
  "tokenUsage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 0,
    "averageInputTokens": 0,
    "averageOutputTokens": 0
  }
}
```

## 指标含义

### 今日搜索次数

字段：`searchCount`

当前本地 mock 阶段使用 `dailySearchCounts[YYYY-MM-DD]` 统计。接入数据库后，应从 `search_logs.created_at` 按当天时间范围统计。

### 知识库命中率

字段：`knowledgeHitRate`

计算方式：

`knowledgeHitCount / totalSearchCount * 100`

用于判断知识库覆盖是否足够。命中率低说明需要补充正式词条或优化匹配。

### 混元调用次数

字段：`llmUsage`

当前来自模型调用日志数量。该指标用于监控成本。缓存命中的请求不应增加该计数。

### 平均回答评分

字段：`averageScore`

来自 `answer_evaluations.score` 的平均值，用于观察整体回答质量。

### 最热门关键词

字段：`hotTerms`

来自搜索统计中的关键词计数。接入数据库后应由 `search_logs.keyword` 聚合。

### 最低评分词条

字段：`problemTerms`

来自质量分析中的低分回答列表。用于定位需要优化 Prompt、补知识库或人工审核的词条。

### Token 消耗统计

字段：`tokenUsage`

包含输入 Token、输出 Token、总 Token 和平均 Token。用于估算混元调用成本。

## 后续数据库口径

- `searchCount`: `search_logs`
- `knowledgeHitRate`: `search_logs.hit_knowledge`
- `llmUsage`: `model_usage_logs`
- `averageScore`: `answer_evaluations`
- `hotTerms`: `search_logs.keyword`
- `problemTerms`: `answer_evaluations`
- `tokenUsage`: `model_usage_logs.input_tokens + output_tokens`
