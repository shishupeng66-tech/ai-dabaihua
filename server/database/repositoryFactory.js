const connection = require('./connection.js')

function createRepository(memoryRepository, databaseRepository) {
  if (connection.isConfigured() && databaseRepository) {
    return databaseRepository
  }

  return memoryRepository
}

module.exports = {
  createRepository
}
