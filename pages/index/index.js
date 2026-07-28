// pages/index/index.js - SaaS Landing Page

Page({
  data: {
    searchText: '',
    autoFocus: false,
    hotTerms: ['Token', 'API', 'Agent', 'RAG', 'Prompt', 'MCP', 'Codex']
  },

  onLoad() {
    setTimeout(() => {
      this.setData({ autoFocus: true })
    }, 300)
  },

  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    })
  },

  onHotTermTap(e) {
    const term = e.currentTarget.dataset.term
    this.setData({
      searchText: term
    })
  },

  onSearch() {
    const searchText = this.data.searchText.trim()

    if (!searchText) {
      wx.showToast({
        title: '请输入要解释的AI术语',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(searchText)}`
    })
  }
})
