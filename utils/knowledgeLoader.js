const knowledgeData = require('./knowledgeData.js')
const versionData = require('./knowledgeVersionData.js')

function normalizeKnowledgeData(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.terms)) return data.terms
  return []
}

function loadKnowledge() {
  return normalizeKnowledgeData(knowledgeData)
}

function loadKnowledgeVersion() {
  return versionData
}

module.exports = {
  loadKnowledge,
  loadKnowledgeVersion,
  normalizeKnowledgeData
}
