# 缓存设计

目标：减少腾讯混元调用次数，提高小程序响应速度，并降低服务成本。

## 热门词缓存

缓存内容：

- 热门关键词列表
- 高频知识库词条
- 高频搜索推荐结果

建议策略：

- Redis Key：`hot_terms:v1`
- TTL：10 分钟
- 数据来源：`search_logs` 和 `knowledge_terms.search_count`

## 模型结果缓存

缓存内容：

- 未命中知识库但已由混元生成过的解释
- 复杂问题的混元回答

建议策略：

- Redis Key：`model_explain:{normalized_keyword}`
- TTL：1 天到 7 天
- 命中缓存时仍标记 `source: "llm_cache"` 或在日志中记录 `cacheHit: true`

注意：

- 缓存结果不能直接写入正式知识库
- 进入正式知识库前必须经过人工审核

## 版本缓存

缓存内容：

- 词库版本号
- 词库总数
- 最近更新时间

建议策略：

- Redis Key：`knowledge_version`
- TTL：5 分钟
- 小程序启动或进入搜索页时可拉取版本，用于判断是否需要同步本地词库

## 推荐缓存

缓存内容：

- 输入前缀对应的推荐词

建议策略：

- Redis Key：`suggest:{prefix}`
- TTL：30 分钟
- 当知识库版本变更时清理推荐缓存
