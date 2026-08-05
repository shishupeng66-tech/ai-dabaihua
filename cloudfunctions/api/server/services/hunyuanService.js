const env = require('../../config/env.js')
const https = require('https')
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

function getModelUrls() {
  const envId = env.CLOUDBASE_ENV_ID
  const urls = [
    env.MODEL_API_URL,
    envId ? `https://${envId}.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completions` : '',
    envId ? `https://${envId}.api.tcloudbasegateway.com/v1/ai/cloudbase/chat/completion` : '',
    envId ? `https://${envId}.api.tcloudbasegateway.com/v1/ai/hunyuan-v3/chat/completions` : '',
    envId ? `https://${envId}.api.tcloudbasegateway.com/v1/ai/hunyuan-v3/chat/completion` : ''
  ]

  return Array.from(new Set(urls.filter(Boolean)))
}

function requestWithWx(url, payload) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
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

function requestWithFetch(url, payload) {
  return fetch(url, {
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

function requestWithHttps(urlString, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString)
    const body = JSON.stringify(payload)
    const req = https.request({
      method: 'POST',
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      headers: {
        Authorization: `Bearer ${env.CLOUDBASE_AI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let raw = ''
      res.setEncoding('utf8')
      res.on('data', chunk => {
        raw += chunk
      })
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Hunyuan API request failed: ${res.statusCode} ${raw}`))
          return
        }

        try {
          resolve(JSON.parse(raw))
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.setTimeout(25000, () => {
      req.destroy(new Error('Hunyuan API request timeout.'))
    })
    req.write(body)
    req.end()
  })
}

function shouldTryNextEndpoint(err) {
  const message = err && err.message ? err.message : ''
  return /404|INVALID_ENV|NOT_FOUND|Cannot POST/i.test(message)
}

function requestModelWithFallback(request, payload) {
  const urls = getModelUrls()
  let lastError = null

  function tryAt(index) {
    if (index >= urls.length) {
      return Promise.reject(lastError || new Error('No Hunyuan endpoint available.'))
    }

    return request(urls[index], payload).catch(err => {
      lastError = err
      if (shouldTryNextEndpoint(err)) {
        return tryAt(index + 1)
      }

      return Promise.reject(err)
    })
  }

  return tryAt(0)
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
      : requestWithHttps

  if (!request) {
    return Promise.resolve({
      data: createMockResult(keyword, mode),
      usage: null,
      usedMock: true
    })
  }

  return requestModelWithFallback(request, payload).then(res => {
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
