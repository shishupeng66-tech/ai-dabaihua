const STORAGE_KEY = 'answer_evaluations'
const memoryEvaluations = []

function getStorage() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx
}

function saveEvaluation(record) {
  const storage = getStorage()

  if (!storage) {
    memoryEvaluations.unshift(record)
    return record
  }

  const records = storage.getStorageSync(STORAGE_KEY) || []
  records.unshift(record)
  storage.setStorageSync(STORAGE_KEY, records)

  return record
}

function findEvaluation(id) {
  return getEvaluations().find(item => item.id === id)
}

function updateEvaluation(id, patch) {
  const records = getEvaluations().map(item => (
    item.id === id ? Object.assign({}, item, patch) : item
  ))
  const storage = getStorage()

  if (storage) {
    storage.setStorageSync(STORAGE_KEY, records)
  } else {
    memoryEvaluations.splice(0, memoryEvaluations.length, ...records)
  }

  return findEvaluation(id)
}

function deleteEvaluation(id) {
  const records = getEvaluations().filter(item => item.id !== id)
  const storage = getStorage()

  if (storage) {
    storage.setStorageSync(STORAGE_KEY, records)
  } else {
    memoryEvaluations.splice(0, memoryEvaluations.length, ...records)
  }

  return records
}

function getEvaluations() {
  const storage = getStorage()
  if (!storage) return memoryEvaluations

  return storage.getStorageSync(STORAGE_KEY) || []
}

module.exports = {
  saveEvaluation,
  findEvaluation,
  updateEvaluation,
  deleteEvaluation,
  getEvaluations
}
