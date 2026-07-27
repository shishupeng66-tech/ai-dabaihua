const favorite = require('../../utils/favorite.js')

function addFavorite(term) {
  return favorite.addFavorite(term)
}

function findFavorite(term) {
  return getFavorites().find(item => item.term === term)
}

function removeFavorite(term) {
  return favorite.removeFavorite(term)
}

function updateFavorite(term, patch) {
  const favorites = getFavorites().map(item => (
    item.term === term ? Object.assign({}, item, patch) : item
  ))

  if (typeof wx !== 'undefined') {
    wx.setStorageSync('favorite_terms', favorites)
  }

  return findFavorite(term)
}

function getFavorites() {
  return favorite.getFavorites()
}

module.exports = {
  addFavorite,
  findFavorite,
  updateFavorite,
  removeFavorite,
  getFavorites
}
