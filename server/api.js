const explainService = require('./services/explainService.js')
const knowledgeService = require('./services/knowledgeService.js')
const analyticsService = require('./services/analyticsService.js')
const favoriteService = require('./services/favoriteService.js')
const qualityAnalyticsService = require('./services/qualityAnalyticsService.js')
const dashboardService = require('./services/dashboardService.js')
const batchContentService = require('./services/batchContentService.js')
const publishService = require('./services/publishService.js')
const authService = require('./services/authService.js')
const loggerService = require('./services/loggerService.js')
const performanceService = require('./services/performanceService.js')
const healthService = require('./services/healthService.js')

function observeApi(api, payload, handler) {
  const requestId = payload && payload.requestId ? payload.requestId : loggerService.createRequestId()
  const keyword = payload && payload.keyword ? payload.keyword : ''
  const start = Date.now()

  return performanceService.measure('api', api, handler, requestId)
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
    throw new Error('请输入要查询的术语')
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
      }).then(result => {
        analyticsService.recordSearch(keyword, result)
        return result
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

function postFeedback(payload) {
  const action = payload && payload.action ? payload.action : ''
  const term = payload && payload.term ? payload.term : ''

  if (!action) {
    return Promise.reject(new Error('缺少反馈类型'))
  }

  return analyticsService.recordFeedback(action, term)
}

function postFavorite(payload) {
  const term = payload && payload.term ? payload.term : ''
  const action = payload && payload.action ? payload.action : 'add'

  if (!term) {
    return Promise.reject(new Error('缺少收藏词条'))
  }

  return favoriteService.updateFavorite(action, term)
}

function getKnowledgeVersion() {
  return Promise.resolve({
    success: true,
    data: knowledgeService.getVersion()
  })
}

function getAdminQuality() {
  return Promise.resolve({
    success: true,
    data: qualityAnalyticsService.getQualityReport()
  })
}

function getAdminDashboard() {
  return dashboardService.getDashboardData().then(data => ({
    success: true,
    data
  }))
}

function postAdminBatchContent(payload) {
  const keywords = payload && payload.keywords ? payload.keywords : []

  return batchContentService.generateBatch(keywords).then(data => ({
    success: true,
    data
  }))
}

function postAdminPublish(payload) {
  const item = payload && payload.item ? payload.item : null
  const options = payload && payload.options ? payload.options : {}

  if (item) {
    return publishService.publishApprovedDraft(item, options)
  }

  return publishService.publishApprovedDrafts(options).then(data => ({
    success: true,
    data
  }))
}

function postAuthWechat(payload) {
  return authService.loginWithWechatCode(
    payload && payload.code,
    payload && payload.profile
  )
}

function getHealth() {
  return Promise.resolve(healthService.getHealth())
}

module.exports = {
  postExplain,
  getSearch,
  postFeedback,
  postFavorite,
  getKnowledgeVersion,
  getAdminQuality,
  getAdminDashboard,
  postAdminBatchContent,
  postAdminPublish,
  postAuthWechat,
  getHealth
}
