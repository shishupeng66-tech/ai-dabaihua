# AI大白话 Result 页面 v2 产品验收报告

生成时间：2026-07-28T07:58:08.613Z
测试模式：EXPLANATION_PIPELINE_MODE=v2
测试总数：20
通过：19
异常：1

## 验收结论

本轮发现 1 个异常，其余 19 个用例通过。异常集中在 Intent 类型识别与对应展示内容匹配，不是 normalizeResultData 或页面 viewModel 基础结构问题。

## 检查项

1. 接口返回是否成功
2. normalizeResultData 是否正常
3. viewModel.type 是否正确
4. 是否存在 undefined / null / 空 sections
5. 不同 type 是否有对应展示内容

## 明细结果

| # | 问题 | source | apiType | viewModel.type | 预期type | sections | 异常 |
| ---: | --- | --- | --- | --- | --- | ---: | --- |
| 1 | Token是什么 | knowledge |  | term_explain |  | 4 | 无 |
| 2 | API是什么 | knowledge |  | term_explain |  | 4 | 无 |
| 3 | Agent是什么 | knowledge |  | term_explain |  | 4 | 无 |
| 4 | Prompt是什么 | knowledge |  | term_explain |  | 4 | 无 |
| 5 | RAG是什么 | llm | term_explain | term_explain |  | 6 | 无 |
| 6 | 为什么AI会忘记聊天内容 | llm | principle_explain | principle_explain |  | 3 | 无 |
| 7 | AI幻觉是什么意思 | llm | term_explain | term_explain |  | 6 | 无 |
| 8 | 用医生行业解释AI Agent | llm | industry_explain | industry_explain |  | 5 | 无 |
| 9 | 用律师行业解释RAG | llm | industry_explain | industry_explain |  | 5 | 无 |
| 10 | RAG和微调有什么区别 | llm | compare | compare |  | 4 | 无 |
| 11 | GPT和传统搜索有什么区别 | llm | compare | compare |  | 4 | 无 |
| 12 | 为什么普通人需要了解AI | llm | value_explain | value_explain |  | 3 | 无 |
| 13 | AI未来会替代哪些工作 | llm | term_explain | term_explain |  | 6 | 无 |
| 14 | 我想学习AI，需要怎么开始 | llm | term_explain | term_explain |  | 6 | 无 |
| 15 | 我想做AI客服，需要学习什么 | llm | learning_plan | learning_plan |  | 3 | 无 |
| 16 | Embedding是什么 | llm | term_explain | term_explain |  | 6 | 无 |
| 17 | 上下文窗口是什么意思 | llm | term_explain | term_explain |  | 6 | 无 |
| 18 | MCP是什么 | llm | term_explain | term_explain |  | 6 | 无 |
| 19 | 什么是大模型 | knowledge |  | term_explain |  | 4 | 无 |
| 20 | 如何利用AI提高工作效率 | llm |  | term_explain |  | 1 | ???????term analogy?term examples?term importance |

## Type 覆盖

| type | 测试总数 | 通过 | 异常 |
| --- | ---: | ---: | ---: |
| compare | 2 | 2 | 0 |
| industry_explain | 2 | 2 | 0 |
| learning_plan | 1 | 1 | 0 |
| principle_explain | 1 | 1 | 0 |
| term_explain | 13 | 12 | 1 |
| value_explain | 1 | 1 | 0 |

## 异常详情

### 如何利用AI提高工作效率

- source：llm
- apiType：无
- viewModel.type：term_explain
- 预期type：undefined
- sections：1
- sectionKeys：oneSentence
- 异常：???????term analogy?term examples?term importance

## 观察

- `Token/API/Agent/Prompt/RAG/Embedding/上下文窗口/MCP/大模型` 等术语类输入均可成功返回并通过 normalizeResultData。
- 原理类、行业类、对比类、价值类、学习规划类均有通过样例，动态 sections 能覆盖对应展示内容。
- 未发现复制内容中的 `undefined` 或 `null`。
- 唯一异常为 `如何利用AI提高工作效率`，当前返回 `term_explain`，但产品预期更接近 `value_explain`。后续应优化 Intent Router 规则，将“如何利用AI提高效率/提升工作效率”归入价值解释或行动建议类。

## 本轮未修改代码

本轮只执行测试并生成本报告，未修改 `pages/`、`server/`、`utils/`、`data/`。