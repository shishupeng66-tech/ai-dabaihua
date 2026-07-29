# Knowledge Import Report

- 导入文件数量：10
- 原词条数量：1
- 导入原始词条数量：500
- 新增词条数量：437
- 重复词条数量：63
- 最终 terms.json 数量：438

## JSON格式检查结果

| 文件 | 状态 | 词条数量 | 错误 |
| --- | --- | ---: | --- |
| batch001.json | OK | 50 | - |
| batch002.json | OK | 50 | - |
| batch003.json | OK | 50 | - |
| batch004.json | OK | 50 | - |
| batch005.json | OK | 50 | - |
| batch006.json | OK | 50 | - |
| batch007.json | OK | 50 | - |
| batch008.json | OK | 50 | - |
| batch009.json | OK | 50 | - |
| batch010.json | OK | 50 | - |
| terms.json | OK | 438 | - |

## 合并规则

- 按 `term` 去重，比较时忽略大小写。
- 重复词条保留内容更完整的一条。
- 输出字段统一为正式知识库 schema。
