const knowledge = require('../../utils/knowledge.js')
const knowledgeLoader = require('../../utils/knowledgeLoader.js')

const publishedTerms = []
const versionLogs = []

function loadKnowledge() {
  return knowledgeLoader.loadKnowledge()
}

function loadKnowledgeVersion() {
  return knowledgeLoader.loadKnowledgeVersion()
}

function searchKnowledge(keyword) {
  return knowledge.searchKnowledge(keyword)
}

function searchSuggestions(keyword) {
  return knowledge.searchSuggestions(keyword)
}

function findByTerm(term) {
  const result = searchKnowledge(term)
  if (result.hit) return result.data

  return loadKnowledge().concat(publishedTerms).find(item => item.term === term)
}

function savePublishedTerm(term) {
  publishedTerms.unshift(term)
  return term
}

function updatePublishedTerm(term, patch) {
  const index = publishedTerms.findIndex(item => item.term === term || item.id === term)
  if (index === -1) return null

  publishedTerms[index] = Object.assign({}, publishedTerms[index], patch)
  return publishedTerms[index]
}

function deletePublishedTerm(term) {
  const index = publishedTerms.findIndex(item => item.term === term || item.id === term)
  if (index === -1) return publishedTerms

  publishedTerms.splice(index, 1)
  return publishedTerms
}

function getPublishedTerms() {
  return publishedTerms
}

function saveVersionLog(record) {
  versionLogs.unshift(record)
  return record
}

function getVersionLogs() {
  return versionLogs
}

module.exports = {
  loadKnowledge,
  loadKnowledgeVersion,
  searchKnowledge,
  searchSuggestions,
  findByTerm,
  savePublishedTerm,
  updatePublishedTerm,
  deletePublishedTerm,
  getPublishedTerms,
  saveVersionLog,
  getVersionLogs
}
