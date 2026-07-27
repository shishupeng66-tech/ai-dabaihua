const assert = require('assert')
const repository = require('../../server/repositories/modelUsageRepository.js')

const record = {
  id: 'usage-repo-test',
  model: 'hunyuan',
  inputTokens: 10,
  outputTokens: 20,
  keyword: 'Repo Usage',
  createdAt: new Date().toISOString()
}

repository.saveUsageLog(record)
assert.strictEqual(repository.findUsageLog(record.id).keyword, record.keyword)

repository.updateUsageLog(record.id, { outputTokens: 30 })
assert.strictEqual(repository.findUsageLog(record.id).outputTokens, 30)

assert.ok(repository.getUsageLogs().some(item => item.id === record.id))

repository.deleteUsageLog(record.id)
assert.strictEqual(repository.findUsageLog(record.id), undefined)

console.log('modelUsageRepository ok')
