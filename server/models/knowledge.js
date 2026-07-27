const knowledgeModel = {
  id: 'string',
  term: 'string',
  aliases: 'string[]',
  category: 'string',
  level: 'string',
  summary: 'string',
  analogy: 'string',
  examples: 'string[]',
  usage: 'string',
  relatedTerms: 'string[]',
  searchCount: 'number',
  author: 'human | ai',
  reviewStatus: 'approved | pending | rejected',
  createdAt: 'datetime',
  updatedAt: 'datetime'
}

module.exports = knowledgeModel
