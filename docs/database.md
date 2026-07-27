# 数据库迁移设计

本文档描述未来从本地 JSON / Storage 迁移到 PostgreSQL 时的核心表结构。

## knowledge_terms

正式知识库词条表。

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| id | varchar | 词条唯一 ID |
| term | varchar | 标准词名称 |
| aliases | text[] | 用户可能输入的别名 |
| category | varchar | 分类 |
| level | varchar | 难度等级 |
| difficulty_level | varchar | 标准难度：beginner、intermediate、advanced |
| source_type | varchar | 内容来源：official、community、business、internal |
| target_audience | varchar | 目标读者：normal、business、developer |
| version | varchar | 词条版本号 |
| summary | text | 一句话解释 |
| analogy | text | 生活化比喻 |
| examples | jsonb | 真实场景示例 |
| usage | text | 普通人为什么需要知道 |
| related_terms | text[] | 关联词 |
| search_count | integer | 搜索次数统计 |
| author | varchar | human 或 ai |
| review_status | varchar | approved、pending、rejected |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

## knowledge_versions

词条版本历史表。

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| id | varchar | 版本记录 ID |
| term | varchar | 词条名称 |
| version | varchar | 词条版本号 |
| change_log | text | 变更说明 |
| created_at | timestamptz | 创建时间 |

## pending_terms

待审核词条与 AI 草稿表。

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| id | varchar | 待审核记录 ID |
| keyword | varchar | 用户搜索但未命中的关键词 |
| source | varchar | 来源：user_search、admin_create、import |
| draft | jsonb | AI 生成的草稿内容 |
| status | varchar | pending、approved、rejected |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| reviewed_at | timestamptz | 审核时间 |
| reviewer_id | varchar | 审核人 ID |

## search_logs

搜索日志表。

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| id | varchar | 日志 ID |
| user_id | varchar | 用户 ID，匿名时可为空 |
| keyword | varchar | 原始搜索词 |
| source | varchar | 返回来源：knowledge 或 llm |
| match_type | varchar | exact、alias、keyword、none |
| score | integer | 搜索匹配分 |
| hit_knowledge | boolean | 是否命中知识库 |
| hit_term_id | varchar | 命中的正式词条 ID |
| created_at | timestamptz | 搜索时间 |

## feedback_logs

用户反馈日志表。

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| id | varchar | 反馈 ID |
| user_id | varchar | 用户 ID，匿名时可为空 |
| term | varchar | 被反馈的词条 |
| action | varchar | helpful、re_explain |
| source | varchar | knowledge 或 llm |
| created_at | timestamptz | 反馈时间 |

## favorites

收藏表。

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| id | varchar | 收藏 ID |
| user_id | varchar | 用户 ID |
| term_id | varchar | 正式知识库词条 ID |
| term | varchar | 收藏时的词条名称 |
| created_at | timestamptz | 收藏时间 |

## users

用户表。

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| id | varchar | 用户 ID |
| open_id | varchar | 微信 openId |
| nickname | varchar | 昵称 |
| avatar_url | text | 头像 |
| role | varchar | user 或 admin |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
