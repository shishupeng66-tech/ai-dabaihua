// pages/dictionary/dictionary.js - 手绘笔记风格
Page({
  data: {
    filterText: '',
    selectedCategory: 'all',
    categories: [
      { id: 'all', name: '全部', icon: '📁', color: 'tag-yellow' },
      { id: 'ai', name: 'AI基础', icon: '🧠', color: 'tag-blue' },
      { id: 'model', name: '大模型', icon: '🤖', color: 'tag-green' },
      { id: 'coding', name: '开发相关', icon: '💻', color: 'tag-pink' }
    ],
    wordList: [
      {
        id: 1,
        word: 'Token',
        category: 'AI基础',
        explanation: 'Token就是AI处理文字时的最小单位。就像我们说话是一个字一个字组成的，AI"说话"也是一个Token一个Token算的。',
        date: '2024.01.15',
        reviewed: true,
        color: 'sticky-green',
        rotate: -0.5
      },
      {
        id: 2,
        word: 'API',
        category: '开发相关',
        explanation: 'API就是两个软件之间的"联络员"。比如你在美团点外卖，美团不需要自己做支付系统，它只要调用微信支付的API就行。',
        date: '2024.01.14',
        reviewed: true,
        color: 'sticky-pink',
        rotate: 0.8
      },
      {
        id: 3,
        word: '大模型',
        category: '大模型',
        explanation: '大模型就像是一个读了整个互联网的"超级学霸"。它学习了几百亿甚至上万亿的文字、图片等数据，然后就变得什么都懂一点了。',
        date: '2024.01.13',
        reviewed: false,
        color: 'sticky-blue',
        rotate: -0.3
      },
      {
        id: 4,
        word: 'Prompt',
        category: 'AI基础',
        explanation: 'Prompt就是你跟AI说话的"技巧"。AI就像一个特别听话但不太会猜心思的员工，你问得越清楚、越具体，它给你的答案就越好。',
        date: '2024.01.12',
        reviewed: true,
        color: 'sticky-yellow',
        rotate: 0.5
      },
      {
        id: 5,
        word: 'Agent',
        category: '大模型',
        explanation: 'Agent就是AI的"智能助手"。普通AI只会回答你的问题，而Agent可以主动帮你做事情——上网查资料、整理信息、甚至帮你写代码。',
        date: '2024.01.11',
        reviewed: false,
        color: 'sticky-purple',
        rotate: -0.8
      }
    ],
    filteredList: [],
    isLoading: false
  },

  onLoad() {
    this.filterList()
  },

  onShow() {
    // 可以刷新数据
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
  },

  // 去搜索
  onGoSearch() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
