const intentRouterService = require('./intentRouterService.js')
const skillSelectorService = require('./skillSelectorService.js')
const hunyuanService = require('./hunyuanService.js')

function buildPrompt(keyword, skillPrompt) {
  return [
    skillPrompt,
    '',
    '## 用户输入',
    String(keyword || '').trim(),
    '',
    '## 最终要求',
    '只返回一个合法 JSON 对象。',
    '不要返回 Markdown。',
    '不要返回解释过程。',
    '不要把 JSON 放进代码块。'
  ].join('\n')
}

function runExplanationPipeline(keyword) {
  const normalizedKeyword = String(keyword || '').trim()

  if (!normalizedKeyword) {
    return Promise.reject(new Error('Missing keyword'))
  }

  const intentResult = intentRouterService.routeIntent(normalizedKeyword)
  const skillResult = skillSelectorService.selectSkill(intentResult.intent)
  const prompt = buildPrompt(normalizedKeyword, skillResult.prompt)

  return hunyuanService.explainWithPrompt({
    keyword: normalizedKeyword,
    prompt,
    promptName: skillResult.skillName,
    mode: 'production_skill'
  }).then(response => ({
    keyword: normalizedKeyword,
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    reason: intentResult.reason,
    skillName: skillResult.skillName,
    tokenUsage: response.tokenUsage,
    answer: response.data,
    model: response.model,
    provider: response.provider,
    usedMock: response.usedMock
  }))
}

module.exports = {
  runExplanationPipeline,
  buildPrompt
}
