// pages/dictionary/dictionary.js - Apple Style
Page({
  data: {
    filterText: '',
    selectedCategory: 'all',
    categories: [
      { id: 'all', name: '全部', count: 0 },
      { id: 'ai', name: 'AI基础', count: 0 },
      { id: 'model', name: '大模型', count: 0 },
      { id: 'coding', name: '开发相关', count: 0 }
    ],
    wordList: [
      {
        id: 1,
        word: 'Token',
        category: 'AI基础',
        explanation: 'Token就是AI处理文字时的最小单位。就像我们说话是一个字一个字组成的，AI"说话"也是一个Token一个Token算的。',
        shortAnalogy: '就像乐高积木',
        icon: '🧱',
        isFavorite: true
      },
      {
        id: 2,
        word: 'API',
        category: '开发相关',
        explanation: 'API就是两个软件之间的"联络员"。比如你在美团点外卖，美团不需要自己做支付系统，它只要调用微信支付的API就行。',
        shortAnalogy: '就像餐厅的服务员',
        icon: '🍽️',
        isFavorite: true
      },
      {
        id: 3,
        word: '大模型',
        category: '大模型',
        explanation: '大模型就像是一个读了整个互联网的"超级学霸"。它学习了几百亿甚至上万亿的文字、图片等数据，然后就变得什么都懂一点了。',
        shortAnalogy: '就像超级图书馆管理员',
        icon: '📚',
        isFavorite: true
      },
      {
        id: 4,
        word: 'Prompt',
        category: 'AI基础',
        explanation: 'Prompt就是你跟AI说话的"技巧"。AI就像一个特别听话但不太会猜心思的员工，你问得越清楚、越具体，它给你的答案就越好。',
        shortAnalogy: '就像给员工写工作说明书',
        icon: '📝',
        isFavorite: true
      },
      {
        id: 5,
        word: 'Agent',
        category: '大模型',
        explanation: 'Agent就是AI的"智能助手"。普通AI只会回答你的问题，而Agent可以主动帮你做事情——上网查资料、整理信息、甚至帮你写代码。',
        shortAnalogy: '就像24小时待命的全能助理',
        icon: '🤖',
        isFavorite: true
      }
    ],
    filteredList: []
  },

  onLoad() {
    this.updateCategoryCounts()
    this.filterList()
  },

  onShow() {
    // 可以刷新数据
  },

  // 更新分类计数
  updateCategoryCounts() {
    const { wordList, categories } = this.data
    const counts = {
      all: wordList.length,
      ai: wordList.filter(w => w.category === 'AI基础').length,
      model: wordList.filter(w => w.category === '大模型').length,
      coding: wordList.filter(w => w.category === '开发相关').length
    }
    
    const updatedCategories = categories.map(cat => ({
      ...cat,
      count: counts[cat.id] || 0
    }))
    
    this.setData({ categories: updatedCategories })
  },

  // 过滤列表
  filterList() {
    const { wordList, filterText, selectedCategory } = this.data
    let filtered = wordList

    // 按分类过滤
    if (selectedCategory !== 'all') {
      const categoryMap = {
        ai: 'AI基础',
        model: '大模型',
        coding: '开发相关'
      }
      filtered = filtered.filter(w => w.category === categoryMap[selectedCategory])
    }

    // 按搜索词过滤
    if (filterText.trim()) {
      const keyword = filterText.toLowerCase()
      filtered = filtered.filter(w => 
        w.word.toLowerCase().includes(keyword) || 
        w.explanation.toLowerCase().includes(keyword)
      )
    }

    this.setData({ filteredList: filtered })
  },

  // 搜索输入
  onFilterInput(e) {
    this.setData({ filterText: e.detail.value })
    this.filterList()
  },

  // 选择分类
  onCategorySelect(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ selectedCategory: categoryId })
    this.filterList()
  },

  // 点击词汇卡片
  onWordTap(e) {
    const word = e.currentTarget.dataset.word
    wx.navigateTo({
      url: `/pages/result/result?term=${encodeURIComponent(word.word)}`
    })
  }
})
