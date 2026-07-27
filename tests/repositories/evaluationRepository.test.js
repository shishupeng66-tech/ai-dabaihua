const assert = require('assert')
const repository = require('../../server/repositories/evaluationRepository.js')

const record = {
  id: 'evaluation-repo-test',
  keyword: 'Repo Evaluation',
  score: 4.5,
  createdAt: new Date().toISOString()
}

repository.saveEvaluation(record)
assert.strictEqual(repository.findEvaluation(record.id).score, 4.5)

repository.updateEvaluation(record.id, { score: 4.8 })
assert.strictEqual(repository.findEvaluation(record.id).score, 4.8)

assert.ok(repository.getEvaluations().some(item => item.id === record.id))

repository.deleteEvaluation(record.id)
assert.strictEqual(repository.findEvaluation(record.id), undefined)

console.log('evaluationRepository ok')
