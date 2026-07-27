// pages/index/index.js - 手绘笔记风格
const knowledge = require('../../utils/knowledge.js')

Page({
  data: {
    searchText: '',
    suggestions: [],
    autoFocus: false,
    isSearched: false,
    resultData: null,
    relatedTerms: [],
    showHistory: false,
    searchHistory: [],
    isFavorite: false,
    hotTerms: ['Token', 'API', '大模型', '微调', 'Prompt', 'Agent', 'Embedding', 'RAG'],
    dailyWord: {
      term: 'AGI',
      shortDesc: '通用人工智能 - 像人一样思考和学习的AI'
    },
    dictCount: 28,
    historyCount: 56,
    learnPercent: 68
  },

  onLoad() {
    // 自动获取焦点
    setTimeout(() => {
      this.setData({ autoFocus: true })
    }, 300)
  },

  onShow() {
    // 页面显示时清空搜索
    this.setData({
      searchText: '',
      suggestions: []
    })
  },

  // 搜索输入
  onSearchInput(e) {
    const searchText = e.detail.value
    this.setData({
      searchText,
      suggestions: this.searchSuggestions(searchText)
    })
  },

  searchSuggestions(keyword) {
    return knowledge.searchSuggestions(keyword)
  },

  onSuggestionTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({
      searchText: keyword,
      suggestions: []
    })

    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(keyword)}`
    })
  },

  onClear() {
    this.setData({
      searchText: '',
      suggestions: []
    })
  },

  // 执行搜索
  onSearch() {
    const searchText = this.data.searchText.trim()
    if (!searchText) return

    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(searchText)}`
    })

    this.setData({ suggestions: [] })
  },

  // 点击热门词汇
  onHotTermTap(e) {
    const term = e.currentTarget.dataset.term
    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(term)}`
    })
  },

  // 点击每日一词
  onDailyWordTap() {
    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(this.data.dailyWord.term)}`
    })
  },

  // 跳转到词典页面
  onGoDictionary() {
    wx.switchTab({
      url: '/pages/dictionary/dictionary'
    })
  },

  // 跳转到搜索历史
  onGoHistory() {
    wx.showToast({
      title: '搜索历史功能开发中',
      icon: 'none'
    })
  },

  // 跳转到个人中心
  onGoMine() {
    wx.switchTab({
      url: '/pages/mine/mine'
    })
  }
})
