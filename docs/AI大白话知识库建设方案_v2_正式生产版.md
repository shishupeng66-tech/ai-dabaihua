# AI大白话知识库建设方案 v2（正式生产版）

## 一、方向调整

原方案： - 分类体系 - 词条地图 - P0核心词条

调整为：

上线前建立覆盖型知识库。

目标： - 尽可能提高知识库命中率 - 降低模型调用成本 -
用户未命中的内容通过LLM生成后沉淀

AI大白话不是传统百科，而是AI时代知识解释入口：
用户搜索陌生AI词汇、软件、技术概念时，需要快速知道： - 它是什么 -
它有什么用 - 它和哪些概念有关

------------------------------------------------------------------------

# 二、知识库规模目标

上线前：

目标规模： 3000-5000条词库

分三级：

## P0 核心解释库（约500条）

特点： 高频搜索、高价值。

完整字段：

-   summary
-   analogy
-   examples
-   usage
-   memoryPoint
-   commonQuestion
-   avoidMisunderstanding
-   relatedTerms

例如：

Token、Prompt、RAG、Agent、Claude、Codex、FFmpeg。

------------------------------------------------------------------------

## P1 高频覆盖库（约1500条）

特点： 用户经常遇到，但搜索量低于核心词。

字段：

-   summary
-   analogy
-   examples
-   relatedTerms

------------------------------------------------------------------------

## P2 扩展覆盖库（约2000条）

特点： 大量软件、框架、模型、工具名称。

字段：

-   summary
-   category
-   relatedTerms

------------------------------------------------------------------------

# 三、目录结构调整

原来的：

docs/ 分类地图

保留作为索引。

新增：

data/knowledge/

结构：

llm.json agent.json ai-tools.json development.json cloud.json
database.json media.json security.json design.json business-ai.json

每个文件直接存储生产词条。

------------------------------------------------------------------------

# 四、生产字段标准

保持现有Schema。

标准字段：

id term aliases category level difficultyLevel sourceType targetAudience
version

summary analogy examples usage

memoryPoint commonQuestion avoidMisunderstanding

relatedTerms

searchCount author reviewStatus createdAt updatedAt

------------------------------------------------------------------------

# 五、生产流程

用户搜索：

输入关键词

↓

knowledge search

↓

命中：

直接返回知识库

↓

未命中：

调用hy3生成

↓

进入pending

↓

审核后进入知识库

------------------------------------------------------------------------

# 六、生产顺序

第一阶段：

LLM与模型生态

约300条

包含：

GPT Claude Gemini Qwen DeepSeek Hunyuan Token Prompt Embedding RAG
Transformer Context Window

第二阶段：

Agent

约300条

包含：

Agent MCP Tool Calling Memory Workflow LangChain LangGraph CrewAI

第三阶段：

AI工具生态

约500条

包含：

Codex Cursor Claude Code ComfyUI Midjourney Whisper FFmpeg yt-dlp n8n
Dify

第四阶段：

开发技术

约500条

包含：

API SDK Git Docker Database CloudBase Serverless

第五阶段：

行业应用

约500条

包含：

AI客服 AI营销 AI教育 AI设计 AI办公

------------------------------------------------------------------------

# 七、执行原则

不追求一次覆盖100%。

目标：

上线前覆盖绝大多数高频搜索。

剩余冷门词：

通过真实用户搜索持续补充。

知识库会随着用户行为增长。
