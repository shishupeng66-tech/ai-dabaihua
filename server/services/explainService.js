const knowledgeService = require('./knowledgeService.js')
const hunyuanService = require('./hunyuanService.js')
const explainModeService = require('./explainModeService.js')

function normalizeKeyword(keyword) {
  return String(keyword || '').trim()
}

function stripQuestionWords(input) {
  return String(input || '')
    .replace(/[，。！？!?\s]/g, '')
    .replace(/^(请|请帮我|帮我|能不能|可以)?(解释一下|解释|介绍一下|介绍|讲讲|说说)/, '')
    .replace(/^什么是/, '')
    .replace(/是什么/, '')
    .replace(/是什么意思/, '')
    .replace(/^啥是/, '')
    .replace(/是啥$/, '')
    .replace(/^何为/, '')
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

function createKnowledgeResponse(knowledgeResult) {
  return {
    success: true,
    source: 'knowledge',
    matchType: knowledgeResult.matchType,
    score: knowledgeResult.score,
    data: knowledgeResult.data
  }
}

function getKnowledgeFirstResult(keyword) {
  const extractedKeyword = stripQuestionWords(keyword)
  const knowledgeResult = knowledgeService.searchKnowledge(extractedKeyword || keyword)

  if (!knowledgeResult.hit) return null

  return createKnowledgeResponse(knowledgeResult)
}

function explain(input) {
  const parsed = explainModeService.parseExplainInput(input)
  const keyword = normalizeKeyword(parsed.keyword)
  const mode = parsed.mode

  if (!keyword) {
    return Promise.reject(new Error('Please enter a keyword to explain.'))
  }

  const knowledgeResponse = getKnowledgeFirstResult(keyword)

  if (knowledgeResponse) {
    return Promise.resolve(knowledgeResponse)
  }

  return hunyuanService.explain({ keyword, mode }).then(createLLMResponse)
}

module.exports = {
  explain,
  stripQuestionWords
}
