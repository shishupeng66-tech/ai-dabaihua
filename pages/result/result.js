// pages/result/result.js
const api = require('../../utils/api.js')
const favorite = require('../../utils/favorite.js')
const analytics = require('../../utils/analytics.js')

const DEFAULT_RELATED_TERMS = ['大模型', 'GPT', 'Prompt', 'API', '训练', '微调']

function compactList(items) {
  return Array.isArray(items)
    ? items.filter(item => item !== undefined && item !== null && String(item).trim())
    : []
}

function normalizeType(type) {
  const normalized = String(type || '').trim()
  if (normalized === 'compare_explain') return 'compare'
  return normalized || 'term_explain'
}

function getContent(data) {
  return data && data.content && typeof data.content === 'object' ? data.content : {}
}

function firstText() {
  const values = Array.prototype.slice.call(arguments)
  const value = values.find(item => item !== undefined && item !== null && String(item).trim())
  return value ? String(value).trim() : ''
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

function createTermSections(data, content) {
  return compactList([
    createSection('oneSentence', '一句话理解', firstText(content.oneSentence, data.summary, data.explanation)),
    createSection('analogy', '类比一下', firstText(content.analogy, data.analogy)),
    createSection('howItWorks', '工作方式', firstText(content.howItWorks)),
    createSection('examples', '举个例子', content.examples || data.examples, 'list'),
    createSection('importance', '为什么重要', firstText(content.importance, data.usage)),
    createSection('notes', '注意事项', content.notes, 'list')
  ])
}

function createPrincipleSections(data, content) {
  return compactList([
    createSection('coreAnswer', '核心答案', firstText(content.coreAnswer, data.summary, data.explanation)),
    createSection('reasons', '原因拆解', content.reasons, 'object-list'),
    createSection('solutions', '解决方式', content.solutions, 'list')
  ])
}

function createIndustrySections(data, content) {
  return compactList([
    createSection('coreAnswer', '核心解释', firstText(content.coreAnswer, data.summary, data.explanation)),
    createSection('roleMapping', '行业映射', content.roleMapping, 'object-list'),
    createSection('workflow', '工作流程', content.workflow, 'steps'),
    createSection('scenarios', '使用场景', content.scenarios, 'list'),
    createSection('safetyBoundaries', '边界提醒', content.safetyBoundaries, 'warning-list')
  ])
}

function createCompareSections(data, content) {
  return compactList([
    createSection('oneSentenceDifference', '一句话区别', firstText(content.oneSentenceDifference, data.summary, data.explanation)),
    createSection('items', '对比对象', content.items, 'object-list'),
    createSection('dimensions', '对比表', content.dimensions, 'comparison'),
    createSection('recommendation', '选择建议', content.recommendation, 'list')
  ])
}

function createValueSections(data, content) {
  return compactList([
    createSection('currentChange', '变化是什么', firstText(content.currentChange, data.summary, data.explanation)),
    createSection('userImpact', '对你的影响', content.userImpact, 'object-list'),
    createSection('actionSuggestions', '行动建议', content.actionSuggestions, 'list')
  ])
}

function createLearningSections(data, content) {
  return compactList([
    createSection('goal', '学习目标', firstText(content.goal, data.summary, data.explanation)),
    createSection('stages', '阶段路线', content.stages, 'roadmap'),
    createSection('pitfalls', '避坑建议', content.pitfalls, 'warning-list')
  ])
}

function createSections(type, data, content) {
  if (type === 'principle_explain') return createPrincipleSections(data, content)
  if (type === 'industry_explain') return createIndustrySections(data, content)
  if (type === 'compare') return createCompareSections(data, content)
  if (type === 'value_explain') return createValueSections(data, content)
  if (type === 'learning_plan') return createLearningSections(data, content)
  return createTermSections(data, content)
}

function normalizeResultData(apiResult, query) {
  const data = apiResult && apiResult.data ? apiResult.data : {}
  const content = getContent(data)
  const type = normalizeType(data.type)
  const term = firstText(data.term, query)
  const title = firstText(data.title, term ? `${term}是什么？` : query)
  const summary = firstText(
    data.summary,
    data.explanation,
    content.oneSentence,
    content.coreAnswer,
    content.oneSentenceDifference,
    content.currentChange,
    content.goal
  )
  const relatedTerms = compactList(data.relatedTerms || content.relatedConcepts || DEFAULT_RELATED_TERMS)
  const sections = createSections(type, data, content)
  const analogy = firstText(content.analogy, data.analogy)
  const examples = compactList(content.examples || data.examples)
  const usage = firstText(content.importance, data.usage)

  return {
    type,
    title,
    term,
    summary,
    sections,
    relatedTerms,
    favoriteKey: firstText(term, title, query),

    // Legacy fields kept so the current WXML can render without structural changes.
    explanation: firstText(summary, content.oneSentence, content.coreAnswer),
    analogy,
    examples,
    usage,
    content,
    meta: data.meta || {}
  }
}

function formatObjectItem(item) {
  if (!item || typeof item !== 'object') return firstText(item)

  return compactList([
    item.title,
    item.detail,
    item.aiConcept && item.industryRole ? `${item.aiConcept}：${item.industryRole}` : '',
    item.description,
    item.dimension,
    item.left && item.right ? `左：${item.left}；右：${item.right}` : '',
    item.conclusion,
    item.name,
    item.shortDefinition,
    item.learningGoal ? `学习目标：${item.learningGoal}` : '',
    item.practiceGoal ? `实践目标：${item.practiceGoal}` : '',
    item.output ? `产出：${item.output}` : '',
    Array.isArray(item.tasks) ? `任务：${item.tasks.join('；')}` : ''
  ]).join('\n')
}

function formatSectionValue(section) {
  if (!section) return ''
  const value = section.value

  if (Array.isArray(value)) {
    return value
      .map((item, index) => `${index + 1}. ${formatObjectItem(item)}`)
      .filter(Boolean)
      .join('\n')
  }

  return firstText(value)
}

function buildCopyText(viewModel) {
  if (!viewModel) return ''

  const lines = compactList([
    viewModel.title,
    viewModel.summary,
    ...(viewModel.sections || []).map(section => {
      const sectionText = formatSectionValue(section)
      return sectionText ? `${section.title}\n${sectionText}` : ''
    })
  ])

  return lines.join('\n\n')
}

Page({
  data: {
    term: '',
    isLoading: true,
    resultData: null,
    source: '',
    sourceText: '',
    errorText: '',
    isFavorite: false,
    relatedTerms: DEFAULT_RELATED_TERMS
  },

  onLoad(options) {
    const term = decodeURIComponent(options.term || '')
    this.setData({ term })
    wx.setNavigationBarTitle({ title: term })
    this.loadExplanation(term)
  },

  loadExplanation(term) {
    this.setData({
      isLoading: true,
      resultData: null,
      source: '',
      sourceText: '',
      errorText: ''
    })

    api.explainTerm(term)
      .then(res => {
        if (!res || !res.success || !res.data) {
          throw new Error('解释结果为空')
        }

        const viewModel = normalizeResultData(res, term)
        const sourceText = res.source === 'llm' ? 'AI实时解释' : '来自AI知识库'

        this.setData({
          resultData: viewModel,
          source: res.source,
          sourceText,
          relatedTerms: viewModel.relatedTerms.length ? viewModel.relatedTerms : this.data.relatedTerms,
          isFavorite: favorite.isFavorite(viewModel.favoriteKey),
          isLoading: false
        })
      })
      .catch(err => {
        const message = err && err.message ? err.message : '解释失败，请稍后再试'

        this.setData({
          isLoading: false,
          errorText: message
        })

        wx.showToast({
          title: message,
          icon: 'none'
        })
      })
  },

  onFavoriteTap() {
    const { resultData } = this.data
    if (!resultData) return

    const favoriteKey = resultData.favoriteKey || resultData.term
    const newState = !this.data.isFavorite
    if (newState) {
      favorite.addFavorite(favoriteKey)
    } else {
      favorite.removeFavorite(favoriteKey)
    }

    this.setData({ isFavorite: newState })

    wx.showToast({
      title: newState ? '已加入笔记' : '已取消收藏',
      icon: newState ? 'success' : 'none',
      duration: 1500
    })
  },

  onCopyTap() {
    const { resultData } = this.data
    if (!resultData) return

    wx.setClipboardData({
      data: buildCopyText(resultData),
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 1500
        })
      }
    })
  },

  onHelpfulTap() {
    const { resultData } = this.data
    analytics.recordFeedback('helpful', resultData && resultData.favoriteKey)

    wx.showToast({
      title: '已收到反馈',
      icon: 'success',
      duration: 1500
    })
  },

  onReExplainTap() {
    const { term, resultData } = this.data
    analytics.recordFeedback('re_explain', resultData && resultData.favoriteKey)
    this.loadExplanation(term)
  },

  onRelatedTap(e) {
    const term = e.currentTarget.dataset.term
    wx.redirectTo({
      url: `/pages/result/result?term=${encodeURIComponent(term)}`
    })
  },

  onShareAppMessage() {
    const { resultData, term } = this.data
    const shareTerm = resultData ? (resultData.term || resultData.title) : term

    return {
      title: `什么是${shareTerm}？AI大白话告诉你`,
      path: `/pages/result/result?term=${encodeURIComponent(shareTerm)}`
    }
  }
})

if (typeof module !== 'undefined') {
  module.exports = {
    normalizeResultData,
    buildCopyText
  }
}
