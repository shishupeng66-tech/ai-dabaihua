const knowledgeService = require('./knowledgeService.js')
const hunyuanService = require('./hunyuanService.js')
const explainModeService = require('./explainModeService.js')
const intentRouterService = require('./intentRouterService.js')
const skillSelectorService = require('./skillSelectorService.js')
const env = require('../../config/env.js')

function normalizeKeyword(keyword) {
  return String(keyword || '').trim()
}

function stripQuestionWords(input) {
  return String(input || '')
    .replace(/[？?。！!\s]/g, '')
    .replace(/^(请|请帮我|帮我|能不能|可以)?(解释一下|解释|介绍一下|介绍|讲讲|说说)/, '')
    .replace(/^什么是/, '')
    .replace(/是什么$/, '')
    .replace(/是什么意思$/, '')
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
    /.+和.+区别/,
    /.+与.+区别/
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

function buildProductionPrompt(keyword, skillPrompt) {
  return [
    skillPrompt,
    '',
    '## 用户输入',
    keyword,
    '',
    '## 最终要求',
    '只返回一个合法 JSON 对象。',
    '不要返回 Markdown。',
    '不要返回解释过程。',
    '不要把 JSON 放进代码块。'
  ].join('\n')
}

function explainV1(keyword, mode) {
  if (isComplexQuestion(keyword)) {
    return hunyuanService.explain({ keyword, mode }).then(createLLMResponse)
  }

  const knowledgeResponse = getKnowledgeFirstResult(keyword)

  if (knowledgeResponse) {
    return Promise.resolve(knowledgeResponse)
  }

  return hunyuanService.explain({ keyword, mode }).then(createLLMResponse)
}

function explainV2(keyword) {
  const intentResult = intentRouterService.routeIntent(keyword)
  const knowledgeResponse = intentResult.intent === 'term_explain'
    ? getKnowledgeFirstResult(keyword)
    : null

  if (knowledgeResponse) {
    return Promise.resolve(knowledgeResponse)
  }

  const skillResult = skillSelectorService.selectSkill(intentResult.intent, {
    optimized: true
  })
  const prompt = buildProductionPrompt(keyword, skillResult.prompt)

  return hunyuanService.explainWithPrompt({
    keyword,
    prompt,
    promptName: skillResult.skillName,
    mode: 'production_v2'
  }).then(response => ({
    success: true,
    source: 'llm',
    matchType: 'none',
    score: 0,
    cacheHit: false,
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    skillName: skillResult.skillName,
    tokenUsage: response.tokenUsage,
    data: response.data
  }))
}

function explain(input) {
  const parsed = explainModeService.parseExplainInput(input)
  const originalKeyword = normalizeKeyword(parsed.keyword)
  const mode = parsed.mode

  if (!originalKeyword) {
    return Promise.reject(new Error('请输入要查询的术语'))
  }

  if (env.EXPLANATION_PIPELINE_MODE === 'v2') {
    return explainV2(originalKeyword)
  }

  return explainV1(originalKeyword, mode)
}

module.exports = {
  explain,
  buildProductionPrompt,
  stripQuestionWords,
  isComplexQuestion
}
