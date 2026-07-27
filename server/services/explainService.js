const knowledgeService = require('./knowledgeService.js')
const hunyuanService = require('./hunyuanService.js')
const explainModeService = require('./explainModeService.js')

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

function createLLMResponse(data) {
  return {
    success: true,
    source: 'llm',
    matchType: 'none',
    score: 0,
    data
  }
}

function explain(input) {
  const parsed = explainModeService.parseExplainInput(input)
  const originalKeyword = normalizeKeyword(parsed.keyword)
  const mode = parsed.mode

  if (!originalKeyword) {
    return Promise.reject(new Error('请输入要查询的术语'))
  }

  if (isComplexQuestion(originalKeyword)) {
    return hunyuanService.explain({ keyword: originalKeyword, mode }).then(createLLMResponse)
  }

  const extractedKeyword = stripQuestionWords(originalKeyword)
  const knowledgeResult = knowledgeService.searchKnowledge(extractedKeyword || originalKeyword)

  if (knowledgeResult.hit) {
    return Promise.resolve({
      success: true,
      source: 'knowledge',
      matchType: knowledgeResult.matchType,
      score: knowledgeResult.score,
      data: knowledgeResult.data
    })
  }

  return hunyuanService.explain({ keyword: originalKeyword, mode }).then(createLLMResponse)
}

module.exports = {
  explain
}
