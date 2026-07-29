const assert = require('assert')
const intentRouterService = require('../../server/services/intentRouterService.js')

const cases = [
  ['Token是什么', 'term_explain'],
  ['为什么AI会忘记聊天', 'principle_explain'],
  ['用医生行业解释Agent', 'industry_explain'],
  ['RAG和微调区别', 'compare_explain'],
  ['为什么普通人需要了解AI', 'value_explain'],
  ['如何学习AI客服', 'learning_plan'],
  ['如何利用AI提高工作效率', 'value_explain'],
  ['怎么用AI辅助工作', 'value_explain'],
  ['AI能帮助普通人做什么', 'value_explain'],
  ['如何学习AI', 'learning_plan']
]

cases.forEach(([keyword, expectedIntent]) => {
  const result = intentRouterService.routeIntent(keyword)
  assert.strictEqual(result.intent, expectedIntent, keyword)
  assert.ok(result.confidence >= 0 && result.confidence <= 1, keyword)
  assert.ok(result.reason, keyword)
})

console.log('intentRouterService ok')
