const env = require('../../config/env.js')
const explainPrompt = require('../prompts/explainPrompt.js')
const comparePrompt = require('../prompts/comparePrompt.js')
const businessPrompt = require('../prompts/businessPrompt.js')
const developerPrompt = require('../prompts/developerPrompt.js')
const explainModeService = require('./explainModeService.js')

const CACHE_TTL = 24 * 60 * 60 * 1000
const resultCache = {}
const inFlightRequests = {}

function buildCacheKey(keyword, mode) {
  return `${mode}:${String(keyword || '').trim().toLowerCase()}`
}

function isCompareQuestion(keyword) {
  return /区别|差别|对比|关系|和.+区别|与.+区别/.test(String(keyword || ''))
}

function getPromptConfig(keyword, mode) {
  if (mode === 'business') {
    return {
      name: 'businessPrompt',
      content: businessPrompt.buildBusinessPrompt(keyword)
    }
  }

  if (mode === 'developer') {
    return {
      name: 'developerPrompt',
      content: developerPrompt.buildDeveloperPrompt(keyword)
    }
  }

  if (isCompareQuestion(keyword)) {
    return {
      name: 'comparePrompt',
      content: comparePrompt.buildComparePrompt(keyword)
    }
  }

  return {
    name: 'explainPrompt',
    content: explainPrompt.buildExplainPrompt(keyword)
  }
}

function buildPrompt(keyword, mode) {
  return getPromptConfig(keyword, mode).content
}

function createMockResult(keyword, mode) {
  const term = String(keyword || '').trim()
  const modeText = mode === 'business'
    ? '偏业务视角'
    : mode === 'developer'
      ? '偏开发者视角'
      : '通用视角'

  return {
    term,
    summary: `${term}暂时没有命中本地知识库。接入腾讯混元后，这里会返回${modeText}的大白话解释。`,
    explanation: `${term}暂时没有命中本地知识库。接入腾讯混元后，这里会返回${modeText}的大白话解释。`,
    analogy: '就像词典里暂时没查到这个词，先交给一位在线老师按你的场景现场讲解。',
    examples: [
      '这里会展示腾讯混元生成的例子',
      '同一关键词可以按普通、业务、开发者三种模式解释',
      '24小时内相同问题优先读取缓存，减少重复模型调用'
    ],
    usage: '当知识库还没覆盖这个问题时，混元兜底可以先给用户一个可读答案，同时把候选内容进入人工审核流程。',
    relatedTerms: [],
    model: env.HUNYUAN_MODEL,
    mode,
    provider: 'hunyuan',
    isMock: true
  }
}

function getCachedResult(cacheKey) {
  const cached = resultCache[cacheKey]
  if (!cached) return null

  if (Date.now() - cached.createdAt > CACHE_TTL) {
    delete resultCache[cacheKey]
    return null
  }

  return Object.assign({}, cached.data, {
    cacheHit: true
  })
}

function setCachedResult(cacheKey, data) {
  resultCache[cacheKey] = {
    data,
    createdAt: Date.now()
  }
}

function parseHunyuanContent(content, keyword, mode) {
  try {
    const parsed = JSON.parse(content)
    return Object.assign({}, parsed, {
      term: parsed.term || keyword,
      examples: parsed.examples || [],
      relatedTerms: parsed.relatedTerms || [],
      model: env.HUNYUAN_MODEL,
      mode,
      provider: 'hunyuan',
      isMock: false
    })
  } catch (err) {
    return {
      term: keyword,
      summary: content,
      explanation: content,
      analogy: '',
      examples: [],
      usage: '',
      relatedTerms: [],
      model: env.HUNYUAN_MODEL,
      mode,
      provider: 'hunyuan',
      isMock: false
    }
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
      throw new Error(`混元接口请求失败：${res.status}`)
    }

    return res.json()
  })
}

function callHunyuanAPI(promptConfig, keyword, mode) {
  if (!env.CLOUDBASE_AI_API_KEY) {
    return Promise.resolve({
      data: createMockResult(keyword, mode),
      usage: null,
      usedMock: true
    })
  }

  const payload = {
    model: env.HUNYUAN_MODEL,
    messages: [
      {
        role: 'user',
        content: promptConfig.content
      }
    ],
    temperature: 0.4,
    stream: false
  }

  const request = typeof wx !== 'undefined' && wx.request
    ? requestWithWx
    : typeof fetch !== 'undefined'
      ? requestWithFetch
      : null

  if (!request) {
    return Promise.resolve({
      data: createMockResult(keyword, mode),
      usage: null,
      usedMock: true
    })
  }

  return request(payload).then(res => {
    const content = res && res.choices && res.choices[0] && res.choices[0].message
      ? res.choices[0].message.content
      : ''

    return {
      data: parseHunyuanContent(content, keyword, mode),
      usage: res && res.usage ? res.usage : null,
      usedMock: false
    }
  })
}

function explain(input) {
  const parsed = explainModeService.parseExplainInput(input)
  const keyword = parsed.keyword
  const mode = parsed.mode
  const cacheKey = buildCacheKey(keyword, mode)
  const cachedResult = getCachedResult(cacheKey)

  if (cachedResult) {
    return Promise.resolve(cachedResult)
  }

  if (inFlightRequests[cacheKey]) {
    return inFlightRequests[cacheKey].then(result => Object.assign({}, result, {
      cacheHit: true
    }))
  }

  const promptConfig = getPromptConfig(keyword, mode)

  inFlightRequests[cacheKey] = callHunyuanAPI(promptConfig, keyword, mode).then(response => {
    const result = response.data
    setCachedResult(cacheKey, result)

    return result
  }).finally(() => {
    delete inFlightRequests[cacheKey]
  })

  return inFlightRequests[cacheKey]
}

module.exports = {
  explain,
  buildPrompt,
  getPromptConfig,
  resultCache,
  inFlightRequests
}
