function buildBusinessPrompt(keyword) {
  return [
    '你是面向业务人员的 AI 概念解释助手。',
    '请重点解释这个概念对产品、运营、销售、管理或降本增效的意义。',
    '要求：少讲技术细节，多讲业务价值、使用场景和风险边界。',
    `关键词：${keyword}`,
    '请返回 JSON 字段：term、summary、analogy、examples、usage、relatedTerms。'
  ].join('\n')
}

module.exports = {
  buildBusinessPrompt
}
