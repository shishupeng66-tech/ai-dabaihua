const favoriteRepository = require('../repositories/favoriteRepository.js')

function updateFavorite(action, term) {
  const data = action === 'remove'
    ? favoriteRepository.removeFavorite(term)
    : favoriteRepository.addFavorite(term)

  return Promise.resolve({
    success: true,
    data
  })
}

module.exports = {
  updateFavorite
}
