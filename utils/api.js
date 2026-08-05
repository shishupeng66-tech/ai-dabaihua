const CLOUD_FUNCTION_NAME = 'api'

function callCloudApi(action, data) {
  if (typeof wx === 'undefined' || !wx.cloud || !wx.cloud.callFunction) {
    return Promise.reject(new Error('CloudBase cloud function is not available.'))
  }

  return wx.cloud.callFunction({
    name: CLOUD_FUNCTION_NAME,
    data: {
      action,
      data: data || {}
    }
  }).then(res => {
    const result = res.result
    if (result && result.success === false) {
      const error = result.error || {}
      throw new Error(error.message || 'Cloud function request failed.')
    }

    return result
  })
}

function explainTerm(term) {
  if (!term || !term.trim()) {
    return Promise.reject(new Error('Please enter a keyword to explain.'))
  }

  return callCloudApi('explain', {
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
  return callCloudApi('search', { keyword })
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

function sendKnowledgeFeedback(payload) {
  return callCloudApi('knowledgeFeedback', payload)
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
  return callCloudApi('knowledgeVersion')
}

function getAdminQuality() {
  return Promise.reject(new Error('Admin quality API has been removed.'))
}

function getAdminDashboard() {
  return Promise.reject(new Error('Admin dashboard API has been removed.'))
}

function getHealth() {
  return callCloudApi('health')
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
    return callCloudApi('explain', data)
  }

  if (method === 'GET' && url === '/api/search') {
    return callCloudApi('search', data)
  }

  if (method === 'GET' && url === '/api/knowledge/version') {
    return callCloudApi('knowledgeVersion')
  }

  if (method === 'GET' && url === '/api/health') {
    return callCloudApi('health')
  }

  if (method === 'POST' && url === '/api/knowledge/feedback') {
    return callCloudApi('knowledgeFeedback', data)
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
  sendKnowledgeFeedback,
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
