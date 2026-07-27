const evaluationService = require('./evaluationService.js')
const knowledgeRepository = require('../repositories/knowledgeRepository.js')

function average(values) {
  if (!values.length) return 0
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item)
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
    return groups
  }, {})
}

function summarizeGroup(groups) {
  return Object.keys(groups).map(key => {
    const records = groups[key]

    return {
      name: key,
      count: records.length,
      averageScore: average(records.map(record => record.score || 0))
    }
  }).sort((a, b) => b.averageScore - a.averageScore)
}

function getAverageScore(records) {
  return average(records.map(record => record.score || 0))
}

function getTopProblems(records) {
  return records
    .filter(record => (record.score || 0) < 3.5)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 10)
    .map(record => ({
      keyword: record.keyword,
      mode: record.mode,
      score: record.score,
      clarityScore: record.clarityScore,
      analogyScore: record.analogyScore,
      scenarioScore: record.scenarioScore,
      accuracyScore: record.accuracyScore,
      simplicityScore: record.simplicityScore,
      usefulnessScore: record.usefulnessScore,
      promptName: record.promptName,
      promptVersion: record.promptVersion
    }))
}

function getPromptPerformance(records) {
  return summarizeGroup(groupBy(records, record => {
    const promptName = record.promptName || 'unknown'
    const promptVersion = record.promptVersion || 'unknown'
    return `${promptName}@${promptVersion}`
  }))
}

function getKnowledgeTermPerformance(records) {
  return summarizeGroup(groupBy(records.filter(record => record.source === 'knowledge'), record => (
    record.keyword || 'unknown'
  )))
}

function scoreKnowledgeTerm(term) {
  let score = 0

  if (term.summary) score += 1
  if (term.analogy) score += 1
  if (term.examples && term.examples.length > 0) score += 1
  if (term.usage) score += 1
  if (term.relatedTerms && term.relatedTerms.length > 0) score += 0.5
  if (term.difficultyLevel && term.sourceType && term.targetAudience && term.version) score += 0.5

  return Math.min(5, score)
}

function getKnowledgeQualityStats() {
  const terms = knowledgeRepository.loadKnowledge()
  const scoredTerms = terms.map(term => ({
    id: term.id,
    term: term.term,
    category: term.category,
    score: scoreKnowledgeTerm(term)
  }))
  const categoryGroups = groupBy(scoredTerms, item => item.category || '未分类')

  return {
    averageTermScore: getAverageScore(scoredTerms),
    categoryScores: summarizeGroup(categoryGroups),
    lowQualityTerms: scoredTerms
      .filter(item => item.score < 4)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
  }
}

function getQualityReport() {
  const records = evaluationService.getEvaluations()
  const knowledgeQuality = getKnowledgeQualityStats()

  return {
    averageScore: getAverageScore(records),
    topProblems: getTopProblems(records),
    promptPerformance: getPromptPerformance(records),
    knowledgeTermPerformance: getKnowledgeTermPerformance(records),
    averageTermScore: knowledgeQuality.averageTermScore,
    categoryScores: knowledgeQuality.categoryScores,
    lowQualityTerms: knowledgeQuality.lowQualityTerms,
    totalEvaluations: records.length
  }
}

module.exports = {
  getQualityReport
}
