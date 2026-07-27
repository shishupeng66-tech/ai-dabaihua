const knowledge = require('./knowledge.js')
const llm = require('./llm.js')

function normalizeKeyword(keyword) {
  return String(keyword || '').trim()
}

function stripQuestionWords(input) {
  return input
    .replace(/[？?。！!，,\s]/g, '')
    .replace(/^(请|帮我|帮忙|能不能|可以)?(解释一下|解释|讲讲|说说)/, '')
    .replace(/^什么是/, '')
    .replace(/是什么$/, '')
    .replace(/^啥是/, '')
    .replace(/是啥$/, '')
    .replace(/^何为/, '')
}

function isComplexQuestion(input) {
  const text = normalizeKeyword(input)

  if (!text) {
    return false
  }

  const complexPatterns = [
    /为什么/,
    /为何/,
    /怎么/,
    /如何/,
    /区别/,
    /差别/,
    /对比/,
    /关系/,
    /原理/,
    /流程/,
    /步骤/,
    /优缺点/,
    /和.+区别/,
    /与.+区别/
  ]

  return complexPatterns.some(pattern => pattern.test(text))
}

function createResponse(source, data) {
  return {
    success: true,
    source,
    matchType: source === 'llm' ? 'none' : 'keyword',
    score: source === 'llm' ? 0 : 60,
    data
  }
}

function explain(keyword) {
  const originalKeyword = normalizeKeyword(keyword)

  if (!originalKeyword) {
    return Promise.reject(new Error('请输入要查询的术语'))
  }

  if (isComplexQuestion(originalKeyword)) {
    return llm.explainByLLM(originalKeyword).then(data => createResponse('llm', data))
  }

  const extractedKeyword = stripQuestionWords(originalKeyword)
  const knowledgeResult = knowledge.searchKnowledge(extractedKeyword || originalKeyword)

  if (knowledgeResult.hit) {
    return Promise.resolve({
      success: true,
      source: 'knowledge',
      matchType: knowledgeResult.matchType,
      score: knowledgeResult.score,
      data: knowledgeResult.data
    })
  }

  return llm.explainByLLM(originalKeyword).then(data => createResponse('llm', data))
}

function handleExplainRequest(payload) {
  return explain(payload && payload.keyword)
}

module.exports = {
  explain,
  handleExplainRequest
}
