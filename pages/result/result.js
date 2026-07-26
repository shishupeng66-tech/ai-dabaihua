// pages/result/result.js - Apple Style
Page({
  data: {
    term: '',
    isLoading: true,
    resultData: null,
    isFavorite: false,
    relatedTerms: ['大模型', 'GPT', 'Prompt', 'API', '训练']
  },

  onLoad(options) {
    const term = decodeURIComponent(options.term || '')
    this.setData({ term })
    wx.setNavigationBarTitle({ title: term })
    this.loadExplanation(term)
  },

  // 加载解释
  loadExplanation(term) {
    setTimeout(() => {
      const mockData = this.getMockExplanation(term)
      this.setData({
        resultData: mockData,
        isLoading: false
      })
    }, 1200)
  },

  // 获取模拟解释数据
  getMockExplanation(term) {
    const explanations = {
      'token': {
        term: 'Token',
        explanation: 'Token就是AI处理文字时的最小单位。简单说，就像我们说话是一个字一个字组成的，AI"说话"也是一个Token一个Token算的。你输入的文字会被拆成Token，AI输出的回答也会被拆成Token。Token越多，AI需要的计算量就越大，成本也就越高。',
        analogy: '就像乐高积木，AI把所有文字都拆成一小块一小块的Token，然后再用这些积木重新组合成答案。',
        analogyIcon: '🧱',
        examples: [
          '1个汉字大约等于1.5个Token',
          'ChatGPT每次对话最多能处理4096个Token',
          'Token越多，AI能记住的上下文就越长'
        ]
      },
      'api': {
        term: 'API',
        explanation: 'API就是两个软件之间的"联络员"。比如你在美团点外卖，美团不需要自己做支付系统，它只要调用微信支付的API就行。简单说，API就是不同软件之间约定好的"说话方式"，大家按照这个格式来，就能互相传递数据了。',
        analogy: '就像餐厅里的服务员，你（APP）点菜（发请求），服务员（API）把菜单传给后厨（另一系统），做好了再把菜（结果）端回给你。',
        analogyIcon: '🍽️',
        examples: [
          '天气预报APP用气象局的API获取天气数据',
          '你的小程序用API调用AI大模型来生成解释',
          '几乎所有APP之间的通信都是靠API'
        ]
      },
      '大模型': {
        term: '大模型',
        explanation: '大模型就像是一个读了整个互联网的"超级学霸"。它学习了几百亿甚至上万亿的文字、图片、视频等数据，然后就变得什么都懂一点了。它可以回答问题、写文章、画画、写代码...因为它"学"得足够多，所以能做的事情也特别多。',
        analogy: '就像一个什么书都读过的超级图书馆管理员，不管你问什么领域的问题，它都能给你讲明白。',
        analogyIcon: '📚',
        examples: [
          'ChatGPT就是一个大模型',
          '文心一言、通义千问也都是大模型',
          '"大"指的是它学习的数据量和参数量特别大'
        ]
      },
      'prompt': {
        term: 'Prompt',
        explanation: 'Prompt就是你跟AI说话的"技巧"。AI就像一个特别听话但不太会猜心思的员工，你问得越清楚、越具体，它给你的答案就越好。Prompt就是研究怎么把你的需求描述清楚，让AI能准确理解你想要什么。',
        analogy: '就像给员工写工作说明书，写得越清楚，交付的结果就越符合你的预期。',
        analogyIcon: '📝',
        examples: [
          '不说"写一篇文章"，而说"用幽默的语气写一篇300字的养猫攻略"',
          '好的Prompt能让AI的输出质量提升好几倍',
          '这是现在AI时代最实用的技能之一'
        ]
      },
      'agent': {
        term: 'Agent',
        explanation: 'Agent就是AI的"智能助手"。普通AI只会回答你的问题，而Agent可以主动帮你做事情——比如帮你上网查资料、整理信息、甚至帮你写代码和发邮件。它会自己思考下一步该做什么，而不是等你一句一句下指令。',
        analogy: '就像有个24小时待命的全能助理，你说一句"帮我做市场调研"，它就自己去查资料、整理报告了。',
        analogyIcon: '🤖',
        examples: [
          'AutoGPT就是最有名的AI Agent之一',
          'Agent可以自动调用工具、上网搜索',
          'Agent比普通AI更能完成复杂任务'
        ]
      },
      'default': {
        term: term,
        explanation: `${term}是AI领域的一个重要概念。简单来说，它指的是在人工智能技术中相关的技术术语。随着AI技术的发展，越来越多的专业词汇进入了我们的日常工作和生活，理解这些词汇可以帮助我们更好地了解和使用AI工具。`,
        analogy: '就像学外语需要先背单词一样，学AI也需要先搞懂这些基础术语。',
        analogyIcon: '💡',
        examples: [
          '这是一个AI相关的专业术语',
          '建议结合具体上下文来理解',
          '可以查阅更多资料深入学习'
        ]
      }
    }

    const lowerTerm = term.toLowerCase().trim()
    return explanations[lowerTerm] || explanations['default']
  },

  // 收藏按钮
  onFavoriteTap() {
    const newState = !this.data.isFavorite
    this.setData({ isFavorite: newState })
    
    wx.showToast({
      title: newState ? '已收藏' : '已取消收藏',
      icon: newState ? 'success' : 'none',
      duration: 1500
    })
  },

  // 复制按钮
  onCopyTap() {
    const { resultData } = this.data
    const text = `【${resultData.term}】\n\n${resultData.explanation}\n\n💡 ${resultData.analogy}\n\n${resultData.examples.map(e => '• ' + e).join('\n')}`
    
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

  // 点击相关词汇
  onRelatedTap(e) {
    const term = e.currentTarget.dataset.term
    wx.redirectTo({
      url: `/pages/result/result?term=${encodeURIComponent(term)}`
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    const { resultData } = this.data
    return {
      title: `什么是${resultData.term}？AI大白话告诉你！`,
      path: `/pages/result/result?term=${encodeURIComponent(resultData.term)}`
    }
  }
})
