# 知识库重复清理建议报告 v1

## 概览

- 总词条数量：474
- v2报告 term重复数量：0
- v2报告 aliases重复数量：52
- v2报告 同义词重复数量：225
- 生活案例需要修复数量：700

## 一、真正重复词条

| 词条1 | 词条2 | 建议保留 |
| --- | --- | --- |
| Artificial Intelligence | AI | 保留 AI；Artificial Intelligence 可作为 alias/translation，不建议保留为独立词条。 |
| Prompt Engineering | 提示词工程 | 保留 提示词工程；Prompt Engineering 作为英文翻译和 alias。 |
| Hallucination | 幻觉 | 保留 幻觉；Hallucination 作为英文翻译，AI幻觉/模型幻觉作为 alias。 |
| Context Window | 上下文窗口 | 保留 上下文窗口；Context Window 和上下文长度作为 alias。 |
| Chain of Thought | 思维链 | 保留 思维链；Chain of Thought/CoT 作为 alias。 |
| Zero-shot | 零样本学习 | 保留 零样本学习；Zero-shot/零样本作为 alias。 |
| Few-shot | 少样本学习 | 保留 少样本学习；Few-shot/少样本作为 alias。 |
| Quantization | 量化 | 保留 量化；Quantization/模型量化作为 alias。 |
| Agent | 智能体 | 保留 智能体；Agent/AI智能体作为 alias。 |
| RAG | 检索增强生成 | 保留 检索增强生成；RAG/检索增强作为 alias。 |
| Attention | 自注意力机制 | 保留 自注意力机制；Attention/Self-Attention/自注意力作为 alias。 |
| AI数字人 | 数字人 | 保留 数字人；AI数字人/虚拟数字人作为 alias 或细分词条需重新定义边界。 |
| OCR | 光学字符识别 | 保留 光学字符识别；OCR/文字识别/图片转文字作为 alias。 |
| CV | 计算机视觉 | 保留 计算机视觉；CV/机器视觉作为 alias。 |
| LLM | 大语言模型 | 保留 大语言模型；LLM/Large Language Model 作为 alias。 |
| Alignment | 对齐 | 保留 对齐；Alignment/人类对齐作为 alias。 |
| Temperature | 温度系数 | 保留 温度系数；Temperature/采样温度作为 alias。 |
| Top-p | Top-p采样 | 保留 Top-p采样；Top-p/核采样作为 alias。 |
| Diffusion Model | 扩散模型 | 保留 扩散模型；Diffusion Model/扩散生成模型作为 alias。 |
| Jailbreak | 越狱攻击 | 保留 越狱攻击；Jailbreak/AI越狱作为 alias。 |
| Data Augmentation | 数据增强 | 保留 数据增强；Data Augmentation/数据增广作为 alias。 |
| Overfitting | 过拟合 | 保留 过拟合；Overfitting/过度拟合作为 alias。 |
| Underfitting | 欠拟合 | 保留 欠拟合；Underfitting/拟合不足作为 alias。 |
| Perplexity | 困惑度 | 保留 困惑度；Perplexity 作为英文翻译；若保留产品 Perplexity AI，需要把 term 改成 Perplexity AI 并明确产品概念。 |
| MoE | 混合专家模型 | 保留 混合专家模型；MoE/Mixture of Experts 作为 alias。 |

## 二、aliases优化

| 词条 | 冲突词条 | 当前aliases/冲突名 | 建议删除aliases |
| --- | --- | --- | --- |
| AI | Artificial Intelligence | 人工智能 | 删除 Artificial Intelligence 中的 alias「人工智能」，避免和 AI 的 alias 交叉。 |
| Prompt | Prompt Engineering | 提示词工程 | 删除 Prompt Engineering 中的 alias「提示词工程」，保留为 translation.chinese。 |
| GitHub Copilot | Microsoft Copilot | Copilot | 两个产品都可保留，但建议从其中一个 aliases 删除通用 alias「Copilot」。 |
| Multi-modal | 多模态 | 多模态大模型 | 删除 Multi-modal 中的 alias「多模态大模型」，保持概念层级清晰。 |
| Hallucination | 幻觉 | AI幻觉 / 模型幻觉 | 将 AI幻觉、模型幻觉集中为 幻觉 的 aliases，其他词条删除这些 alias。 |
| Context Window | 上下文窗口 | 上下文长度 | 建议保留 上下文窗口 为主词，删除 Context Window 中中文 alias「上下文长度」。 |
| Attention | 自注意力机制 | Self-Attention / 自注意力 | 如果 Attention 泛指注意力机制，应删除与自注意力机制完全重叠的 aliases。 |
| OCR | 光学字符识别 | 文字识别 / 图片转文字 | 建议集中到 光学字符识别 的 aliases，OCR 词条不再重复挂中文 alias。 |
| LLM | 大语言模型 | Large Language Model | 保留 大语言模型 为主词，LLM 中删除 Large Language Model alias 或转为 translation.english。 |
| MoE | 混合专家模型 | Mixture of Experts | 保留 混合专家模型 为主词，MoE 中删除中文 alias「混合专家模型」。 |

## 三、正常同义关系

| 词条1 | 词条2 | 同义名 | 处理建议 |
| --- | --- | --- | --- |
| LLM | 大语言模型 | Large Language Model | 中英文缩写和中文全称关系，属于正常同义关系，无需处理。 |
| API | 应用程序编程接口 | Application Programming Interface | 英文缩写、中文名和英文全称关系，属于正常同义关系，无需处理。 |
| RAG | 检索增强生成 | Retrieval-Augmented Generation | 缩写与全称关系，作为检索匹配词保留合理。 |
| OCR | 光学字符识别 | Optical Character Recognition | 缩写与正式中文翻译关系，属于正常同义关系。 |
| NLP | 自然语言处理 | Natural Language Processing | 缩写、中文名、英文全称关系，属于正常同义关系。 |
| CV | 计算机视觉 | Computer Vision | 缩写和中文概念关系，属于正常同义关系。 |
| ASR | 语音识别 | Automatic Speech Recognition | 缩写和中文概念关系，属于正常同义关系。 |
| TTS | 语音合成 | Text to Speech | 缩写和中文概念关系，属于正常同义关系。 |
| MoE | 混合专家模型 | Mixture of Experts | 技术缩写和中文概念关系，属于正常同义关系。 |
| CoT | 思维链 | Chain of Thought | 缩写和中文概念关系，属于正常同义关系。 |

## 四、生活案例问题统计

需要修复数量：700

说明：本报告只统计数量，不修改生活案例内容。

## 五、疑似重复复核清单

以下是从 term、aliases、translation 名称交叉命中中抽取的高风险项，用于人工复核，不代表全部都要删除。

| 冲突名 | 涉及词条 | 建议 |
| --- | --- | --- |
| ai | AI / Artificial Intelligence | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 人工智能 | AI / Artificial Intelligence | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| artificialintelligence | AI / Artificial Intelligence | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| llm | LLM / 大语言模型 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 大语言模型 | LLM / 大语言模型 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| largelanguagemodel | LLM / 大语言模型 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| gpt | GPT / 生成式预训练 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 提示词工程 | Prompt / Prompt Engineering / 提示词工程 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| agent | Agent / 智能体 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 智能体 | Agent / 智能体 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| ai智能体 | Agent / 智能体 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| rag | RAG / 检索增强生成 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 检索增强生成 | RAG / 检索增强生成 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 检索增强 | RAG / 检索增强生成 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| retrieval-augmentedgeneration | RAG / 检索增强生成 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| embedding | Embedding / 嵌入向量 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 向量嵌入 | Embedding / 嵌入向量 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| fine-tuning | Fine-tuning / 微调 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 微调 | Fine-tuning / 微调 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 模型微调 | Fine-tuning / 微调 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 精调 | Fine-tuning / 微调 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| perplexity | Perplexity / 困惑度 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| vectordatabase | Vector Database / 向量数据库 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 向量数据库 | Vector Database / 向量数据库 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 矢量数据库 | Vector Database / 向量数据库 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| react | React / ReAct框架 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| react框架 | React / ReAct框架 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| ai客服 | AI客服 / 智能客服 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 智能客服 | AI客服 / 智能客服 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| aicustomerservice | AI客服 / 智能客服 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| contextwindow | Context Window / 上下文窗口 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 上下文窗口 | Context Window / 上下文窗口 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 上下文长度 | Context Window / 上下文窗口 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| promptengineering | Prompt Engineering / 提示词工程 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 提示工程 | Prompt Engineering / 提示词工程 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| hallucination | Hallucination / 幻觉 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 幻觉 | Hallucination / 幻觉 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| ai幻觉 | Hallucination / 幻觉 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| 模型幻觉 | Hallucination / 幻觉 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |
| alignment | Alignment / 对齐 | 人工复核：判断是同一概念、别名误挂，还是正常同义关系。 |

## 最终建议

- 先处理“真正重复词条”，把重复概念合并为一个主词条。
- 再处理 aliases 优化，删除跨词条误挂的泛化 alias。
- 正常同义关系保留，用于搜索召回，不建议删除。
- 生活案例问题单独进入内容修复流程，不在本清理计划中改正文案。
