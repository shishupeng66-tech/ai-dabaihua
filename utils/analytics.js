const STORAGE_KEY = 'local_analytics'
const memoryStats = createDefaultStats()

function getStorage() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx
}

function createDefaultStats() {
  return {
    searchCount: 0,
    knowledgeHitCount: 0,
    llmCallCount: 0,
    dailySearchCounts: {},
    hotKeywords: {},
    feedback: {
      helpfulCount: 0,
      reExplainCount: 0
    }
  }
}

function getTodayKey() {
  const now = new Date()
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return chinaTime.toISOString().slice(0, 10)
}

function getAnalytics() {
  const storage = getStorage()
  if (!storage) return memoryStats

  return Object.assign(createDefaultStats(), storage.getStorageSync(STORAGE_KEY) || {})
}

function recordSearch(keyword, result) {
  const storage = getStorage()
  const stats = getAnalytics()
  const normalizedKeyword = String(keyword || '').trim()
  const isLLM = result && result.source === 'llm'

  stats.searchCount += 1
  stats.knowledgeHitCount += isLLM ? 0 : 1
  stats.llmCallCount += isLLM ? 1 : 0
  stats.dailySearchCounts = stats.dailySearchCounts || {}
  stats.dailySearchCounts[getTodayKey()] = (stats.dailySearchCounts[getTodayKey()] || 0) + 1

  if (normalizedKeyword) {
    stats.hotKeywords[normalizedKeyword] = (stats.hotKeywords[normalizedKeyword] || 0) + 1
  }

  if (storage) {
    storage.setStorageSync(STORAGE_KEY, stats)
  }
}

function recordFeedback(action, term) {
  const storage = getStorage()
  const stats = getAnalytics()
  stats.feedback = stats.feedback || createDefaultStats().feedback

  if (action === 'helpful') {
    stats.feedback.helpfulCount += 1
  }

  if (action === 're_explain') {
    stats.feedback.reExplainCount += 1
  }

  if (storage) {
    storage.setStorageSync(STORAGE_KEY, stats)
  }
}

function getHitRate() {
  const stats = getAnalytics()
  if (!stats.searchCount) return 0

  return Math.round((stats.knowledgeHitCount / stats.searchCount) * 100)
}

module.exports = {
  recordSearch,
  recordFeedback,
  getAnalytics,
  getHitRate,
  getTodayKey
}
