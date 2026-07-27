const knowledgeLoader = require('./knowledgeLoader.js')

function normalizeKeyword(keyword) {
  return String(keyword || '')
    .trim()
    .toLowerCase()
    .replace(/[？?。！!，,\s]/g, '')
    .replace(/^(请|帮我|帮忙|能不能|可以)?(解释一下|解释|讲讲|说说)/, '')
    .replace(/^什么是/, '')
    .replace(/是什么$/, '')
    .replace(/^啥是/, '')
    .replace(/是啥$/, '')
    .replace(/^何为/, '')
}

function normalizeEntry(entry) {
  return Object.assign({}, entry, {
    term: entry.term || entry.name,
    summary: entry.summary || entry.explanation,
    explanation: entry.summary || entry.explanation
  })
}

function calculateMatchScore(keyword, entry) {
  const normalizedKeyword = normalizeKeyword(keyword)
  const normalizedTerm = normalizeKeyword(entry.term || entry.name)
  const normalizedAliases = (entry.aliases || []).map(normalizeKeyword)

  if (!normalizedKeyword) {
    return {
      score: 0,
      matchType: 'none'
    }
  }

  if (normalizedKeyword === normalizedTerm) {
    return {
      score: 100,
      matchType: 'exact'
    }
  }

  if (normalizedAliases.some(alias => alias === normalizedKeyword)) {
    return {
      score: 80,
      matchType: 'alias'
    }
  }

  if (
    normalizedKeyword.includes(normalizedTerm) ||
    normalizedTerm.includes(normalizedKeyword) ||
    normalizedAliases.some(alias =>
      normalizedKeyword.includes(alias) || alias.includes(normalizedKeyword)
    )
  ) {
    return {
      score: 60,
      matchType: 'keyword'
    }
  }

  return {
    score: 0,
    matchType: 'none'
  }
}

function searchKnowledge(keyword) {
  const knowledgeBase = knowledgeLoader.loadKnowledge()
  const bestMatch = knowledgeBase.reduce((best, entry) => {
    const match = calculateMatchScore(keyword, entry)

    if (match.score > best.score) {
      return {
        entry,
        score: match.score,
        matchType: match.matchType
      }
    }

    return best
  }, {
    entry: null,
    score: 0,
    matchType: 'none'
  })

  if (!bestMatch.entry) {
    return {
      hit: false,
      matchType: 'none',
      score: 0
    }
  }

  return {
    hit: true,
    matchType: bestMatch.matchType,
    score: bestMatch.score,
    data: normalizeEntry(bestMatch.entry)
  }
}

function searchSuggestions(keyword, limit) {
  const normalizedKeyword = normalizeKeyword(keyword)
  if (!normalizedKeyword) return []

  const maxCount = limit || 5
  const suggestions = []
  const seen = {}
  const knowledgeBase = knowledgeLoader.loadKnowledge()

  knowledgeBase.forEach(entry => {
    const candidates = [entry.term].concat(entry.aliases || [])

    candidates.forEach(candidate => {
      const normalizedCandidate = normalizeKeyword(candidate)
      const isMatched = normalizedCandidate.indexOf(normalizedKeyword) === 0 ||
        normalizedCandidate.indexOf(normalizedKeyword) > -1

      if (isMatched && !seen[candidate]) {
        suggestions.push({
          keyword: candidate,
          term: entry.term,
          category: entry.category
        })
        seen[candidate] = true
      }
    })
  })

  return suggestions.slice(0, maxCount)
}

module.exports = {
  normalizeKeyword,
  calculateMatchScore,
  searchKnowledge,
  searchSuggestions
}
