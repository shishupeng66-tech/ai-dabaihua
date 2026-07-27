const env = require('../../config/env.js')
const evaluationService = require('./evaluationService.js')

const DEFAULT_PROMPT_VERSION = 'A'

const promptBuilders = {
  A(keyword) {
    return [
      'You are the explanation assistant for AI Da Bai Hua.',
      'Explain the AI term in simple Simplified Chinese for normal users.',
      'Return JSON only with fields: term, summary, analogy, examples, usage, relatedTerms.',
      'Keep summary short, analogy concrete, examples practical.',
      `Keyword: ${keyword}`
    ].join('\n')
  },

  B(keyword) {
    return [
      'You are an AI concept teacher for beginners.',
      'Answer in Simplified Chinese.',
      'Use a plain one-sentence summary, one life analogy, three real scenarios, and why it matters.',
      'Return strict JSON: term, summary, analogy, examples, usage, relatedTerms.',
      'Avoid unexplained jargon.',
      `Keyword: ${keyword}`
    ].join('\n')
  },

  C(keyword) {
    return [
      'You explain AI concepts for non-technical users in Simplified Chinese.',
      'Use this structure as strict JSON: term, summary, analogy, examples, usage, relatedTerms.',
      'The answer should be accurate, concise, friendly, and useful for daily AI tool usage.',
      'Examples must be concrete situations, not abstract statements.',
      `Keyword: ${keyword}`
    ].join('\n')
  }
}

function normalizeKeywords(keywords) {
  if (!Array.isArray(keywords)) return []

  return keywords
    .map(item => String(item || '').trim())
    .filter(Boolean)
}

function normalizePromptVersions(promptVersions) {
  const versions = Array.isArray(promptVersions) ? promptVersions : [promptVersions || DEFAULT_PROMPT_VERSION]

  return versions
    .map(item => String(item || '').trim().toUpperCase())
    .filter(item => promptBuilders[item])
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

function parseAnswer(content, keyword) {
  try {
    const parsed = JSON.parse(content)
    return Object.assign({}, parsed, {
      term: parsed.term || keyword,
      examples: parsed.examples || [],
      relatedTerms: parsed.relatedTerms || []
    })
  } catch (err) {
    return {
      term: keyword,
      summary: content,
      explanation: content,
      analogy: '',
      examples: [],
      usage: '',
      relatedTerms: []
    }
  }
}

function normalizeUsage(usage) {
  return {
    inputTokens: usage && (usage.prompt_tokens || usage.input_tokens) || 0,
    outputTokens: usage && (usage.completion_tokens || usage.output_tokens) || 0,
    totalTokens: usage && (usage.total_tokens || usage.totalTokens) || 0
  }
}

function testPrompt(keyword, promptVersion) {
  const normalizedKeyword = String(keyword || '').trim()
  const normalizedVersion = String(promptVersion || DEFAULT_PROMPT_VERSION).trim().toUpperCase()
  const buildPrompt = promptBuilders[normalizedVersion]

  if (!normalizedKeyword) {
    return Promise.reject(new Error('Missing keyword'))
  }

  if (!buildPrompt) {
    return Promise.reject(new Error(`Unsupported prompt version: ${promptVersion}`))
  }

  const prompt = buildPrompt(normalizedKeyword)
  const payload = createPayload(prompt)

  return requestCloudBaseAI(payload).then(response => {
    const content = getResponseContent(response)
    const answer = parseAnswer(content, normalizedKeyword)
    const evaluation = evaluationService.evaluateAnswer(answer)

    return {
      keyword: normalizedKeyword,
      promptVersion: normalizedVersion,
      answer,
      tokenUsage: normalizeUsage(response && response.usage),
      evaluationScore: evaluation,
      model: env.HUNYUAN_MODEL,
      provider: 'cloudbase-hunyuan'
    }
  })
}

function runPromptTest(options) {
  const keywords = normalizeKeywords(options && options.keywords)
  const promptVersions = normalizePromptVersions(options && (
    options.promptVersions || options.promptVersion
  ))

  if (!keywords.length) {
    return Promise.reject(new Error('Missing keywords'))
  }

  if (!promptVersions.length) {
    return Promise.reject(new Error('Missing valid prompt version'))
  }

  const tasks = []
  keywords.forEach(keyword => {
    promptVersions.forEach(promptVersion => {
      tasks.push(testPrompt(keyword, promptVersion))
    })
  })

  return Promise.all(tasks).then(results => ({
    success: true,
    data: {
      model: env.HUNYUAN_MODEL,
      promptVersions,
      results
    }
  }))
}

function comparePrompts(keywords, promptVersions) {
  return runPromptTest({
    keywords,
    promptVersions: promptVersions || ['A', 'B', 'C']
  })
}

module.exports = {
  runPromptTest,
  comparePrompts,
  testPrompt,
  promptBuilders
}
