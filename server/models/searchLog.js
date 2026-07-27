const searchLogModel = {
  id: 'string',
  userId: 'string',
  keyword: 'string',
  source: 'knowledge | llm',
  matchType: 'exact | alias | keyword | none',
  score: 'number',
  hitKnowledge: 'boolean',
  hitTermId: 'string',
  createdAt: 'datetime'
}

module.exports = searchLogModel
