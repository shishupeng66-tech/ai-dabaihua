const pendingModel = {
  id: 'string',
  keyword: 'string',
  source: 'user_search | admin_create | import',
  draft: 'object',
  status: 'pending | approved | rejected',
  createdAt: 'datetime',
  updatedAt: 'datetime',
  reviewedAt: 'datetime',
  reviewerId: 'string'
}

module.exports = pendingModel
