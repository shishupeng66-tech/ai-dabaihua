const evaluationRepository = require('../repositories/evaluationRepository.js')

function clampScore(score) {
  return Math.max(0, Math.min(5, score))
}

function createId() {
  return `answer-evaluation-${Date.now()}-${Math.floor(Math.random() * 10000)}`
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

function scoreClarity(answer) {
  const summary = answer && (answer.summary || answer.explanation)
  if (!summary) return 0

  const length = summary.length
  let score = 3

  if (length >= 15 && length <= 120) score += 1
  if (!/[{}[\]<>]/.test(summary)) score += 1

  return clampScore(score)
}

function scoreAnalogy(answer) {
  const analogy = answer && answer.analogy ? String(answer.analogy).trim() : ''
  if (!analogy) return 0
  if (analogy.length >= 8 && analogy.length <= 80) return 5
  if (analogy.length > 80 && analogy.length <= 140) return 4
  return 3
}

function scoreScenario(answer) {
  const examples = answer && answer.examples ? answer.examples : []
  const usefulExamples = examples.filter(item => String(item || '').trim().length >= 8)

  if (usefulExamples.length >= 3) return 5
  if (usefulExamples.length === 2) return 4
  if (usefulExamples.length === 1) return 3

  return 0
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
    /真实key/,
    /准确价格/
  ]

  if (riskyPatterns.some(pattern => pattern.test(text))) {
    score -= 1
  }

  if (answer && answer.relatedTerms && answer.relatedTerms.length > 5) {
    score -= 1
  }

  return clampScore(score)
}

function scoreSimplicity(answer) {
  const text = getText(answer)
  if (!text) return 0

  let score = 5
  const jargonPatterns = [
    /Transformer/,
    /gradient/i,
    /backpropagation/i,
    /loss function/i,
    /embedding space/i,
    /高维向量空间/
  ]

  if (jargonPatterns.some(pattern => pattern.test(text))) {
    score -= 1
  }

  if (text.length > 600) {
    score -= 1
  }

  return clampScore(score)
}

function scoreUsefulness(answer) {
  let score = 0

  if (answer && (answer.summary || answer.explanation)) score += 1
  if (answer && answer.analogy) score += 1
  if (answer && answer.examples && answer.examples.length > 0) score += 1
  if (answer && answer.usage) score += 1
  if (answer && answer.relatedTerms) score += 1

  return clampScore(score)
}

function evaluateAnswer(answer) {
  const clarity = scoreClarity(answer)
  const analogy = scoreAnalogy(answer)
  const scenario = scoreScenario(answer)
  const accuracy = scoreAccuracy(answer)
  const simplicity = scoreSimplicity(answer)
  const usefulness = scoreUsefulness(answer)
  const overall = Number((
    clarity * 0.2 +
    analogy * 0.15 +
    scenario * 0.15 +
    accuracy * 0.25 +
    simplicity * 0.1 +
    usefulness * 0.15
  ).toFixed(1))

  return {
    clarity,
    analogy,
    scenario,
    accuracy,
    simplicity,
    usefulness,
    overall
  }
}

function saveEvaluation(payload) {
  const answer = payload && payload.answer ? payload.answer : payload
  const evaluation = evaluateAnswer(answer)
  const record = {
    id: createId(),
    keyword: payload && payload.keyword ? payload.keyword : answer && answer.term ? answer.term : '',
    mode: payload && payload.mode ? payload.mode : answer && answer.mode ? answer.mode : 'normal',
    score: evaluation.overall,
    clarityScore: evaluation.clarity,
    analogyScore: evaluation.analogy,
    scenarioScore: evaluation.scenario,
    accuracyScore: evaluation.accuracy,
    simplicityScore: evaluation.simplicity,
    usefulnessScore: evaluation.usefulness,
    humanScore: payload && payload.humanScore ? payload.humanScore : 0,
    promptName: payload && payload.promptName ? payload.promptName : '',
    promptVersion: payload && payload.promptVersion ? payload.promptVersion : '',
    source: payload && payload.source ? payload.source : '',
    createdAt: new Date().toISOString()
  }

  return evaluationRepository.saveEvaluation(record)
}

function getEvaluations() {
  return evaluationRepository.getEvaluations()
}

module.exports = {
  evaluateAnswer,
  saveEvaluation,
  getEvaluations
}
