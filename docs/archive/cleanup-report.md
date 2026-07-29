# AI大白话项目清理报告

## 清理目标

为后续知识库后端重构保留一条干净的解释链路：

```text
keyword
  ↓
server/api.js
  ↓
explainService
  ↓
knowledgeService
  ↓
knowledgeRepository
  ↓
utils/knowledge + knowledgeLoader
  ↓
data/knowledge/terms.json
  ↓
命中：返回 knowledge
未命中：调用 hunyuanService
```

## 删除文件列表

### Skill / Pipeline 实验代码

- `server/prompts/skills/`
- `server/prompts/production/`
- `server/services/explanationPipelineService.js`
- `server/services/skillSelectorService.js`
- `server/services/skillEvaluationService.js`
- `server/services/skillTestService.js`
- `server/services/intentRouterService.js`

### 实验测试代码

- `tests/pages/result-normalize.test.js`
- `tests/services/explainService.v2.test.js`
- `tests/services/explanationPipelineService.test.js`
- `tests/services/intentRouterService.test.js`

### 旧 data 实验文件

- `data/schema.js`

## 迁移文件列表

### 知识库数据

- `data/knowledge.json` -> `data/knowledge/terms.json`
- `data/version.json` -> `data/knowledge/version.json`
- `data/pending.json` -> `data/knowledge/pending.json` empty seed file

### 实验文档归档

以下文档已移动到 `docs/archive/`：

- `docs/ai-explanation-schema-v1.md`
- `docs/result-page-v2-design.md`
- `docs/result-page-v2-test-report.md`
- `docs/skill-evaluation.md`
- `docs/skill-test.md`
- `docs/skill-test-result-v1.md`
- `docs/test-cases.md`

## 保留文件列表

### API 与核心服务

- `server/api.js`
- `server/services/explainService.js`
- `server/services/knowledgeService.js`
- `server/services/hunyuanService.js`
- `server/services/explainModeService.js`

### Repository

- `server/repositories/knowledgeRepository.js`
- `server/repositories/searchLogRepository.js`
- `server/repositories/modelUsageRepository.js`
- `server/repositories/evaluationRepository.js`
- `server/repositories/favoriteRepository.js`

### 配置

- `config/env.js`

### 知识库加载

- `utils/knowledge.js`
- `utils/knowledgeLoader.js`
- `data/knowledge/terms.json`
- `data/knowledge/version.json`
- `data/knowledge/pending.json`

## 当前后端结构树

```text
server/
  api.js
  database/
    connection.js
    repositoryFactory.js
  models/
    answerEvaluation.js
    errorLog.js
    favorite.js
    knowledge.js
    knowledgeVersion.js
    modelUsage.js
    pending.js
    promptVersion.js
    searchLog.js
    user.js
  prompts/
    businessPrompt.js
    comparePrompt.js
    developerPrompt.js
    explainPrompt.js
  repositories/
    evaluationRepository.js
    favoriteRepository.js
    knowledgeRepository.js
    modelUsageRepository.js
    pendingRepository.js
    searchLogRepository.js
    userRepository.js
  services/
    analyticsService.js
    authService.js
    batchContentService.js
    dashboardService.js
    evaluationService.js
    explainModeService.js
    explainService.js
    favoriteService.js
    healthService.js
    hunyuanService.js
    knowledgeProductionService.js
    knowledgeService.js
    loggerService.js
    modelUsageService.js
    performanceService.js
    promptTestService.js
    publishService.js
    qualityAnalyticsService.js
```

## 当前知识库加载流程

```text
/api/explain
  ↓
server/api.js postExplain()
  ↓
server/services/explainService.explain()
  ↓
server/services/knowledgeService.searchKnowledge()
  ↓
server/repositories/knowledgeRepository.searchKnowledge()
  ↓
utils/knowledge.searchKnowledge()
  ↓
utils/knowledgeLoader.loadKnowledge()
  ↓
data/knowledge/terms.json
```

命中知识库时返回：

```json
{
  "success": true,
  "source": "knowledge",
  "matchType": "exact",
  "score": 100,
  "data": {}
}
```

未命中知识库时：

```text
explainService
  ↓
hunyuanService.explain()
  ↓
CloudBase AI Gateway hy3
  ↓
modelUsageService + evaluationService
  ↓
返回 source=llm
```

## 前端影响

本次未修改：

- `pages/index/`
- `pages/result/`
- 微信小程序页面结构
- result 页面 UI
- result 页面 API 调用逻辑
