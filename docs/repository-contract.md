# Repository 接口契约

Repository 层负责隔离 service 与具体数据来源。当前实现使用 json、storage、memory；未来替换为腾讯云 PostgreSQL 时，以下方法名、参数和返回结构应保持稳定。

## knowledgeRepository

| 方法 | 参数 | 返回结构 |
| --- | --- | --- |
| `loadKnowledge()` | 无 | `KnowledgeTerm[]` |
| `loadKnowledgeVersion()` | 无 | `{ version, updateTime, totalTerms }` |
| `searchKnowledge(keyword)` | `string` | `{ hit, matchType, score, data? }` |
| `searchSuggestions(keyword)` | `string` | `{ keyword, term, category }[]` |
| `findByTerm(term)` | `string` | `KnowledgeTerm | undefined` |
| `savePublishedTerm(term)` | `KnowledgeTerm` | `KnowledgeTerm` |
| `updatePublishedTerm(term, patch)` | `string, object` | `KnowledgeTerm | null` |
| `deletePublishedTerm(term)` | `string` | `KnowledgeTerm[]` |
| `getPublishedTerms()` | 无 | `KnowledgeTerm[]` |
| `saveVersionLog(record)` | `KnowledgeVersion` | `KnowledgeVersion` |
| `getVersionLogs()` | 无 | `KnowledgeVersion[]` |

## pendingRepository

| 方法 | 参数 | 返回结构 |
| --- | --- | --- |
| `getPendingItems()` | 无 | `PendingTerm[]` |
| `findPendingItem(id)` | `string` | `PendingTerm | undefined` |
| `createPendingItem(item)` | `PendingTerm` | `PendingTerm[]` |
| `updatePendingItem(id, patch)` | `string, object` | `PendingTerm[]` |
| `deletePendingItem(id)` | `string` | `PendingTerm[]` |
| `savePendingItems(items)` | `PendingTerm[]` | `PendingTerm[]` |

## searchLogRepository

| 方法 | 参数 | 返回结构 |
| --- | --- | --- |
| `recordSearch(keyword, result)` | `string, ExplainResult` | `true` |
| `recordFeedback(action, term)` | `string, string` | `true` |
| `getStats()` | 无 | `{ searchCount, knowledgeHitCount, llmCallCount, dailySearchCounts, hotKeywords, feedback, todayKey }` |
| `listSearchRecords()` | 无 | `SearchRecord[]` |
| `findSearchRecord(id)` | `string` | `SearchRecord | undefined` |
| `updateSearchRecord(id, patch)` | `string, object` | `SearchRecord | null` |
| `deleteSearchRecord(id)` | `string` | `SearchRecord[]` |

## modelUsageRepository

| 方法 | 参数 | 返回结构 |
| --- | --- | --- |
| `getUsageLogs()` | 无 | `ModelUsage[]` |
| `findUsageLog(id)` | `string` | `ModelUsage | undefined` |
| `saveUsageLog(record)` | `ModelUsage` | `ModelUsage` |
| `updateUsageLog(id, patch)` | `string, object` | `ModelUsage | undefined` |
| `deleteUsageLog(id)` | `string` | `ModelUsage[]` |

## evaluationRepository

| 方法 | 参数 | 返回结构 |
| --- | --- | --- |
| `saveEvaluation(record)` | `AnswerEvaluation` | `AnswerEvaluation` |
| `findEvaluation(id)` | `string` | `AnswerEvaluation | undefined` |
| `updateEvaluation(id, patch)` | `string, object` | `AnswerEvaluation | undefined` |
| `deleteEvaluation(id)` | `string` | `AnswerEvaluation[]` |
| `getEvaluations()` | 无 | `AnswerEvaluation[]` |

## favoriteRepository

| 方法 | 参数 | 返回结构 |
| --- | --- | --- |
| `addFavorite(term)` | `string` | `Favorite[]` |
| `findFavorite(term)` | `string` | `Favorite | undefined` |
| `updateFavorite(term, patch)` | `string, object` | `Favorite | undefined` |
| `removeFavorite(term)` | `string` | `Favorite[]` |
| `getFavorites()` | 无 | `Favorite[]` |
