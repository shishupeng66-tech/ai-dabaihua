const knowledgeLoader = require('./knowledgeLoader.js')

function normalizeKeyword(keyword) {
  return String(keyword || '')
    .trim()
    .toLowerCase()
    .replace(/[，。！？!?\s]/g, '')
    .replace(/^(请|请帮我|帮我|能不能|可以)?(解释一下|解释|介绍一下|介绍|讲讲|说说)/, '')
    .replace(/^什么是/, '')
    .replace(/是什么/g, '')
    .replace(/是什么意思/g, '')
    .replace(/^啥是/, '')
    .replace(/是啥$/, '')
    .replace(/^何为/, '')
}

function normalizeLifeExamples(entry) {
  const source = Array.isArray(entry.lifeExamples)
    ? entry.lifeExamples
    : (entry.lifeExample && typeof entry.lifeExample === 'object' ? [entry.lifeExample] : [])

  return source
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      title: item.title || '',
      content: item.content || ''
    }))
    .filter(item => item.title || item.content)
}

function formatLifeExample(example) {
  if (!example || typeof example !== 'object') return ''
  return [example.title, example.content].filter(Boolean).join('：')
}

function normalizeEntry(entry) {
  const term = entry.term || entry.name
  const professionalExplanation = entry.professionalExplanation || entry.summary || entry.explanation || ''
  const lifeExamples = normalizeLifeExamples(entry)
  const lifeExample = lifeExamples[0] || null
  const lifeExampleText = lifeExamples.map(formatLifeExample).filter(Boolean).join('\n') || entry.analogy || ''
  const examples = []

  lifeExamples.map(formatLifeExample).filter(Boolean).forEach(item => examples.push(item))
  if (!examples.length && lifeExampleText) examples.push(lifeExampleText)
  if (entry.aiExample) examples.push(entry.aiExample)

  return Object.assign({}, entry, {
    term,
    aliases: entry.aliases || [],
    translation: entry.translation || null,
    professionalExplanation,
    lifeExamples,
    lifeExample,
    aiExample: entry.aiExample || '',
    relatedTerms: entry.relatedTerms || [],
    summary: entry.summary || professionalExplanation,
    explanation: entry.explanation || professionalExplanation,
    analogy: entry.analogy || lifeExampleText,
    examples: entry.examples || examples,
    usage: entry.usage || entry.aiExample || ''
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

  const canUseKeywordMatch = normalizedTerm.length >= 3 && normalizedKeyword.length >= 3
  const hasAliasKeywordMatch = normalizedAliases.some(alias =>
    alias.length >= 3 &&
    normalizedKeyword.length >= 3 &&
    (normalizedKeyword.includes(alias) || alias.includes(normalizedKeyword))
  )

  if (
    canUseKeywordMatch && (
      normalizedKeyword.includes(normalizedTerm) ||
      normalizedTerm.includes(normalizedKeyword)
    ) ||
    hasAliasKeywordMatch
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
  searchSuggestions,
  normalizeEntry,
  normalizeLifeExamples
}
