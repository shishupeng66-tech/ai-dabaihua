const pendingSeed = require('../data/pending.json')
const contentGenerator = require('./contentGenerator.js')

const STORAGE_KEY = 'pending_keywords'
let memoryPendingItems = null

function getStorage() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx
}

function createId(keyword) {
  const normalized = String(keyword || '').trim().toLowerCase().replace(/\s+/g, '-')
  return `pending-${normalized || Date.now()}`
}

function getPendingItems() {
  const storage = getStorage()
  const seedItems = pendingSeed.filter(item => item.keyword)

  if (!storage) {
    if (!memoryPendingItems) {
      memoryPendingItems = seedItems.slice()
    }
    return memoryPendingItems
  }

  return storage.getStorageSync(STORAGE_KEY) || seedItems
}

function savePendingItems(items) {
  const storage = getStorage()
  if (!storage) {
    memoryPendingItems = items
    return memoryPendingItems
  }

  storage.setStorageSync(STORAGE_KEY, items)
  return items
}

function addPendingKeyword(keyword) {
  const normalizedKeyword = String(keyword || '').trim()
  if (!normalizedKeyword) return getPendingItems()

  const items = getPendingItems()
  const existing = items.find(item => item.keyword === normalizedKeyword)

  if (existing) {
    return items
  }

  items.unshift({
    id: createId(normalizedKeyword),
    keyword: normalizedKeyword,
    source: 'user_search',
    draft: '',
    status: 'pending',
    createdAt: new Date().toISOString()
  })

  return savePendingItems(items)
}

function updatePendingItem(id, patch) {
  const items = getPendingItems().map(item => {
    if (item.id !== id) return item
    return Object.assign({}, item, patch)
  })

  return savePendingItems(items)
}

function removePendingItem(id) {
  const items = getPendingItems().filter(item => item.id !== id)
  return savePendingItems(items)
}

function generateDraftForItem(id) {
  const item = getPendingItems().find(item => item.id === id)
  if (!item) {
    return Promise.reject(new Error('未找到待审核词条'))
  }

  return contentGenerator.generateDraft(item.keyword).then(draft => {
    updatePendingItem(id, {
      draft,
      status: item.status || 'pending'
    })

    return draft
  })
}

function generateDraftsForPendingItems() {
  const pendingItems = getPendingItems().filter(item => item.status === 'pending' && !item.draft)

  return Promise.all(pendingItems.map(item => generateDraftForItem(item.id)))
    .then(() => getPendingItems())
}

module.exports = {
  addPendingKeyword,
  getPendingItems,
  savePendingItems,
  updatePendingItem,
  removePendingItem,
  generateDraftForItem,
  generateDraftsForPendingItems
}
