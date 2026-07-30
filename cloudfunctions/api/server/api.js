const explainService = require('./services/explainService.js')
const knowledgeService = require('./services/knowledgeService.js')
const loggerService = require('./services/loggerService.js')
const healthService = require('./services/healthService.js')
const knowledgeFeedbackService = require('./services/knowledgeFeedbackService.js')

function observeApi(api, payload, handler) {
  const requestId = payload && payload.requestId ? payload.requestId : loggerService.createRequestId()
  const keyword = payload && payload.keyword ? payload.keyword : ''
  const start = Date.now()

  return Promise.resolve()
    .then(handler)
    .then(result => {
      loggerService.logRequest({
        requestId,
        userId: payload && payload.userId,
        api,
        keyword,
        duration: Date.now() - start
      })
      return result
    })
    .catch(err => {
      loggerService.logRequest({
        requestId,
        userId: payload && payload.userId,
        api,
        keyword,
        duration: Date.now() - start,
        error: err.message
      })
      loggerService.logError({
        requestId,
        error: err
      })
      return Promise.reject(err)
    })
}

function validateKeyword(keyword) {
  const normalizedKeyword = String(keyword || '').trim()
  if (!normalizedKeyword) {
    throw new Error('Please enter a keyword to explain.')
  }

  return normalizedKeyword
}

function postExplain(payload) {
  try {
    const keyword = validateKeyword(payload && payload.keyword)
    return observeApi('/api/explain', Object.assign({}, payload, { keyword }), () => (
      explainService.explain({
        keyword,
        mode: payload && payload.mode
      })
    ))
  } catch (err) {
    return Promise.reject(err)
  }
}

function getSearch(query) {
  const keyword = query && query.keyword ? query.keyword : ''

  return observeApi('/api/search', query || {}, () => Promise.resolve({
    success: true,
    data: {
      keyword,
      suggestions: knowledgeService.searchSuggestions(keyword),
      result: keyword ? knowledgeService.searchKnowledge(keyword) : {
        hit: false,
        matchType: 'none',
        score: 0
      }
    }
  }))
}

function getKnowledgeVersion() {
  return Promise.resolve({
    success: true,
    data: knowledgeService.getVersion()
  })
}

function getHealth() {
  return Promise.resolve(healthService.getHealth())
}

function postKnowledgeFeedback(payload) {
  return observeApi('/api/knowledge/feedback', payload || {}, () => Promise.resolve({
    success: true,
    data: knowledgeFeedbackService.submitFeedback(payload || {})
  }))
}

module.exports = {
  postExplain,
  getSearch,
  getKnowledgeVersion,
  getHealth,
  postKnowledgeFeedback
}
