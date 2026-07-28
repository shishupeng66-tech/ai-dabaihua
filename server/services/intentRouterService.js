function normalizeKeyword(keyword) {
  return String(keyword || '')
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase()
}

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text))
}

function routeIntent(keyword) {
  const rawKeyword = String(keyword || '').trim()
  const normalized = normalizeKeyword(rawKeyword)

  if (!normalized) {
    return {
      intent: 'term_explain',
      confidence: 0,
      reason: 'empty keyword, fallback to term_explain'
    }
  }

  if (hasAny(normalized, [
    /怎么学/,
    /如何学习/,
    /学习路线/,
    /入门/,
    /需要掌握/,
    /需要学习/,
    /学什么/
  ])) {
    return {
      intent: 'learning_plan',
      confidence: 0.9,
      reason: 'matched learning plan keywords'
    }
  }

  if (hasAny(normalized, [
    /用.+行业解释/,
    /从.+角度解释/,
    /.+领域/,
    /.+行业.*解释/
  ])) {
    return {
      intent: 'industry_explain',
      confidence: 0.9,
      reason: 'matched industry explanation pattern'
    }
  }

  if (hasAny(normalized, [
    /区别/,
    /哪个好/,
    /有什么不同/,
    /.+和.+/,
    /.+vs.+/
  ])) {
    return {
      intent: 'compare_explain',
      confidence: 0.86,
      reason: 'matched compare keywords or A/B pattern'
    }
  }

  if (hasAny(normalized, [
    /为什么需要/,
    /有什么用/,
    /有什么价值/,
    /普通人/
  ])) {
    return {
      intent: 'value_explain',
      confidence: 0.88,
      reason: 'matched value explanation keywords'
    }
  }

  if (hasAny(normalized, [
    /为什么/,
    /怎么回事/,
    /原因/,
    /原理/
  ])) {
    return {
      intent: 'principle_explain',
      confidence: 0.88,
      reason: 'matched principle explanation keywords'
    }
  }

  if (hasAny(normalized, [
    /是什么/,
    /什么意思/,
    /介绍一下/,
    /解释一下/
  ])) {
    return {
      intent: 'term_explain',
      confidence: 0.85,
      reason: 'matched term explanation keywords'
    }
  }

  return {
    intent: 'term_explain',
    confidence: 0.65,
    reason: 'no explicit pattern matched, fallback to term_explain'
  }
}

module.exports = {
  routeIntent
}
