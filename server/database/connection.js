const env = require('../../config/env.js')

let client = null

function configure(databaseClient) {
  client = databaseClient
}

function getClient() {
  return client
}

function isConfigured() {
  return Boolean(client || env.DATABASE_URL)
}

function query(sql, params) {
  if (!client || typeof client.query !== 'function') {
    return Promise.reject(new Error('数据库客户端未配置'))
  }

  return client.query(sql, params || [])
}

module.exports = {
  configure,
  getClient,
  isConfigured,
  query
}
