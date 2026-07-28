function clampScore(score) {
  return Math.max(0, Math.min(5, score))
}

function getText(answer) {
  if (!answer) return ''

  return [
    answer.term,
    answer.summary,
    answer.explanation,
    answer.analogy,
    answer.usage,
    (answer.examples || []).join(' ')
  ].filter(Boolean).join(' ')
}

function getSummary(answer) {
  return String(answer && (answer.summary || answer.explanation) || '').trim()
}

function getAnalogy(answer) {
  return String(answer && answer.analogy || '').trim()
}

function getExamples(answer) {
  return Array.isArray(answer && answer.examples) ? answer.examples : []
}

function scoreUnderstandability(answer) {
  const summary = getSummary(answer)
  const text = getText(answer)
  if (!summary) return 0

  let score = 3
  if (summary.length >= 12 && summary.length <= 90) score += 1
  if (!/[{}[\]<>]/.test(summary)) score += 0.5
  if (!/(Transformer|embedding space|backpropagation|loss function|gradient)/i.test(text)) score += 0.5

  return clampScore(score)
}

function scoreAnalogyQuality(answer) {
  const analogy = getAnalogy(answer)
  if (!analogy) return 0

  let score = 3
  if (analogy.length >= 8 && analogy.length <= 90) score += 1
  if (/(像|好比|就像|可以理解成|比如|类似)/.test(analogy)) score += 1

  return clampScore(score)
}

function scoreScenarioQuality(answer) {
  const examples = getExamples(answer).filter(item => String(item || '').trim().length >= 8)
  if (!examples.length) return 0
  if (examples.length >= 3) return 5
  if (examples.length === 2) return 4
  return 3
}

function scoreMemoryPoint(answer) {
  const summary = getSummary(answer)
  if (!summary) return 0

  let score = 2
  if (summary.length >= 8 && summary.length <= 60) score += 2
  if (/[，。；：]/.test(summary) || summary.length <= 28) score += 1

  return clampScore(score)
}

function scoreAccuracy(answer) {
  const text = getText(answer)
  if (!text) return 0

  let score = 4
  const riskyPatterns = [
    /一定/,
    /百分百/,
    /绝对/,
    /保证/,
    /永远/,
    /完全正确/,
    /真实key/i,
    /准确价格/
  ]

  if (riskyPatterns.some(pattern => pattern.test(text))) score -= 1
  if (answer && answer.relatedTerms && answer.relatedTerms.length > 6) score -= 0.5
  if (getSummary(answer) && getAnalogy(answer) && getExamples(answer).length) score += 0.5

  return clampScore(score)
}

function scoreCommercialValue(answer) {
  let score = 0
  const usage = String(answer && answer.usage || '').trim()
  const examples = getExamples(answer)

  if (usage.length >= 10) score += 2
  if (examples.length > 0) score += 1
  if (/(成本|效率|业务|产品|使用|场景|工作|决策|提效|风险)/.test(usage + examples.join(' '))) score += 2

  return clampScore(score)
}

function buildSuggestions(scores) {
  const suggestions = []

  if (scores.understandability < 4) suggestions.push('降低术语密度，让普通用户更快理解。')
  if (scores.analogyQuality < 4) suggestions.push('补充更自然的生活类比。')
  if (scores.scenarioQuality < 4) suggestions.push('增加真实应用场景，避免只讲概念。')
  if (scores.memoryPoint < 4) suggestions.push('强化一句话记忆点。')
  if (scores.accuracy < 4) suggestions.push('减少绝对化表达，确保解释更稳妥。')
  if (scores.commercialValue < 4) suggestions.push('说明用户为什么需要知道这个概念。')

  return suggestions.length ? suggestions.join(' ') : '整体符合 AI大白话 Skill 质量标准。'
}

function evaluateSkillAnswer(payload) {
  const keyword = String(payload && payload.keyword || '').trim()
  const skillVersion = String(payload && payload.skillVersion || '').trim()
  const answer = payload && payload.answer ? payload.answer : {}
  const scores = {
    understandability: scoreUnderstandability(answer),
    analogyQuality: scoreAnalogyQuality(answer),
    scenarioQuality: scoreScenarioQuality(answer),
    memoryPoint: scoreMemoryPoint(answer),
    accuracy: scoreAccuracy(answer),
    commercialValue: scoreCommercialValue(answer)
  }
  const overall = Number((
    scores.understandability * 0.22 +
    scores.analogyQuality * 0.16 +
    scores.scenarioQuality * 0.16 +
    scores.memoryPoint * 0.14 +
    scores.accuracy * 0.2 +
    scores.commercialValue * 0.12
  ).toFixed(1))

  return {
    keyword,
    skillVersion,
    scores,
    overall,
    suggestions: buildSuggestions(scores)
  }
}

module.exports = {
  evaluateSkillAnswer
}
