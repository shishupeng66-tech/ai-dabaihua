const assert = require('assert')
const repository = require('../../server/repositories/favoriteRepository.js')

global.wx = {
  storage: {},
  getStorageSync(key) {
    return this.storage[key]
  },
  setStorageSync(key, value) {
    this.storage[key] = value
  }
}

global.wx.setStorageSync('favorite_terms', [])

repository.addFavorite('Repo Favorite')
assert.strictEqual(repository.findFavorite('Repo Favorite').term, 'Repo Favorite')

repository.updateFavorite('Repo Favorite', { note: 'updated' })
assert.strictEqual(repository.findFavorite('Repo Favorite').note, 'updated')

assert.strictEqual(repository.getFavorites().length, 1)

repository.removeFavorite('Repo Favorite')
assert.strictEqual(repository.findFavorite('Repo Favorite'), undefined)

console.log('favoriteRepository ok')
