const requestLogs = []
const errorLogs = []

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function createRequestId() {
  return createId('req')
}

function logRequest(payload) {
  const record = {
    id: createId('request-log'),
    requestId: payload && payload.requestId ? payload.requestId : createRequestId(),
    userId: payload && payload.userId ? payload.userId : '',
    api: payload && payload.api ? payload.api : '',
    keyword: payload && payload.keyword ? payload.keyword : '',
    duration: payload && typeof payload.duration === 'number' ? payload.duration : 0,
    error: payload && payload.error ? payload.error : '',
    createdAt: new Date().toISOString()
  }

  requestLogs.unshift(record)
  return record
}

function logError(payload) {
  const error = payload && payload.error ? payload.error : {}
  const record = {
    id: createId('error-log'),
    requestId: payload && payload.requestId ? payload.requestId : '',
    errorType: error.name || payload && payload.errorType ? payload.errorType : 'Error',
    message: error.message || payload && payload.message ? payload.message : '',
    stack: error.stack || payload && payload.stack ? payload.stack : '',
    createdAt: new Date().toISOString()
  }

  errorLogs.unshift(record)
  return record
}

function getRequestLogs() {
  return requestLogs
}

function getErrorLogs() {
  return errorLogs
}

module.exports = {
  createRequestId,
  logRequest,
  logError,
  getRequestLogs,
  getErrorLogs
}
