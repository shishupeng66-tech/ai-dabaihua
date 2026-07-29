const knowledgeData = require('../data/knowledge/terms.json')
const versionData = require('../data/knowledge/version.json')

function loadKnowledge() {
  return knowledgeData
}

function loadKnowledgeVersion() {
  return versionData
}

module.exports = {
  loadKnowledge,
  loadKnowledgeVersion
}
