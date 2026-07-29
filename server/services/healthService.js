const env = require('../../config/env.js')
const knowledgeService = require('./knowledgeService.js')
const hunyuanService = require('./hunyuanService.js')

function getHealth() {
  const version = knowledgeService.getVersion()

  return {
    status: 'ok',
    version: version.version || '',
    services: {
      database: env.DATABASE_URL ? 'configured' : 'mock',
      hunyuan: env.CLOUDBASE_AI_API_KEY ? 'configured' : 'mock',
      cache: hunyuanService.resultCache ? 'memory' : 'unknown'
    }
  }
}

module.exports = {
  getHealth
}
