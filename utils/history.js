const STORAGE_KEY = 'search_history'
const UNKNOWN_STORAGE_KEY = 'unknown_keywords'
const MAX_HISTORY_COUNT = 50
const pending = require('./pending.js')

function getStorage() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx
}

function getSearchHistory() {
  const storage = getStorage()
  if (!storage) return []

  return storage.getStorageSync(STORAGE_KEY) || []
}

function saveSearch(keyword, result) {
  const storage = getStorage()
  if (!storage) return

  const data = result && result.data ? result.data : {}
  const record = {
    keyword,
    hitKnowledge: Boolean(result && result.source !== 'llm'),
    hitTerm: data.term || '',
    matchType: result && result.matchType ? result.matchType : 'none',
    source: result && result.source ? result.source : '',
    searchedAt: new Date().toISOString()
  }

  const history = getSearchHistory()
  history.unshift(record)

  storage.setStorageSync(STORAGE_KEY, history.slice(0, MAX_HISTORY_COUNT))
}

function getUnknownKeywords() {
  const storage = getStorage()
  if (!storage) return []

  return storage.getStorageSync(UNKNOWN_STORAGE_KEY) || []
}

function saveUnknownKeyword(keyword) {
  const storage = getStorage()
  if (!storage) return

  const normalizedKeyword = String(keyword || '').trim()
  if (!normalizedKeyword) return

  const unknownKeywords = getUnknownKeywords()
  const existing = unknownKeywords.find(item => item.keyword === normalizedKeyword)
  const now = new Date().toISOString()

  if (existing) {
    existing.count += 1
    existing.time = now
  } else {
    unknownKeywords.unshift({
      keyword: normalizedKeyword,
      time: now,
      count: 1
    })
  }

  storage.setStorageSync(UNKNOWN_STORAGE_KEY, unknownKeywords)
  pending.addPendingKeyword(normalizedKeyword)
}

module.exports = {
  saveSearch,
  getSearchHistory,
  saveUnknownKeyword,
  getUnknownKeywords
}
