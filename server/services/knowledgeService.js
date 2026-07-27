const knowledgeRepository = require('../repositories/knowledgeRepository.js')
const performanceService = require('./performanceService.js')

function searchKnowledge(keyword) {
  return performanceService.measure('knowledge', 'knowledge.search', () => (
    knowledgeRepository.searchKnowledge(keyword)
  ))
}

function getTerm(term) {
  return performanceService.measure('knowledge', 'knowledge.getTerm', () => (
    knowledgeRepository.searchKnowledge(term)
  ))
}

function searchSuggestions(keyword) {
  return performanceService.measure('knowledge', 'knowledge.suggestions', () => (
    knowledgeRepository.searchSuggestions(keyword)
  ))
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
