const modelUsageRepository = require('../repositories/modelUsageRepository.js')

function createId() {
  return `model-usage-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function estimateTokens(text) {
  return Math.ceil(String(text || '').length / 2)
}

function getUsageLogs() {
  return modelUsageRepository.getUsageLogs()
}

function recordUsage(payload) {
  const prompt = payload && payload.prompt ? payload.prompt : ''
  const output = payload && payload.output ? payload.output : ''
  const record = {
    id: createId(),
    userId: payload && payload.userId ? payload.userId : '',
    model: payload && payload.model ? payload.model : '',
    inputTokens: payload && payload.inputTokens ? payload.inputTokens : estimateTokens(prompt),
    outputTokens: payload && payload.outputTokens ? payload.outputTokens : estimateTokens(output),
    keyword: payload && payload.keyword ? payload.keyword : '',
    createdAt: new Date().toISOString()
  }

  return modelUsageRepository.saveUsageLog(record)
}

module.exports = {
  recordUsage,
  getUsageLogs,
  estimateTokens
}
