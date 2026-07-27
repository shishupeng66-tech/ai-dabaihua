// api.js - API请求层

const serverApi = require('../server/api.js')
const history = require('./history.js')

/**
 * 获取术语解释
 * @param {string} term - 要查询的术语
 * @returns {Promise<Object>} 解释结果
 */
function explainTerm(term) {
  if (!term || !term.trim()) {
    return Promise.reject(new Error('请输入要查询的术语'))
  }

  const keyword = term.trim()

  // 当前使用 server/api.js 模拟服务端接口。
  // 未来接入真实服务器时，将这里替换为 wx.request 到 config/env.js 里的 API_BASE_URL。
  return serverApi.postExplain({ keyword })
    .then(res => {
      history.saveSearch(keyword, res)
      if (res && res.source === 'llm') {
        history.saveUnknownKeyword(keyword)
      }
      return res
    })
}

/**
 * 获取热门词汇
 * @returns {Promise<Array>} 热门词汇列表
 */
function getHotTerms() {
  return serverApi.getSearch({ keyword: '' }).then(() => ({
    success: true,
    data: ['Token', 'API', '大模型', 'Prompt', 'Agent', 'AGI']
  }))
}

function search(keyword) {
  return serverApi.getSearch({ keyword })
}

function sendFeedback(action, term) {
  return serverApi.postFeedback({ action, term })
}

function updateFavorite(action, term) {
  return serverApi.postFavorite({ action, term })
}

function getKnowledgeVersion() {
  return serverApi.getKnowledgeVersion()
}

function getAdminQuality() {
  return serverApi.getAdminQuality()
}

function getAdminDashboard() {
  return serverApi.getAdminDashboard()
}

function getHealth() {
  return serverApi.getHealth()
}

function createBatchContent(keywords) {
  return serverApi.postAdminBatchContent({ keywords })
}

function publishKnowledge(payload) {
  return serverApi.postAdminPublish(payload || {})
}

function request(options) {
  const method = options.method
  const url = options.url
  const data = options.data || {}

  if (method === 'POST' && url === '/api/explain') {
    return serverApi.postExplain(data)
  }

  if (method === 'GET' && url === '/api/search') {
    return serverApi.getSearch(data)
  }

  if (method === 'POST' && url === '/api/feedback') {
    return serverApi.postFeedback(data)
  }

  if (method === 'POST' && url === '/api/favorite') {
    return serverApi.postFavorite(data)
  }

  if (method === 'GET' && url === '/api/knowledge/version') {
    return serverApi.getKnowledgeVersion()
  }

  if (method === 'GET' && url === '/api/admin/quality') {
    return serverApi.getAdminQuality()
  }

  if (method === 'GET' && url === '/api/admin/dashboard') {
    return serverApi.getAdminDashboard()
  }

  if (method === 'POST' && url === '/api/admin/batch-content') {
    return serverApi.postAdminBatchContent(data)
  }

  if (method === 'POST' && url === '/api/admin/publish') {
    return serverApi.postAdminPublish(data)
  }

  if (method === 'GET' && url === '/api/health') {
    return serverApi.getHealth()
  }

  return Promise.reject(new Error('未定义的接口'))
}

function postExplain(keyword) {
  return request({
    method: 'POST',
    url: '/api/explain',
    data: {
      keyword
    }
  })
}

/**
 * 获取每日一词
 * @returns {Promise<Object>} 每日一词
 */
function getDailyWord() {
  return Promise.resolve({
    success: true,
    data: {
      term: 'AGI',
      shortDesc: '通用人工智能 - 像人一样思考和学习的AI'
    }
  })
}

module.exports = {
  explainTerm,
  search,
  sendFeedback,
  updateFavorite,
  getKnowledgeVersion,
  getAdminQuality,
  getAdminDashboard,
  getHealth,
  createBatchContent,
  publishKnowledge,
  getHotTerms,
  getDailyWord
}
