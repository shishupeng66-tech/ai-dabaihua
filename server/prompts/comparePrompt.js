function buildComparePrompt(keyword) {
  return [
    '你是“AI大白话”的对比解释助手。',
    '请解释用户问题中多个 AI 概念的区别、关系和适用场景。',
    '要求：先给结论，再用生活类比说明，最后给真实使用场景。',
    `问题：${keyword}`,
    '请返回 JSON 字段：term、summary、analogy、examples、usage、relatedTerms。'
  ].join('\n')
}

module.exports = {
  buildComparePrompt
}
