const knowledgeRepository = require('../repositories/knowledgeRepository.js')

function searchKnowledge(keyword) {
  return knowledgeRepository.searchKnowledge(keyword)
}

function getTerm(term) {
  return knowledgeRepository.searchKnowledge(term)
}

function searchSuggestions(keyword) {
  return knowledgeRepository.searchSuggestions(keyword)
}

function getVersion() {
  return knowledgeRepository.loadKnowledgeVersion()
}

module.exports = {
  searchKnowledge,
  getTerm,
  searchSuggestions,
  getVersion
}
