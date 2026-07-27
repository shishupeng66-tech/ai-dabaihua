# Repository 数据访问层

本项目已拆出 `server/repositories`，用于隔离 service 与具体数据来源。

## 当前结构

```text
server/api.js
  -> server/services/*
    -> server/repositories/*
      -> 当前本地 json / storage / memory
```

service 负责业务编排和规则判断；repository 负责数据读写。service 不应直接操作 JSON、Storage 或内存数组。

## Repository 列表

### knowledgeRepository

当前来源：

- `data/knowledge.json`
- `data/version.json`
- 内存中的发布结果和版本日志

未来替换：

- 腾讯云 PostgreSQL 表 `knowledge_terms`
- 腾讯云 PostgreSQL 表 `knowledge_versions`

### pendingRepository

当前来源：

- `data/pending.json`
- `wx.setStorageSync('pending_keywords')`

未来替换：

- 腾讯云 PostgreSQL 表 `pending_terms`

### searchLogRepository

当前来源：

- `wx.setStorageSync('local_analytics')`
- Node/mock 环境内存统计

未来替换：

- 腾讯云 PostgreSQL 表 `search_logs`
- 腾讯云 PostgreSQL 表 `feedback_logs`

### modelUsageRepository

当前来源：

- `wx.setStorageSync('model_usage_logs')`
- Node/mock 环境内存日志

未来替换：

- 腾讯云 PostgreSQL 表 `model_usage_logs`

### evaluationRepository

当前来源：

- `wx.setStorageSync('answer_evaluations')`
- Node/mock 环境内存记录

未来替换：

- 腾讯云 PostgreSQL 表 `answer_evaluations`

### favoriteRepository

当前来源：

- `wx.setStorageSync('favorite_terms')`

未来替换：

- 腾讯云 PostgreSQL 表 `favorites`

## 迁移原则

1. service 层方法签名保持不变。
2. repository 返回结构保持不变。
3. 先迁 repository，再接真实 API。
4. 数据库异常在 repository 层转换为稳定错误，避免泄漏数据库细节给小程序端。
