# AI大白话测试用例

用于验证知识库命中、推荐、混元兜底、解释模式和回答评测。

| 序号 | 输入 | 模式 | 期望 | expectedStyle | expectedMode | evaluationRule |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Token | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 2 | token | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 3 | TOKEN | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 4 | token是什么 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 5 | Token限制 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 6 | Token消耗 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 7 | API | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 8 | 什么是API | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 9 | 接口 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 10 | 大模型 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 11 | 什么是大模型 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 12 | LLM | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 13 | Prompt | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 14 | 提示词 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 15 | 提示词工程 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 16 | Agent | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 17 | AI Agent | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 18 | 智能体 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 19 | AGI | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 20 | 通用人工智能 | normal | 知识库命中 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 21 | API和SDK有什么区别 | normal | 混元生成 | compare_first | normal | clarity>=4, example>=3, accuracy>=4 |
| 22 | 为什么AI会忘记聊天内容 | normal | 混元生成 | answer_reason | normal | clarity>=4, example>=3, accuracy>=4 |
| 23 | RAG | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 24 | MCP | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 25 | Codex | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 26 | Cursor | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 27 | Claude Code | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 28 | Embedding | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 29 | 向量数据库 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 30 | 微调 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 31 | Function Calling | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 32 | Tool Calling | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 33 | 上下文窗口 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 34 | 多模态 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 35 | AI hallucination | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 36 | 幻觉是什么 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 37 | CoT | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 38 | Chain of Thought | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 39 | 训练和推理有什么区别 | normal | 混元生成 | compare_first | normal | clarity>=4, example>=3, accuracy>=4 |
| 40 | 模型参数是什么 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 41 | API对业务有什么价值 | business | 混元生成 | business_value | business | clarity>=4, example>=3, accuracy>=4 |
| 42 | Agent怎么帮销售提效 | business | 混元生成 | business_value | business | clarity>=4, example>=3, accuracy>=4 |
| 43 | RAG适合哪些业务场景 | business | 混元生成 | business_value | business | clarity>=4, example>=3, accuracy>=4 |
| 44 | 大模型怎么降低客服成本 | business | 混元生成 | business_value | business | clarity>=4, example>=3, accuracy>=4 |
| 45 | Prompt对运营有什么用 | business | 混元生成 | business_value | business | clarity>=4, example>=3, accuracy>=4 |
| 46 | 开发者怎么接入API | developer | 混元生成 | developer_practical | developer | clarity>=4, example>=3, accuracy>=4 |
| 47 | RAG工程架构是什么 | developer | 混元生成 | developer_practical | developer | clarity>=4, example>=3, accuracy>=4 |
| 48 | MCP怎么接工具 | developer | 混元生成 | developer_practical | developer | clarity>=4, example>=3, accuracy>=4 |
| 49 | Token如何影响接口成本 | developer | 混元生成 | developer_practical | developer | clarity>=4, example>=3, accuracy>=4 |
| 50 | Agent如何调用外部工具 | developer | 混元生成 | developer_practical | developer | clarity>=4, example>=3, accuracy>=4 |
| 51 | 什么是模型蒸馏 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 52 | AI工作流是什么 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |
| 53 | 知识库和RAG有什么区别 | normal | 混元生成 | compare_first | normal | clarity>=4, example>=3, accuracy>=4 |
| 54 | 为什么模型会胡说 | normal | 混元生成 | answer_reason | normal | clarity>=4, example>=3, accuracy>=4 |
| 55 | 混元是什么 | normal | 混元生成 | plain_accurate | normal | clarity>=4, example>=3, accuracy>=4 |

## evaluationRule 说明

- `clarity>=4`: 一句话解释清楚，避免专业词堆叠。
- `example>=3`: 至少有一个真实场景或生活化类比。
- `accuracy>=4`: 不编造事实、价格、版本号或确定性结论。
- 低于阈值的混元结果应进入 prompt 调优或人工审核流程。

## 验证重点

- 已在 `knowledge.json` 的词条应优先命中知识库。
- 复杂问题应进入混元兜底。
- `business` 模式应返回偏业务场景的解释。
- `developer` 模式应返回偏工程接入的解释。
- 24 小时内同一 `keyword + mode` 应优先命中模型结果缓存。
- 混元生成结果应经过 `evaluationService.evaluateAnswer()` 评分。
