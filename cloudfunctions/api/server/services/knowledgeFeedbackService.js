const knowledgeFeedbackRepository = require('../repositories/knowledgeFeedbackRepository.js')

const VALID_SECTIONS = ['lifeExample']
const VALID_FEEDBACK_TYPES = ['understood', 'not_understood']

function createId() {
  return `kf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function normalizeTerm(term) {
  return String(term || '').trim()
}

function normalizeExampleIndex(exampleIndex) {
  const index = Number(exampleIndex)
  return Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0
}

function submitFeedback(input) {
  const term = normalizeTerm(input && input.term)
  const section = String(input && input.section || '').trim()
  const feedbackType = String(input && input.feedbackType || '').trim()

  if (!term) {
    throw new Error('term is required.')
  }

  if (VALID_SECTIONS.indexOf(section) === -1) {
    throw new Error('Unsupported feedback section.')
  }

  if (VALID_FEEDBACK_TYPES.indexOf(feedbackType) === -1) {
    throw new Error('Unsupported feedback type.')
  }

  return knowledgeFeedbackRepository.create({
    id: createId(),
    term,
    section,
    exampleIndex: normalizeExampleIndex(input.exampleIndex),
    feedbackType,
    createdAt: new Date().toISOString()
  })
}

function listFeedback() {
  return knowledgeFeedbackRepository.list()
}

module.exports = {
  submitFeedback,
  listFeedback,
  VALID_SECTIONS,
  VALID_FEEDBACK_TYPES
}
