const api = require('../../utils/api.js')

const DEFAULT_RELATED_TERMS = ['大模型', 'Prompt', 'Agent', 'Token']
const EMPTY_RESULT_TEXT = '暂时没有找到解释，请换一个问题试试'
const RESULT_ASSETS = {
  robot: '/assets/home/hero-robot.png',
  orangeBubble: '/assets/home/hero-bubble-orange.png'
}
const FEEDBACK_KEY = 'local_feedback'

function compactList(items) {
  return Array.isArray(items)
    ? items.filter(item => item !== undefined && item !== null && String(item).trim())
    : []
}

function firstText() {
  const values = Array.prototype.slice.call(arguments)
  const value = values.find(item => item !== undefined && item !== null && String(item).trim())
  return value ? String(value).trim() : ''
}

function getContent(data) {
  return data && data.content && typeof data.content === 'object' ? data.content : {}
}

function getStoredList(key) {
  const list = wx.getStorageSync(key)
  return Array.isArray(list) ? list : []
}

function recordFeedback(action, term) {
  const list = getStoredList(FEEDBACK_KEY)
  list.unshift({
    action,
    term: term || '',
    time: new Date().toISOString()
  })
  wx.setStorageSync(FEEDBACK_KEY, list)
}

function normalizeType(type) {
  const normalized = String(type || '').trim()
  if (normalized === 'compare_explain') return 'compare'
  return normalized || 'term_explain'
}

function isQuestionQuery(query) {
  const text = firstText(query)
  if (!text) return false
  if (/[？?]/.test(text)) return true
  if (/^(为什么|怎么|怎样|如何|能不能|可以|请问|我想|用.+解释)/.test(text)) return true
  return text.length > 18
}

function createDisplayTitle(data, query, term) {
  const rawQuery = firstText(query)
  if (isQuestionQuery(rawQuery)) return rawQuery

  const titleTerm = firstText(term, data.term, rawQuery)
  return titleTerm ? `${titleTerm}是什么？` : firstText(data.title, rawQuery)
}

function normalizeLifeExamples(data, content) {
  const source = Array.isArray(data.lifeExamples)
    ? data.lifeExamples
    : (data.lifeExample && typeof data.lifeExample === 'object' ? [data.lifeExample] : [])

  const normalized = source
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      title: firstText(item.title, item.type, '生活中的例子'),
      content: firstText(item.content, item.detail, item.description)
    }))
    .filter(item => item.title || item.content)

  if (normalized.length) return normalized

  const legacyExamples = compactList(content.examples || data.examples)
  if (legacyExamples.length) {
    return legacyExamples.map((item, index) => ({
      title: `例子 ${index + 1}`,
      content: String(item)
    }))
  }

  const analogy = firstText(content.analogy, data.analogy)
  if (analogy) {
    return [{
      title: '生活中的例子',
      content: analogy
    }]
  }

  return []
}

function getLifeExampleAt(lifeExamples, index) {
  if (!lifeExamples.length) return null
  const normalizedIndex = Math.max(0, Math.min(index || 0, lifeExamples.length - 1))
  return lifeExamples[normalizedIndex]
}

function createSection(key, title, value, sectionType) {
  const isArray = Array.isArray(value)
  const normalizedValue = isArray ? compactList(value) : value

  if (isArray && !normalizedValue.length) return null
  if (!isArray && !firstText(normalizedValue)) return null

  return {
    key,
    title,
    type: sectionType || (isArray ? 'list' : 'text'),
    value: normalizedValue
  }
}

function createSections(data, content, lifeExamples) {
  const translationText = data.translation
    ? compactList([data.translation.chinese, data.translation.english]).join(' / ')
    : ''
  const summary = firstText(
    data.professionalExplanation,
    data.summary,
    data.explanation,
    content.oneSentence,
    content.coreAnswer,
    content.oneSentenceDifference,
    content.currentChange,
    content.goal
  )

  return compactList([
    createSection('translation', '中文翻译', translationText),
    createSection('professionalExplanation', '大白话解释', summary),
    createSection('lifeExamples', '生活中的理解', lifeExamples, 'life-examples'),
    createSection('aiExample', 'AI里面怎么用', firstText(data.aiExample, data.usage, content.importance))
  ])
}

function normalizeResultData(apiResult, query) {
  const data = apiResult && apiResult.data ? apiResult.data : {}
  const content = getContent(data)
  const type = normalizeType(data.type)
  const term = firstText(data.term, query)
  const title = createDisplayTitle(data, query, term)
  const lifeExamples = normalizeLifeExamples(data, content)
  const currentExampleIndex = lifeExamples.length ? Math.floor(Math.random() * lifeExamples.length) : 0
  const currentLifeExample = getLifeExampleAt(lifeExamples, currentExampleIndex)
  const summary = firstText(
    data.professionalExplanation,
    data.summary,
    data.explanation,
    content.oneSentence,
    content.coreAnswer,
    content.oneSentenceDifference,
    content.currentChange,
    content.goal
  )
  const relatedTerms = compactList(data.relatedTerms || content.relatedConcepts || DEFAULT_RELATED_TERMS)

  return {
    type,
    title,
    term,
    summary,
    explanation: summary,
    translation: data.translation || null,
    professionalExplanation: data.professionalExplanation || summary,
    lifeExamples,
    lifeExample: data.lifeExample || lifeExamples[0] || null,
    currentLifeExample,
    currentExampleIndex,
    canSwitchExample: lifeExamples.length > 1,
    aiExample: firstText(data.aiExample, data.usage, content.importance),
    relatedTerms,
    sections: createSections(data, content, lifeExamples),
    assets: RESULT_ASSETS,
    favoriteKey: firstText(term, title, query),
    content,
    meta: data.meta || {}
  }
}

function hasRenderableResult(viewModel) {
  return !!(
    viewModel &&
    (
      firstText(viewModel.summary, viewModel.professionalExplanation) ||
      viewModel.currentLifeExample ||
      viewModel.aiExample
    )
  )
}

function formatLifeExample(example) {
  if (!example) return ''
  return compactList([example.title, example.content]).join('\n')
}

function buildCopyText(viewModel) {
  if (!viewModel) return ''

  return compactList([
    viewModel.title,
    `大白话解释\n${viewModel.summary || viewModel.professionalExplanation || ''}`,
    viewModel.currentLifeExample ? `生活中的例子\n${formatLifeExample(viewModel.currentLifeExample)}` : '',
    viewModel.aiExample ? `AI里面怎么用\n${viewModel.aiExample}` : ''
  ]).join('\n\n')
}

Page({
  data: {
    term: '',
    isLoading: true,
    resultData: null,
    errorText: '',
    relatedTerms: DEFAULT_RELATED_TERMS
  },

  onLoad(options) {
    console.log('[result:onLoad] options =', options)
    const term = decodeURIComponent(options.term || '')
    console.log('[result:onLoad] keyword =', term)

    this.setData({ term })
    wx.setNavigationBarTitle({ title: 'AI大白话' })
    this.loadExplanation(term)
  },

  loadExplanation(term) {
    console.log('[result:loadExplanation:start] term =', term)

    if (!term || term.trim().length < 2) {
      this.setData({
        isLoading: false,
        resultData: null,
        errorText: EMPTY_RESULT_TEXT
      })
      return
    }

    this.setData({
      isLoading: true,
      resultData: null,
      errorText: ''
    })

    api.explainTerm(term)
      .then(res => {
        if (!res || !res.success || !res.data) {
          throw new Error('解释结果为空')
        }

        const viewModel = normalizeResultData(res, term)
        console.log('[result:loadExplanation:success] resultData =', viewModel)

        if (!hasRenderableResult(viewModel)) {
          throw new Error(EMPTY_RESULT_TEXT)
        }

        this.setData({
          resultData: viewModel,
          relatedTerms: viewModel.relatedTerms.length ? viewModel.relatedTerms : this.data.relatedTerms,
          errorText: '',
          isLoading: false
        }, () => {
          console.log('[result:loadExplanation:final] this.data.resultData =', this.data.resultData)
        })
      })
      .catch(err => {
        console.error('[result:loadExplanation:error]', err)
        const message = err && err.message ? err.message : '解释失败，请稍后再试'

        this.setData({
          isLoading: false,
          resultData: null,
          errorText: message || EMPTY_RESULT_TEXT
        }, () => {
          console.log('[result:loadExplanation:final] this.data.resultData =', this.data.resultData)
          console.log('[result:loadExplanation:final] this.data.errorText =', this.data.errorText)
        })

        wx.showToast({
          title: message,
          icon: 'none'
        })
      })
  },

  onSwitchExampleTap() {
    const { resultData } = this.data
    if (!resultData || !resultData.lifeExamples || resultData.lifeExamples.length < 2) return

    const total = resultData.lifeExamples.length
    let nextIndex = Math.floor(Math.random() * total)
    if (nextIndex === resultData.currentExampleIndex) {
      nextIndex = (nextIndex + 1) % total
    }

    this.setData({
      'resultData.currentExampleIndex': nextIndex,
      'resultData.currentLifeExample': getLifeExampleAt(resultData.lifeExamples, nextIndex)
    })
  },

  onCopyTap() {
    const { resultData } = this.data
    if (!resultData) return

    wx.setClipboardData({
      data: buildCopyText(resultData),
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1500
        })
      }
    })
  },

  onHelpfulTap() {
    const { resultData } = this.data
    recordFeedback('helpful', resultData && resultData.favoriteKey)

    wx.showToast({
      title: '已收到反馈',
      icon: 'success',
      duration: 1500
    })
  },

  onLifeExampleFeedbackTap(e) {
    const { resultData } = this.data
    if (!resultData) return

    const feedbackType = e.currentTarget.dataset.type
    const term = resultData.term || this.data.term

    api.sendKnowledgeFeedback({
      term,
      section: 'lifeExample',
      exampleIndex: resultData.currentExampleIndex || 0,
      feedbackType
    }).then(() => {
      wx.showToast({
        title: feedbackType === 'understood' ? '已记录：看懂了' : '已记录：没看懂',
        icon: 'none',
        duration: 1500
      })
    }).catch(err => {
      console.error('[result:lifeExampleFeedback:error]', err)
      wx.showToast({
        title: '反馈提交失败',
        icon: 'none',
        duration: 1500
      })
    })
  },

  onReExplainTap() {
    const { term, resultData } = this.data
    const keyword = resultData ? (resultData.term || term) : term
    recordFeedback('re_explain_child_friendly', keyword)

    wx.navigateTo({
      url: `/pages/simpleExplain/simpleExplain?term=${encodeURIComponent(keyword)}`
    })
  },

  onShareAppMessage() {
    const { resultData, term } = this.data
    const shareTerm = resultData ? (resultData.term || resultData.title) : term

    return {
      title: `${shareTerm}，AI大白话解释给你听`,
      path: `/pages/result/result?term=${encodeURIComponent(shareTerm)}`
    }
  }
})

if (typeof module !== 'undefined') {
  module.exports = {
    normalizeResultData,
    buildCopyText,
    getLifeExampleAt,
    isQuestionQuery,
    createDisplayTitle,
    hasRenderableResult
  }
}
