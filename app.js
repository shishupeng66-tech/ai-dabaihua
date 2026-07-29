// app.js
App({
  onLaunch() {
    console.log('AI大白话小程序启动')
    
    // 初始化本地存储数据
    this.initStorage()
  },

  onShow() {
    // 小程序显示时的逻辑
  },

  onHide() {
    // 小程序隐藏时的逻辑
  },

  // 初始化本地存储
  initStorage() {
    const searchHistory = wx.getStorageSync('search_history')
    if (!searchHistory) {
      wx.setStorageSync('search_history', [])
    }
    
    const favoriteTerms = wx.getStorageSync('favorite_terms')
    if (!favoriteTerms) {
      wx.setStorageSync('favorite_terms', [])
    }

    const analytics = wx.getStorageSync('local_analytics')
    if (!analytics) {
      wx.setStorageSync('local_analytics', {
        searchCount: 0,
        knowledgeHitCount: 0,
        llmCallCount: 0,
        dailySearchCounts: {},
        hotKeywords: {},
        feedback: {
          helpfulCount: 0,
          reExplainCount: 0
        }
      })
    }

    const unknownKeywords = wx.getStorageSync('unknown_keywords')
    if (!unknownKeywords) {
      wx.setStorageSync('unknown_keywords', [])
    }
  },

  // 全局数据
  globalData: {
    userInfo: null,
    // 默认热门词汇
    defaultHotTerms: [
      { term: 'Token', viewCount: 999 },
      { term: 'API', viewCount: 888 },
      { term: '大模型', viewCount: 777 },
      { term: '微调', viewCount: 666 },
      { term: '提示词工程', viewCount: 555 },
      { term: 'AGI', viewCount: 444 },
      { term: 'GPT', viewCount: 333 },
      { term: '多模态', viewCount: 222 }
    ],
    // 每日一词数据
    dailyWord: {
      term: 'AGI',
      shortDesc: '通用人工智能'
    }
  }
})
