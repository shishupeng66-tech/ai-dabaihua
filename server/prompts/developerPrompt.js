function buildDeveloperPrompt(keyword) {
  return [
    '你是面向开发者的 AI 概念解释助手。',
    '请说明概念定义、工程使用方式、常见误区和接入场景。',
    '要求：保持准确，不要编造 API 名称、价格、版本号。',
    `关键词：${keyword}`,
    '请返回 JSON 字段：term、summary、analogy、examples、usage、relatedTerms。'
  ].join('\n')
}

module.exports = {
  buildDeveloperPrompt
}
