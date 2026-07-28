const env = require('../../config/env.js')
const skillEvaluationService = require('./skillEvaluationService.js')

const skillModules = {
  skill_v1: require('../prompts/skills/skill_v1_simple.js'),
  skill_v2: require('../prompts/skills/skill_v2_teacher.js'),
  skill_v3: require('../prompts/skills/skill_v3_product.js'),
  skill_v4: require('../prompts/skills/skill_v4_friend.js'),
  skill_v5: require('../prompts/skills/skill_v5_dual.js')
}

function normalizeSkillVersions(skillVersions) {
  if (!Array.isArray(skillVersions)) return []

  return skillVersions
    .map(item => String(item || '').trim())
    .filter(Boolean)
}

function createUserPrompt(keyword) {
  return [
    `Keyword: ${keyword}`,
    'Output requirement:',
    'Return strict JSON only.',
    'Fields: term, summary, analogy, examples, usage, relatedTerms.',
    'examples and relatedTerms must be arrays.'
  ].join('\n')
}

function createPayload(skillConfig, keyword) {
  return {
    model: env.HUNYUAN_MODEL,
    messages: [
      {
        role: 'system',
        content: skillConfig.systemPrompt
      },
      {
        role: 'user',
        content: createUserPrompt(keyword)
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
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      relatedTerms: Array.isArray(parsed.relatedTerms) ? parsed.relatedTerms : []
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

function runSingleSkillTest(keyword, skillVersion, options) {
  const skillConfig = skillModules[skillVersion]

  if (!skillConfig) {
    return Promise.reject(new Error(`Unsupported skill version: ${skillVersion}`))
  }

  const payload = createPayload(skillConfig, keyword)

  return requestCloudBaseAI(payload).then(response => {
    const content = getResponseContent(response)
    const answer = parseAnswer(content, keyword)
    const result = {
      keyword,
      skillVersion,
      skillName: skillConfig.name,
      answer,
      tokenUsage: normalizeUsage(response && response.usage),
      model: env.HUNYUAN_MODEL,
      provider: 'cloudbase-hunyuan'
    }

    if (options && options.enableEvaluation) {
      result.skillEvaluation = skillEvaluationService.evaluateSkillAnswer({
        keyword,
        answer,
        skillVersion
      })
    }

    return result
  })
}

function runSkillTest(options) {
  const keyword = String(options && options.keyword || '').trim()
  const skillVersions = normalizeSkillVersions(options && options.skillVersions)
  const enableEvaluation = Boolean(options && options.enableEvaluation)

  if (!keyword) {
    return Promise.reject(new Error('Missing keyword'))
  }

  if (!skillVersions.length) {
    return Promise.reject(new Error('Missing skillVersions'))
  }

  return Promise.all(skillVersions.map(skillVersion => (
    runSingleSkillTest(keyword, skillVersion, { enableEvaluation })
  ))).then(results => ({
    success: true,
    data: {
      keyword,
      model: env.HUNYUAN_MODEL,
      provider: 'cloudbase-hunyuan',
      results
    }
  }))
}

module.exports = {
  runSkillTest,
  runSingleSkillTest,
  skillModules
}
