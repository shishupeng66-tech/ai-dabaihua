const users = []

function createUser(user) {
  users.unshift(user)
  return user
}

function findByOpenId(openId) {
  return users.find(user => user.openId === openId)
}

function findById(id) {
  return users.find(user => user.id === id)
}

function updateUser(id, patch) {
  const index = users.findIndex(user => user.id === id)
  if (index === -1) return null

  users[index] = Object.assign({}, users[index], patch, {
    updatedAt: new Date().toISOString()
  })
  return users[index]
}

function listUsers() {
  return users
}

module.exports = {
  createUser,
  findByOpenId,
  findById,
  updateUser,
  listUsers
}
