const assert = require('assert')
const repository = require('../../server/repositories/searchLogRepository.js')

repository.recordSearch('Repo Search', {
  source: 'knowledge',
  data: { term: 'Repo Search' }
})

const list = repository.listSearchRecords()
assert.ok(list.length > 0)

const record = list[0]
assert.strictEqual(repository.findSearchRecord(record.id).keyword, 'Repo Search')

repository.updateSearchRecord(record.id, { keyword: 'Repo Search Updated' })
assert.strictEqual(repository.findSearchRecord(record.id).keyword, 'Repo Search Updated')

const stats = repository.getStats()
assert.ok(stats.searchCount >= 1)

repository.deleteSearchRecord(record.id)
assert.strictEqual(repository.findSearchRecord(record.id), undefined)

console.log('searchLogRepository ok')
