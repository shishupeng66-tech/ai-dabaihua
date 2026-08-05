const SAFE_MESSAGE = '这个问题暂时不能解释。可以换成 AI 术语、软件概念或正常学习问题来问。'

const RISK_RULES = [
  {
    category: 'sexual',
    reason: 'sexual_content',
    patterns: [
      /涉黄|色情|黄片|约炮|嫖娼|卖淫|裸聊|成人视频|成人内容|性服务/i,
      /强奸|迷奸|猥亵|性侵|未成年.*性|儿童.*性/i
    ]
  },
  {
    category: 'violence',
    reason: 'violent_content',
    patterns: [
      /杀人|砍人|捅人|爆炸物|炸弹|制毒|投毒|放火|自制枪|买枪/i,
      /怎么.*(伤害|杀死|报复|下毒|炸)/i
    ]
  },
  {
    category: 'illegal',
    reason: 'illegal_request',
    patterns: [
      /诈骗|洗钱|盗号|破解密码|黑进|钓鱼网站|伪造证件|信用卡套现/i,
      /怎么.*(骗钱|盗取|绕过风控|非法获利|逃避监管)/i
    ]
  },
  {
    category: 'privacy',
    reason: 'privacy_risk',
    patterns: [
      /身份证号|银行卡号|手机号定位|人肉搜索|开房记录|查别人隐私/i,
      /怎么.*(查.*隐私|定位.*手机|获取.*密码|偷看.*聊天)/i
    ]
  },
  {
    category: 'self_harm',
    reason: 'self_harm',
    patterns: [
      /自杀|轻生|割腕|跳楼|服毒|不想活/i,
      /怎么.*(自杀|结束生命|伤害自己)/i
    ]
  },
  {
    category: 'prompt_attack',
    reason: 'prompt_injection',
    patterns: [
      /忽略.*(规则|限制|系统提示|安全策略)/i,
      /越狱|jailbreak|DAN模式|绕过.*限制|输出.*系统提示/i
    ]
  }
]

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, '')
    .replace(/[，。！？、,.!?;；:："'“”‘’()[\]{}<>《》]/g, '')
    .toLowerCase()
}

function findRisk(text) {
  const normalized = normalizeText(text)
  if (!normalized) {
    return {
      allowed: true,
      category: 'none',
      reason: ''
    }
  }

  for (const rule of RISK_RULES) {
    const hit = rule.patterns.some(pattern => pattern.test(normalized))
    if (hit) {
      return {
        allowed: false,
        category: rule.category,
        reason: rule.reason
      }
    }
  }

  return {
    allowed: true,
    category: 'none',
    reason: ''
  }
}

function stringifyOutput(result) {
  if (!result) return ''
  if (typeof result === 'string') return result

  const data = result.data || result
  return [
    data.term,
    data.summary,
    data.explanation,
    data.professionalExplanation,
    data.analogy,
    data.aiExample,
    data.usage,
    Array.isArray(data.examples) ? data.examples.join('\n') : '',
    Array.isArray(data.lifeExamples)
      ? data.lifeExamples.map(item => [item.title, item.content].filter(Boolean).join('：')).join('\n')
      : ''
  ].filter(Boolean).join('\n')
}

function checkInput(keyword) {
  return findRisk(keyword)
}

function checkOutput(result) {
  return findRisk(stringifyOutput(result))
}

function createSafeResponse(keyword, safety, stage) {
  const term = String(keyword || '').trim()

  return {
    success: true,
    source: 'safety',
    matchType: 'blocked',
    score: 0,
    data: {
      term,
      type: 'safety_notice',
      summary: SAFE_MESSAGE,
      explanation: SAFE_MESSAGE,
      professionalExplanation: SAFE_MESSAGE,
      lifeExamples: [],
      aiExample: '为了保证内容安全，这类问题不会进入 AI 生成流程。',
      relatedTerms: ['Token', 'API', 'Agent'],
      safety: {
        blocked: true,
        category: safety && safety.category ? safety.category : 'unknown',
        reason: safety && safety.reason ? safety.reason : 'content_safety',
        stage: stage || 'input'
      }
    }
  }
}

module.exports = {
  checkInput,
  checkOutput,
  createSafeResponse,
  normalizeText
}
