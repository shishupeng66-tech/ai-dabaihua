const env = require('../../config/env.js')
const pendingRepository = require('../repositories/pendingRepository.js')
const evaluationService = require('./evaluationService.js')

function createId(keyword) {
  const slug = String(keyword || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')

  return `pending-${slug || Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function normalizeKeywords(keywords) {
  if (!Array.isArray(keywords)) return []

  return keywords
    .map(item => String(item || '').trim())
    .filter(Boolean)
}

function buildProductionPrompt(keyword) {
  return [
    'You are the internal knowledge base writer for AI Da Bai Hua.',
    'Generate one draft knowledge base entry for a non-technical Chinese user.',
    'Answer in Simplified Chinese.',
    'Return JSON only.',
    'JSON fields: term, summary, analogy, scenario, usage, difficultyLevel, targetAudience, aliases, category, level, relatedTerms.',
    'difficultyLevel must be one of: beginner, intermediate, advanced.',
    'targetAudience must be one of: normal, business, developer.',
    'scenario must be an array of 2-3 concrete usage scenarios.',
    'Do not include markdown.',
    `Keyword: ${keyword}`
  ].join('\n')
}

function createPayload(prompt) {
  return {
    model: env.HUNYUAN_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.4,
    stream: false
  }
}

function requestWithWx(payload) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: env.MODEL_API_URL,
      method: 'POST',
      header: {
        Authorization: `Bearer ${env.CLOUDBASE_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: payload,
      success: res => resolve(res.data),
      fail: reject
    })
  })
}

function requestWithFetch(payload) {
  return fetch(env.MODEL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CLOUDBASE_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).then(res => {
    if (!res.ok) {
      throw new Error(`CloudBase AI Gateway request failed: ${res.status}`)
    }

    return res.json()
  })
}

function requestCloudBaseAI(payload) {
  if (!env.CLOUDBASE_AI_API_KEY) {
    return Promise.reject(new Error('Missing CLOUDBASE_AI_API_KEY'))
  }

  const request = typeof wx !== 'undefined' && wx.request
    ? requestWithWx
    : typeof fetch !== 'undefined'
      ? requestWithFetch
      : null

  if (!request) {
    return Promise.reject(new Error('No request client available'))
  }

  return request(payload)
}

function getResponseContent(response) {
  return response && response.choices && response.choices[0] && response.choices[0].message
    ? response.choices[0].message.content
    : ''
}

function parseDraft(content, keyword) {
  try {
    return JSON.parse(content)
  } catch (err) {
    return {
      term: keyword,
      summary: content,
      analogy: '',
      scenario: [],
      usage: '',
      difficultyLevel: 'beginner',
      targetAudience: 'normal',
      aliases: [keyword],
      category: 'AI基础',
      level: '入门',
      relatedTerms: []
    }
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return [String(value)]
}

function normalizeDifficultyLevel(value) {
  const normalized = String(value || '').trim()
  if (['beginner', 'intermediate', 'advanced'].includes(normalized)) return normalized
  return 'beginner'
}

function normalizeTargetAudience(value) {
  const normalized = String(value || '').trim()
  if (['normal', 'business', 'developer'].includes(normalized)) return normalized
  return 'normal'
}

function normalizeDraft(rawDraft, keyword) {
  const scenario = normalizeArray(rawDraft.scenario || rawDraft.examples)

  return {
    term: rawDraft.term || keyword,
    aliases: normalizeArray(rawDraft.aliases).length ? normalizeArray(rawDraft.aliases) : [keyword],
    category: rawDraft.category || 'AI基础',
    level: rawDraft.level || '入门',
    difficultyLevel: normalizeDifficultyLevel(rawDraft.difficultyLevel),
    sourceType: 'internal',
    targetAudience: normalizeTargetAudience(rawDraft.targetAudience),
    version: '0.1.0',
    summary: rawDraft.summary || rawDraft.explanation || '',
    analogy: rawDraft.analogy || '',
    scenario,
    examples: scenario,
    usage: rawDraft.usage || '',
    relatedTerms: normalizeArray(rawDraft.relatedTerms),
    searchCount: 0,
    author: 'ai',
    reviewStatus: 'pending'
  }
}

function createPendingDraft(keyword, draft, evaluationScore, tokenUsage) {
  const now = new Date().toISOString()
  return {
    id: createId(keyword),
    keyword,
    source: 'admin_production',
    draft: Object.assign({}, draft, {
      evaluationScore,
      tokenUsage
    }),
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }
}

function normalizeUsage(usage) {
  return {
    inputTokens: usage && (usage.prompt_tokens || usage.input_tokens) || 0,
    outputTokens: usage && (usage.completion_tokens || usage.output_tokens) || 0,
    totalTokens: usage && (usage.total_tokens || usage.totalTokens) || 0
  }
}

function generateDraft(keyword) {
  const normalizedKeyword = String(keyword || '').trim()
  if (!normalizedKeyword) {
    return Promise.reject(new Error('Missing keyword'))
  }

  const prompt = buildProductionPrompt(normalizedKeyword)
  const payload = createPayload(prompt)

  return requestCloudBaseAI(payload).then(response => {
    const rawDraft = parseDraft(getResponseContent(response), normalizedKeyword)
    const draft = normalizeDraft(rawDraft, normalizedKeyword)
    const evaluationScore = evaluationService.evaluateAnswer(draft)
    const tokenUsage = normalizeUsage(response && response.usage)
    const pendingDraft = createPendingDraft(normalizedKeyword, draft, evaluationScore, tokenUsage)

    pendingRepository.createPendingItem(pendingDraft)

    return {
      term: draft.term,
      summary: draft.summary,
      analogy: draft.analogy,
      scenario: draft.scenario,
      usage: draft.usage,
      difficultyLevel: draft.difficultyLevel,
      targetAudience: draft.targetAudience,
      evaluationScore,
      tokenUsage,
      pendingDraft
    }
  })
}

function generateDrafts(keywords) {
  const normalizedKeywords = normalizeKeywords(keywords)
  if (!normalizedKeywords.length) {
    return Promise.reject(new Error('Missing keywords'))
  }

  return Promise.all(normalizedKeywords.map(generateDraft)).then(results => ({
    success: true,
    data: {
      model: env.HUNYUAN_MODEL,
      results
    }
  }))
}

module.exports = {
  generateDraft,
  generateDrafts,
  buildProductionPrompt
}
