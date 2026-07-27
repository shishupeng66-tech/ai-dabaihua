const analytics = require('../../utils/analytics.js')
const searchRecords = []

function recordSearch(keyword, result) {
  analytics.recordSearch(keyword, result)
  searchRecords.unshift({
    id: `search-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    keyword,
    result,
    createdAt: new Date().toISOString()
  })
  return true
}

function recordFeedback(action, term) {
  analytics.recordFeedback(action, term)
  return true
}

function getStats() {
  return Object.assign({}, analytics.getAnalytics(), {
    todayKey: analytics.getTodayKey()
  })
}

function listSearchRecords() {
  return searchRecords
}

function findSearchRecord(id) {
  return searchRecords.find(item => item.id === id)
}

function updateSearchRecord(id, patch) {
  const index = searchRecords.findIndex(item => item.id === id)
  if (index === -1) return null

  searchRecords[index] = Object.assign({}, searchRecords[index], patch)
  return searchRecords[index]
}

function deleteSearchRecord(id) {
  const index = searchRecords.findIndex(item => item.id === id)
  if (index === -1) return searchRecords

  searchRecords.splice(index, 1)
  return searchRecords
}

module.exports = {
  recordSearch,
  recordFeedback,
  getStats,
  listSearchRecords,
  findSearchRecord,
  updateSearchRecord,
  deleteSearchRecord
}
