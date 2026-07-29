const serverApi = require('../server/api.js')

function explainTerm(term) {
  if (!term || !term.trim()) {
    return Promise.reject(new Error('Please enter a keyword to explain.'))
  }

  return serverApi.postExplain({
    keyword: term.trim()
  })
}

function getHotTerms() {
  return Promise.resolve({
    success: true,
    data: ['Token', 'API', '大模型', 'Prompt', 'Agent', 'AGI']
  })
}

function search(keyword) {
  return serverApi.getSearch({ keyword })
}

function sendFeedback(action, term) {
  return Promise.resolve({
    success: true,
    data: {
      action,
      term
    }
  })
}

function updateFavorite(action, term) {
  return Promise.resolve({
    success: true,
    data: {
      action,
      term
    }
  })
}

function getKnowledgeVersion() {
  return serverApi.getKnowledgeVersion()
}

function getAdminQuality() {
  return Promise.reject(new Error('Admin quality API has been removed.'))
}

function getAdminDashboard() {
  return Promise.reject(new Error('Admin dashboard API has been removed.'))
}

function getHealth() {
  return serverApi.getHealth()
}

function createBatchContent() {
  return Promise.reject(new Error('Batch content API has been removed.'))
}

function publishKnowledge() {
  return Promise.reject(new Error('Publish API has been removed.'))
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

  if (method === 'GET' && url === '/api/knowledge/version') {
    return serverApi.getKnowledgeVersion()
  }

  if (method === 'GET' && url === '/api/health') {
    return serverApi.getHealth()
  }

  return Promise.reject(new Error('API has been removed.'))
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

function getDailyWord() {
  return Promise.resolve({
    success: true,
    data: {
      term: 'AGI',
      shortDesc: '通用人工智能'
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
  getDailyWord,
  postExplain,
  request
}
