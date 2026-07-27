const knowledgeRepository = require('../repositories/knowledgeRepository.js')
const pendingRepository = require('../repositories/pendingRepository.js')

function createId(term) {
  return String(term || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
}

function getNextVersion(existingVersion) {
  const parts = String(existingVersion || '1.0.0').split('.').map(Number)
  const major = parts[0] || 1
  const minor = parts[1] || 0
  const patch = (parts[2] || 0) + 1
  return `${major}.${minor}.${patch}`
}

function inferDifficultyLevel(draft) {
  if (draft.difficultyLevel) return draft.difficultyLevel
  if (draft.level === '进阶') return 'intermediate'
  return 'beginner'
}

function normalizeDraftToKnowledge(item, options) {
  const draft = item.draft || {}
  const now = new Date().toISOString()
  const term = draft.term || item.keyword
  const existing = knowledgeRepository.findByTerm(term)
  const version = options && options.version
    ? options.version
    : getNextVersion(existing && existing.version)

  return {
    id: existing ? existing.id : createId(term),
    term,
    aliases: draft.aliases || [item.keyword],
    category: draft.category || '待分类',
    level: draft.level || '入门',
    difficultyLevel: inferDifficultyLevel(draft),
    sourceType: draft.sourceType || 'internal',
    targetAudience: draft.targetAudience || 'normal',
    version,
    summary: draft.summary || '',
    analogy: draft.analogy || '',
    examples: draft.examples || [],
    usage: draft.usage || '',
    relatedTerms: draft.relatedTerms || [],
    searchCount: existing ? existing.searchCount || 0 : 0,
    author: options && options.author ? options.author : 'ai',
    reviewStatus: 'approved',
    createdAt: existing ? existing.createdAt : item.createdAt || now,
    updatedAt: now
  }
}

function createVersionLog(term, version, changeLog) {
  const record = {
    id: `knowledge-version-${createId(term)}-${version}`,
    term,
    version,
    changeLog: changeLog || 'Published approved draft',
    createdAt: new Date().toISOString()
  }

  return knowledgeRepository.saveVersionLog(record)
}

function publishApprovedDraft(item, options) {
  if (!item || item.status !== 'approved') {
    return Promise.reject(new Error('只能发布 approved draft'))
  }

  const knowledgeItem = normalizeDraftToKnowledge(item, options)
  const versionLog = createVersionLog(
    knowledgeItem.term,
    knowledgeItem.version,
    options && options.changeLog
  )

  knowledgeRepository.savePublishedTerm(knowledgeItem)
  pendingRepository.updatePendingItem(item.id, {
    status: 'published',
    publishedAt: new Date().toISOString()
  })

  return Promise.resolve({
    success: true,
    data: {
      knowledgeItem,
      versionLog
    }
  })
}

function publishApprovedDrafts(options) {
  const approvedItems = pendingRepository.getPendingItems().filter(item => item.status === 'approved')

  return Promise.all(approvedItems.map(item => publishApprovedDraft(item, options)))
}

function getPublishedTerms() {
  return knowledgeRepository.getPublishedTerms()
}

function getVersionLogs() {
  return knowledgeRepository.getVersionLogs()
}

module.exports = {
  publishApprovedDraft,
  publishApprovedDrafts,
  getPublishedTerms,
  getVersionLogs,
  normalizeDraftToKnowledge
}
