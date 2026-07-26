// pages/mine/mine.js - Apple Style
Page({
  data: {
    favoriteCount: 5,
    historyCount: 23,
    achievements: [
      { id: 1, name: '初出茅庐', desc: '第一次搜索', icon: '🌱', color: '#34C759', unlocked: true },
      { id: 2, name: '勤学好问', desc: '累计搜索10个词汇', icon: '⭐', color: '#FF9500', unlocked: true },
      { id: 3, name: '知识探索者', desc: '累计学习50个词', icon: '🔍', color: '#007AFF', unlocked: true },
      { id: 4, name: '收藏达人', desc: '收藏20个词汇', icon: '❤️', color: '#FF3B30', unlocked: false },
      { id: 5, name: '连续7天', desc: '连续学习7天', icon: '🔥', color: '#FF9500', unlocked: false }
    ]
  },

  onLoad() {
    // 加载数据
    this.loadCounts()
  },

  onShow() {
    this.loadCounts()
  },

  // 加载收藏和历史数量
  loadCounts() {
    try {
      const favorites = wx.getStorageSync('favorites') || []
      const history = wx.getStorageSync('searchHistory') || []
      this.setData({
        favoriteCount: favorites.length,
        historyCount: history.length
      })
    } catch (e) {
      console.log('加载统计数据失败')
    }
  },

  // 跳转到收藏
  onGoFavorites() {
    wx.switchTab({
      url: '/pages/dictionary/dictionary'
    })
  },

  // 跳转到历史
  onGoHistory() {
    wx.switchTab({
      url: '/pages/dictionary/dictionary'
    })
  },

  // 关于
  onAbout() {
    wx.showModal({
      title: 'AI大白话',
      content: '版本 1.0.0\n\n让复杂的AI术语，变得通俗易懂。\n\n© 2024 AI大白话团队',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 反馈
  onFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有任何问题或建议，欢迎通过以下方式联系：\n\n邮箱：feedback@aidabaihua.com',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
