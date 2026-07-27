const knowledgeData = require('../data/knowledge.json')
const versionData = require('../data/version.json')

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
