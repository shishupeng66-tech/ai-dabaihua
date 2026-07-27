const assert = require('assert')
const repository = require('../../server/repositories/pendingRepository.js')

global.wx = {
  storage: {},
  getStorageSync(key) {
    return this.storage[key]
  },
  setStorageSync(key, value) {
    this.storage[key] = value
  }
}

repository.savePendingItems([])

const item = {
  id: 'pending-repo-test',
  keyword: 'Repo Pending',
  status: 'pending',
  draft: '',
  createdAt: new Date().toISOString()
}

repository.createPendingItem(item)
assert.strictEqual(repository.findPendingItem(item.id).keyword, item.keyword)

repository.updatePendingItem(item.id, { status: 'approved' })
assert.strictEqual(repository.findPendingItem(item.id).status, 'approved')

assert.strictEqual(repository.getPendingItems().length, 1)

repository.deletePendingItem(item.id)
assert.strictEqual(repository.findPendingItem(item.id), undefined)

console.log('pendingRepository ok')
