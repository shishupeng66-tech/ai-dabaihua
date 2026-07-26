// pages/index/index.js - Apple Style
Page({
  data: {
    searchText: '',
    autoFocus: false,
    hotTerms: ['Token', 'API', '大模型', '微调', 'Prompt', 'Agent'],
    suggestions: ['机器学习', '神经网络', '深度学习', '自然语言处理', '计算机视觉'],
    dailyWord: {
      term: 'AGI',
      shortDesc: '通用人工智能 - 像人类一样思考的AI'
    }
  },

  onLoad() {
    // 自动获取焦点
    setTimeout(() => {
      this.setData({ autoFocus: true })
    }, 300)
  },

  onShow() {
    // 页面显示时清空搜索
    this.setData({ searchText: '' })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchText: e.detail.value })
  },

  // 执行搜索
  onSearch() {
    const searchText = this.data.searchText.trim()
    if (!searchText) return

    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(searchText)}`
    })
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
  },

  // 分类点击
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.cat
    wx.showToast({
      title: `浏览${category}分类`,
      icon: 'none'
    })
  }
})
