const contentGenerator = require('../../utils/contentGenerator.js')
const evaluationService = require('./evaluationService.js')

function normalizeKeywords(keywords) {
  if (!Array.isArray(keywords)) return []

  const seen = {}
  return keywords
    .map(keyword => String(keyword || '').trim())
    .filter(keyword => {
      if (!keyword || seen[keyword]) return false
      seen[keyword] = true
      return true
    })
}

function getQualityStatus(overall) {
  if (overall < 4) return 'pending_review'
  if (overall >= 4.5) return 'recommended_publish'
  return 'needs_manual_check'
}

function batchEvaluation(drafts) {
  return drafts.map(item => {
    const evaluation = evaluationService.evaluateAnswer(item.draft)

    return Object.assign({}, item, {
      evaluation,
      qualityStatus: getQualityStatus(evaluation.overall)
    })
  })
}

function generateOne(keyword) {
  return contentGenerator.generateDraft(keyword).then(draft => ({
    keyword,
    draft
  }))
}

function generateDrafts(keywords) {
  const normalizedKeywords = normalizeKeywords(keywords)

  return Promise.all(normalizedKeywords.map(generateOne))
    .then(batchEvaluation)
}

function generateBatch(keywords) {
  return generateDrafts(keywords).then(items => ({
    total: items.length,
    recommendedPublish: items.filter(item => item.qualityStatus === 'recommended_publish'),
    pendingReview: items.filter(item => item.qualityStatus === 'pending_review'),
    needsManualCheck: items.filter(item => item.qualityStatus === 'needs_manual_check'),
    items
  }))
}

module.exports = {
  normalizeKeywords,
  batchEvaluation,
  generateDrafts,
  generateBatch,
  getQualityStatus
}
