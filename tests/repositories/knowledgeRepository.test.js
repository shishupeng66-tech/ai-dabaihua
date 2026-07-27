const assert = require('assert')
const repository = require('../../server/repositories/knowledgeRepository.js')

const term = {
  id: 'repo-test-term',
  term: 'Repo Test Term',
  version: '1.0.0'
}

const created = repository.savePublishedTerm(term)
assert.strictEqual(created.term, term.term)

const found = repository.findByTerm(term.term)
assert.strictEqual(found.id, term.id)

const updated = repository.updatePublishedTerm(term.term, { version: '1.0.1' })
assert.strictEqual(updated.version, '1.0.1')

assert.ok(repository.getPublishedTerms().some(item => item.id === term.id))

repository.deletePublishedTerm(term.term)
assert.strictEqual(repository.findByTerm(term.term), undefined)

const versionLog = repository.saveVersionLog({
  id: 'repo-test-version',
  term: term.term,
  version: '1.0.1',
  changeLog: 'test',
  createdAt: new Date().toISOString()
})
assert.strictEqual(versionLog.version, '1.0.1')
assert.ok(repository.getVersionLogs().some(item => item.id === versionLog.id))

console.log('knowledgeRepository ok')
