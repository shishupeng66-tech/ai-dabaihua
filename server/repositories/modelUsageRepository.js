const STORAGE_KEY = 'model_usage_logs'
const memoryUsageLogs = []

function getStorage() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx
}

function getUsageLogs() {
  const storage = getStorage()
  if (!storage) return memoryUsageLogs

  return storage.getStorageSync(STORAGE_KEY) || []
}

function findUsageLog(id) {
  return getUsageLogs().find(item => item.id === id)
}

function saveUsageLog(record) {
  const storage = getStorage()
  const logs = getUsageLogs()
  logs.unshift(record)

  if (storage) {
    storage.setStorageSync(STORAGE_KEY, logs)
  }

  return record
}

function updateUsageLog(id, patch) {
  const logs = getUsageLogs().map(item => (
    item.id === id ? Object.assign({}, item, patch) : item
  ))
  const storage = getStorage()

  if (storage) {
    storage.setStorageSync(STORAGE_KEY, logs)
  } else {
    memoryUsageLogs.splice(0, memoryUsageLogs.length, ...logs)
  }

  return findUsageLog(id)
}

function deleteUsageLog(id) {
  const logs = getUsageLogs().filter(item => item.id !== id)
  const storage = getStorage()

  if (storage) {
    storage.setStorageSync(STORAGE_KEY, logs)
  } else {
    memoryUsageLogs.splice(0, memoryUsageLogs.length, ...logs)
  }

  return logs
}

module.exports = {
  getUsageLogs,
  findUsageLog,
  saveUsageLog,
  updateUsageLog,
  deleteUsageLog
}
