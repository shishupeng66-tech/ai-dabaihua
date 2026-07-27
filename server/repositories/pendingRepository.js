const pending = require('../../utils/pending.js')

function getPendingItems() {
  return pending.getPendingItems()
}

function findPendingItem(id) {
  return getPendingItems().find(item => item.id === id)
}

function createPendingItem(item) {
  const items = getPendingItems()
  items.unshift(item)
  return savePendingItems(items)
}

function updatePendingItem(id, patch) {
  return pending.updatePendingItem(id, patch)
}

function deletePendingItem(id) {
  const items = getPendingItems().filter(item => item.id !== id)
  return savePendingItems(items)
}

function savePendingItems(items) {
  return pending.savePendingItems(items)
}

module.exports = {
  getPendingItems,
  findPendingItem,
  createPendingItem,
  updatePendingItem,
  deletePendingItem,
  savePendingItems
}
