// pages/mine/mine.js - 手绘笔记风格
Page({
  data: {
    favoriteCount: 42,
    historyCount: 56,
    achievements: [
      { id: 1, name: '初出茅庐', desc: '第一次搜索', icon: '🌱', bgColor: '#C8E6C9', unlocked: true },
      { id: 2, name: '勤学好问', desc: '累计搜索10个词汇', icon: '⭐', bgColor: '#FFE0B2', unlocked: true },
      { id: 3, name: '知识探索者', desc: '累计学习50个词', icon: '🔍', bgColor: '#B3E5FC', unlocked: true },
      { id: 4, name: '收藏达人', desc: '收藏20个词汇', icon: '❤️', bgColor: '#FFCDD2', unlocked: true },
      { id: 5, name: '学霸养成', desc: '连续学习7天', icon: '🔥', bgColor: '#FFE0B2', unlocked: false }
    ]
  },

  onLoad() {
    // 加载数据
  },

  onShow() {
    // 刷新数据
  },

  // 跳转到收藏
  onGoFavorites() {
    wx.switchTab({
      url: '/pages/dictionary/dictionary'
    })
  },

  // 跳转到历史
  onGoHistory() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 分享
  onShare() {
    wx.showToast({
      title: '感谢分享 ✨',
      icon: 'success'
    })
  },

  // 反馈
  onFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '有任何想法或建议？\n\n欢迎告诉我们！让笔记变得更好用~',
      showCancel: false,
      confirmText: '好的'
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: 'AI大白话 - 用笔记的方式搞定AI术语',
      path: '/pages/index/index'
    }
  }
})
