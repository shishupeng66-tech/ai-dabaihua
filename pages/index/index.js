Page({
  data: {
    searchText: '',
    inputLength: 0,
    hotTerms: ['Token', 'API', 'Agent', 'RAG', 'Prompt', 'MCP', 'Codex']
  },

  onSearchInput(e) {
    const searchText = e.detail.value || ''

    this.setData({
      searchText,
      inputLength: searchText.length
    })
  },

  onHotTermTap(e) {
    const term = e.currentTarget.dataset.term || ''

    this.setData({
      searchText: term,
      inputLength: term.length
    })
  },

  onSearch() {
    const searchText = this.data.searchText.trim()

    if (!searchText) {
      wx.showToast({
        title: '请输入要解释的AI关键词',
        icon: 'none'
      })
      return
    }

    if (searchText.length < 2) {
      wx.showToast({
        title: '请输入更完整的AI关键词或问题',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(searchText)}`
    })
  }
})
