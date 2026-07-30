const serverApi = require('./server/api.js')

function getAction(event) {
  if (event && event.action) return event.action

  const path = String(event && (event.path || event.url) || '')
  if (path.indexOf('/api/explain') > -1) return 'explain'
  if (path.indexOf('/api/search') > -1) return 'search'
  if (path.indexOf('/api/knowledge/version') > -1) return 'knowledgeVersion'
  if (path.indexOf('/api/knowledge/feedback') > -1) return 'knowledgeFeedback'
  if (path.indexOf('/api/health') > -1) return 'health'

  return ''
}

function getPayload(event) {
  if (!event) return {}
  if (event.data && typeof event.data === 'object') return event.data
  if (event.queryStringParameters && typeof event.queryStringParameters === 'object') {
    return event.queryStringParameters
  }
  if (event.body && typeof event.body === 'string') {
    try {
      return JSON.parse(event.body)
    } catch (err) {
      return {}
    }
  }
  if (event.body && typeof event.body === 'object') return event.body
  return {}
}

async function dispatch(event) {
  const action = getAction(event)
  const payload = getPayload(event)

  if (action === 'explain') {
    return serverApi.postExplain(payload)
  }

  if (action === 'search') {
    return serverApi.getSearch(payload)
  }

  if (action === 'knowledgeVersion') {
    return serverApi.getKnowledgeVersion()
  }

  if (action === 'knowledgeFeedback') {
    return serverApi.postKnowledgeFeedback(payload)
  }

  if (action === 'health') {
    return serverApi.getHealth()
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ACTION',
      message: 'Unknown cloud function action.'
    }
  }
}

exports.main = async function main(event) {
  try {
    return await dispatch(event || {})
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err && err.message ? err.message : 'Internal server error.'
      }
    }
  }
}

module.exports.dispatch = dispatch
