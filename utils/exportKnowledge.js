const knowledgeLoader = require('./knowledgeLoader.js')
const pending = require('./pending.js')

function normalizeApprovedItem(item) {
  const draft = item.draft || {}
  const now = new Date().toISOString()

  return {
    id: item.id.replace(/^pending-/, ''),
    term: draft.term || item.keyword,
    aliases: [item.keyword],
    category: draft.category || '待分类',
    level: draft.level || '入门',
    difficultyLevel: draft.difficultyLevel || (draft.level === '进阶' ? 'intermediate' : 'beginner'),
    sourceType: draft.sourceType || 'internal',
    targetAudience: draft.targetAudience || 'normal',
    version: draft.version || '1.0.0',
    summary: draft.summary || '',
    analogy: draft.analogy || '',
    examples: draft.examples || [],
    usage: draft.usage || '',
    relatedTerms: draft.relatedTerms || [],
    searchCount: 0,
    author: 'ai',
    reviewStatus: 'approved',
    createdAt: item.createdAt || now,
    updatedAt: now
  }
}

function exportKnowledge() {
  const baseKnowledge = knowledgeLoader.loadKnowledge()
  const approvedDrafts = pending
    .getPendingItems()
    .filter(item => item.status === 'approved')
    .map(normalizeApprovedItem)

  return baseKnowledge.concat(approvedDrafts)
}

function exportKnowledgeJSON() {
  return JSON.stringify(exportKnowledge(), null, 2)
}

module.exports = {
  exportKnowledge,
  exportKnowledgeJSON
}
