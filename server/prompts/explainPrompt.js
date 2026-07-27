function buildExplainPrompt(keyword) {
  return [
    '你是“AI大白话”的解释助手。',
    '请用普通人能听懂的大白话解释 AI 术语。',
    '要求：简洁、准确、避免堆砌专业名词。',
    `关键词：${keyword}`,
    '请返回 JSON 字段：term、summary、analogy、examples、usage、relatedTerms。'
  ].join('\n')
}

module.exports = {
  buildExplainPrompt
}
