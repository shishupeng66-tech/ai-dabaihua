const userRepository = require('../repositories/userRepository.js')

function createUserId(openId) {
  return `user-${String(openId || '').replace(/[^a-zA-Z0-9_-]/g, '')}`
}

function exchangeCodeForOpenId(code) {
  const normalizedCode = String(code || '').trim()

  if (!normalizedCode) {
    return Promise.reject(new Error('缺少微信登录 code'))
  }

  // TODO: 接腾讯云/微信 code2Session。当前仅返回稳定 mock openid。
  return Promise.resolve(`mock-openid-${normalizedCode}`)
}

function findOrCreateUserByOpenId(openId, profile) {
  const existing = userRepository.findByOpenId(openId)
  if (existing) {
    return Promise.resolve(existing)
  }

  const now = new Date().toISOString()
  const user = {
    id: createUserId(openId),
    openId,
    nickname: profile && profile.nickname ? profile.nickname : '',
    avatarUrl: profile && profile.avatarUrl ? profile.avatarUrl : '',
    role: profile && profile.role ? profile.role : 'user',
    createdAt: now,
    updatedAt: now
  }

  return Promise.resolve(userRepository.createUser(user))
}

function loginWithWechatCode(code, profile) {
  return exchangeCodeForOpenId(code).then(openId => (
    findOrCreateUserByOpenId(openId, profile).then(user => ({
      success: true,
      data: {
        openId,
        user
      }
    }))
  ))
}

module.exports = {
  exchangeCodeForOpenId,
  findOrCreateUserByOpenId,
  loginWithWechatCode
}
