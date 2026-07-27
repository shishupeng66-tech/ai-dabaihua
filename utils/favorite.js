const STORAGE_KEY = 'favorite_terms'

function getStorage() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx
}

function normalizeTerm(term) {
  return String(term || '').trim()
}

function getFavorites() {
  const storage = getStorage()
  if (!storage) return []

  return storage.getStorageSync(STORAGE_KEY) || []
}

function addFavorite(term) {
  const storage = getStorage()
  if (!storage) return []

  const normalizedTerm = normalizeTerm(term)
  if (!normalizedTerm) return getFavorites()

  const favorites = getFavorites()
  const exists = favorites.some(item => item.term === normalizedTerm)

  if (!exists) {
    favorites.unshift({
      term: normalizedTerm,
      createdAt: new Date().toISOString()
    })
  }

  storage.setStorageSync(STORAGE_KEY, favorites)
  return favorites
}

function removeFavorite(term) {
  const storage = getStorage()
  if (!storage) return []

  const normalizedTerm = normalizeTerm(term)
  const favorites = getFavorites().filter(item => item.term !== normalizedTerm)

  storage.setStorageSync(STORAGE_KEY, favorites)
  return favorites
}

function isFavorite(term) {
  const normalizedTerm = normalizeTerm(term)
  return getFavorites().some(item => item.term === normalizedTerm)
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite
}
