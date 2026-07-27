# AI大白话 API 规范

## 解释 AI 术语

`POST /api/explain`

### Request

```json
{
  "keyword": "Token"
}
```

### Response

```json
{
  "success": true,
  "source": "knowledge",
  "matchType": "exact",
  "score": 100,
  "term": "Token",
  "content": {
    "id": "token",
    "term": "Token",
    "aliases": ["token是什么", "tokens", "令牌"],
    "category": "大模型基础",
    "level": "入门",
    "summary": "Token就是AI理解文字时拆开的最小单位。",
    "analogy": "可以理解成乐高积木。",
    "examples": [],
    "usage": "理解Token后，你会更容易看懂AI产品的计费和上下文长度。",
    "relatedTerms": ["上下文窗口", "Prompt"],
    "searchCount": 0,
    "createdAt": "2026-07-26",
    "updatedAt": "2026-07-26"
  }
}
```

### source

- `knowledge`: 命中知识库
- `llm`: 未命中知识库，由大模型实时解释

### matchType

- `exact`: 标准词精确命中
- `alias`: 别名命中
- `keyword`: 关键词包含命中
- `none`: 未命中

## 搜索推荐

`GET /api/search`

### Request

```json
{
  "keyword": "tok"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "keyword": "tok",
    "suggestions": [],
    "result": {}
  }
}
```

## 用户反馈

`POST /api/feedback`

### Request

```json
{
  "term": "Token",
  "action": "helpful"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "term": "Token",
    "action": "helpful"
  }
}
```

## 收藏

`POST /api/favorite`

### Request

```json
{
  "term": "Token",
  "action": "add"
}
```

### Response

```json
{
  "success": true,
  "data": []
}
```

## 知识库版本

`GET /api/knowledge/version`

### Response

```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "updateTime": "2026-07-26T00:00:00+08:00",
    "totalTerms": 6
  }
}
```

## 内部质量统计

`GET /api/admin/quality`

### Response

```json
{
  "success": true,
  "data": {
    "averageScore": 4.3,
    "topProblems": [],
    "promptPerformance": [],
    "knowledgeTermPerformance": [],
    "totalEvaluations": 0
  }
}
```

## 内部运营 Dashboard

`GET /api/admin/dashboard`

### Response

```json
{
  "success": true,
  "data": {
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
}
```

## 批量内容生成

`POST /api/admin/batch-content`

### Request

```json
{
  "keywords": ["Token", "API", "Agent"]
}
```

## 发布正式知识库

`POST /api/admin/publish`

### Request

```json
{
  "item": {
    "id": "pending-rag",
    "keyword": "RAG",
    "status": "approved",
    "draft": {}
  },
  "options": {
    "author": "ai",
    "changeLog": "Publish approved draft"
  }
}
```

## 微信登录

`POST /api/auth/wechat`

### Request

```json
{
  "code": "wx-login-code",
  "profile": {
    "nickname": "",
    "avatarUrl": ""
  }
}
```

## 健康检查

`GET /api/health`

### Response

```json
{
  "status": "ok",
  "version": "1.0.0",
  "services": {
    "database": "mock",
    "hunyuan": "mock",
    "cache": "memory"
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "openId": "",
    "user": {}
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "knowledgeItem": {},
    "versionLog": {}
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "total": 3,
    "recommendedPublish": [],
    "pendingReview": [],
    "needsManualCheck": [],
    "items": []
  }
}
```
