// pages/result/result.js - 手绘笔记风格
const api = require('../../utils/api.js')
const favorite = require('../../utils/favorite.js')
const analytics = require('../../utils/analytics.js')

Page({
  data: {
    term: '',
    isLoading: true,
    resultData: null,
    source: '',
    sourceText: '',
    errorText: '',
    isFavorite: false,
    relatedTerms: ['大模型', 'GPT', 'Prompt', 'API', '训练', '微调']
  },

  onLoad(options) {
    const term = decodeURIComponent(options.term || '')
    this.setData({ term })
    wx.setNavigationBarTitle({ title: term })
    this.loadExplanation(term)
  },

  // 加载解释
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

        const sourceText = res.source === 'llm' ? '🤖 AI实时解释' : '📚 来自AI知识库'

        this.setData({
          resultData: res.data,
          source: res.source,
          sourceText,
          relatedTerms: res.data.relatedTerms || this.data.relatedTerms,
          isFavorite: favorite.isFavorite(res.data.term),
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

  // 收藏按钮
  onFavoriteTap() {
    const { resultData } = this.data
    if (!resultData) return

    const newState = !this.data.isFavorite
    if (newState) {
      favorite.addFavorite(resultData.term)
    } else {
      favorite.removeFavorite(resultData.term)
    }

    this.setData({ isFavorite: newState })

    wx.showToast({
      title: newState ? '已加入笔记' : '已取消收藏',
      icon: newState ? 'success' : 'none',
      duration: 1500
    })
  },

  // 复制按钮
  onCopyTap() {
    const { resultData } = this.data
    if (!resultData) return

    const text = `【${resultData.term}是什么？】\n\n${resultData.summary || resultData.explanation}\n\n生活例子：${resultData.analogy}\n\n为什么重要：${resultData.usage || '暂无'}\n\n${resultData.examples.map(e => '• ' + e).join('\n')}`

    wx.setClipboardData({
      data: text,
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
    analytics.recordFeedback('helpful', resultData && resultData.term)

    wx.showToast({
      title: '已收到反馈',
      icon: 'success',
      duration: 1500
    })
  },

  onReExplainTap() {
    const { term, resultData } = this.data
    analytics.recordFeedback('re_explain', resultData && resultData.term)
    this.loadExplanation(term)
  },

  // 点击相关词汇
  onRelatedTap(e) {
    const term = e.currentTarget.dataset.term
    wx.redirectTo({
      url: `/pages/result/result?term=${encodeURIComponent(term)}`
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    const { resultData, term } = this.data
    const shareTerm = resultData ? resultData.term : term

    return {
      title: `什么是${shareTerm}？AI大白话告诉你！`,
      path: `/pages/result/result?term=${encodeURIComponent(shareTerm)}`
    }
  }
})
