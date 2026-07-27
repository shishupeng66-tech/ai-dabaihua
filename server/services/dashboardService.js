const analyticsService = require('./analyticsService.js')
const modelUsageService = require('./modelUsageService.js')
const evaluationService = require('./evaluationService.js')
const qualityAnalyticsService = require('./qualityAnalyticsService.js')

function average(values) {
  if (!values.length) return 0
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
}

function toHotTerms(hotKeywords) {
  return Object.keys(hotKeywords || {})
    .map(keyword => ({
      keyword,
      count: hotKeywords[keyword]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function getTokenStats(usageLogs) {
  const inputTokens = usageLogs.reduce((sum, item) => sum + (item.inputTokens || 0), 0)
  const outputTokens = usageLogs.reduce((sum, item) => sum + (item.outputTokens || 0), 0)

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    averageInputTokens: average(usageLogs.map(item => item.inputTokens || 0)),
    averageOutputTokens: average(usageLogs.map(item => item.outputTokens || 0))
  }
}

function getDashboardData() {
  return analyticsService.getStats().then(statsResult => {
    const stats = statsResult.data || {}
    const usageLogs = modelUsageService.getUsageLogs()
    const evaluations = evaluationService.getEvaluations()
    const qualityReport = qualityAnalyticsService.getQualityReport()
    const todayKey = stats.todayKey
    const searchCount = stats.dailySearchCounts && stats.dailySearchCounts[todayKey]
      ? stats.dailySearchCounts[todayKey]
      : 0
    const totalSearchCount = stats.searchCount || 0
    const knowledgeHitCount = stats.knowledgeHitCount || 0
    const knowledgeHitRate = totalSearchCount
      ? Number(((knowledgeHitCount / totalSearchCount) * 100).toFixed(1))
      : 0

    return {
      searchCount,
      knowledgeHitRate,
      llmUsage: usageLogs.length,
      averageScore: average(evaluations.map(item => item.score || 0)),
      hotTerms: toHotTerms(stats.hotKeywords || {}),
      problemTerms: qualityReport.topProblems,
      tokenUsage: getTokenStats(usageLogs)
    }
  })
}

module.exports = {
  getDashboardData
}
