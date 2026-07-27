# 腾讯混元模型调用策略

AI大白话统一使用腾讯混元作为模型能力来源。业务代码不能绕过 `server/services/hunyuanService.js` 直接调用模型。

## 优先级

1. `knowledge.json`

优先查询正式知识库。命中 `exact`、`alias` 或 `keyword` 时直接返回知识库内容，不调用混元。

2. 知识库组合解释

当用户问题涉及多个已知词条时，后续可由 `explainService` 聚合多个知识库词条，生成组合解释。第一版暂不实现，只保留策略位置。

3. 腾讯混元生成

未命中知识库或判断为复杂问题时，调用 `hunyuanService.explain(keyword)`。模型结果只作为实时解释或待审核草稿。

4. 人工审核进入知识库

用户未命中的关键词进入 `pending_terms`。AI 只生成草稿，必须经过人工审核后，才能进入正式知识库。

## 服务边界

- `server/api.js`：只做参数校验和 service 调用
- `explainService.js`：决定知识库优先还是混元兜底
- `knowledgeService.js`：统一知识库查询和推荐
- `hunyuanService.js`：唯一模型调用入口
- `analyticsService.js`：记录搜索、反馈和统计
