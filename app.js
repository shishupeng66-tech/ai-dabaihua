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
    },
    // Mock术语解释数据
    mockExplanations: {
      'token': {
        term: 'Token',
        explanation: '简单说，Token就是AI的"计费单位"。就像你买水按"瓶"算，打电话按"分钟"算一样，AI处理文字是按"Token"来算的。你输入的文字会被拆成一个个的Token，AI输出的回答也会被拆成Token。Token越多，AI需要的计算量就越大，成本也就越高。',
        examples: [
          '一个汉字 ≈ 1-2个Token',
          '一个英文单词 ≈ 1个Token',
          'ChatGPT每次对话有Token上限，超过就不能继续聊了'
        ]
      },
      'api': {
        term: 'API',
        explanation: 'API就是两个软件之间的"翻译官"和"联络员"。比如说你想在美团里用微信支付，美团不需要自己做一个支付系统，它只需要调用微信的API就行。简单说，API就是一个软件给另一个软件提供服务的"窗口"，大家按照约定的格式说话，就能互相传递数据了。',
        examples: [
          '天气预报APP用API从气象局获取天气数据',
          '外卖APP用API调用微信支付',
          '你的小程序用API调用AI大模型来生成解释'
        ]
      },
      '大模型': {
        term: '大模型',
        explanation: '大模型就像是一个读过整个互联网的"超级学霸"。它学习了几十亿甚至上万亿的文字、图片、视频等数据，然后就变得什么都懂一点了。它可以回答问题、写文章、画画、写代码... 这个"学霸"的"大脑"越大（参数越多），会的东西就越多，回答得也越好。',
        examples: [
          'ChatGPT就是一个大模型',
          '文心一言、通义千问也都是大模型',
          '"大"指的是它学习的数据量和参数数量特别大'
        ]
      },
      '微调': {
        term: '微调',
        explanation: '微调就是给"通用学霸"做"专业培训"。大模型本来是什么都懂一点的通才，但如果你想让它特别擅长某个领域（比如医学、法律、写小说），你就可以用这个领域的专门数据再教它一下，让它在这个领域变得更专业。这个"再培训一下"的过程就叫微调。',
        examples: [
          '给通用大模型喂很多医学论文，它就变成了"医疗专用AI"',
          '给大模型喂很多古诗词，它写古诗就会特别厉害',
          '微调成本比从头训练一个大模型便宜多了'
        ]
      },
      '提示词工程': {
        term: '提示词工程',
        explanation: '提示词工程就是"AI的说话艺术"。AI就像一个特别听话但不太会猜心思的员工，你问得越清楚、越具体，它给你的答案就越好。提示词工程就是研究怎么跟AI说话，怎么把你的需求描述清楚，让AI能准确理解你的意思，给出你想要的答案。',
        examples: [
          '不说"写一篇文章"，而说"用幽默的语气写一篇300字的养猫攻略"',
          '好的提示词能让AI的输出质量提升好几倍',
          '这是现在AI时代最实用的技能之一'
        ]
      },
      'agi': {
        term: 'AGI',
        explanation: 'AGI就是"真正的人工智能"。现在的AI虽然看起来很厉害，但其实都是"偏科生"——只能做它训练过的事情。而AGI是指那种和人一样聪明的AI，什么都能学，什么都能做，有自己的理解和判断。简单说：现在的AI是"人工智障"到"人工智能"之间，而AGI就是真正的"人工智能"终点。',
        examples: [
          '现在的AI还不是AGI',
          'AGI能像人一样思考、学习、创造',
          '有人说AGI会在未来10年内出现，也有人说还要很久'
        ]
      },
      'gpt': {
        term: 'GPT',
        explanation: 'GPT就是OpenAI家的"AI系列产品名字"，类似苹果的iPhone。G是Generative（生成的），P是Pre-trained（预训练的），T是Transformer（一种AI技术架构）。每次出新版本就加个数字，GPT-3、GPT-4、GPT-4o... 数字越大，版本越新，能力越强。',
        examples: [
          'ChatGPT就是用GPT模型做的聊天机器人',
          'GPT-4比GPT-3.5聪明很多，但也更贵',
          '类似的还有文心一言、通义千问等，都是不同公司的大模型'
        ]
      },
      '多模态': {
        term: '多模态',
        explanation: '多模态就是AI不光能看懂文字，还能看懂图片、听懂声音、看懂视频。以前的AI是"单模态"的——只能处理文字。现在的多模态AI就像人一样，能用眼睛看、用耳朵听，然后综合这些信息来回答问题。',
        examples: [
          '你给AI发一张数学试卷的照片，它能看懂题目并告诉你答案',
          '你上传一张设计图，AI能帮你修改和提建议',
          'GPT-4o就是典型的多模态大模型'
        ]
      }
    }
  }
})
