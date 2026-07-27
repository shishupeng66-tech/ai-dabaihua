const searchLogRepository = require('../repositories/searchLogRepository.js')

function recordSearch(keyword, result) {
  searchLogRepository.recordSearch(keyword, result)

  return Promise.resolve({
    success: true
  })
}

function recordFeedback(action, term) {
  searchLogRepository.recordFeedback(action, term)

  return Promise.resolve({
    success: true,
    data: {
      action,
      term
    }
  })
}

function getStats() {
  return Promise.resolve({
    success: true,
    data: searchLogRepository.getStats()
  })
}

module.exports = {
  recordSearch,
  recordFeedback,
  getStats
}
