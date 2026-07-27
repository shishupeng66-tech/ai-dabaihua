// 知识库词条标准结构。这里是字段约定，不直接参与页面渲染。
const knowledgeEntrySchema = {
  id: '',
  term: '',
  aliases: [],
  category: '',
  level: '',
  difficultyLevel: '',
  sourceType: '',
  targetAudience: '',
  version: '',
  summary: '',
  analogy: '',
  examples: [],
  usage: '',
  relatedTerms: [],
  searchCount: 0,
  author: '',
  reviewStatus: '',
  createdAt: '',
  updatedAt: ''
}

const fieldDescriptions = {
  term: '标准名称',
  aliases: '用户可能输入方式',
  summary: '一句话解释',
  difficultyLevel: '难度等级：beginner、intermediate、advanced',
  sourceType: '内容来源：official、community、business、internal',
  targetAudience: '目标读者：normal、business、developer',
  version: '词条版本号',
  analogy: '生活化比喻',
  examples: '真实场景',
  usage: '普通人为什么需要知道',
  relatedTerms: '关联词',
  searchCount: '用于以后统计热门词',
  author: '内容作者类型：human 或 ai',
  reviewStatus: '审核状态：approved、pending 或 rejected'
}

module.exports = {
  knowledgeEntrySchema,
  fieldDescriptions
}
