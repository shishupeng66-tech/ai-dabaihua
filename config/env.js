const runtimeEnv = typeof process !== 'undefined' && process.env ? process.env : {}
const cloudbaseEnvId = runtimeEnv.CLOUDBASE_ENV_ID || ''

const ENV = {
  API_BASE_URL: runtimeEnv.API_BASE_URL || '',
  CLOUDBASE_ENV_ID: cloudbaseEnvId,
  CLOUDBASE_AI_API_KEY: runtimeEnv.CLOUDBASE_AI_API_KEY || '',
  MODEL_API_URL: runtimeEnv.MODEL_API_URL || `https://${cloudbaseEnvId || '<ENV_ID>'}.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completions`,
  DATABASE_URL: runtimeEnv.DATABASE_URL || '',
  HUNYUAN_MODEL: runtimeEnv.HUNYUAN_MODEL || 'hy3',
  EXPLANATION_PIPELINE_MODE: runtimeEnv.EXPLANATION_PIPELINE_MODE || 'v1'
}

module.exports = ENV
