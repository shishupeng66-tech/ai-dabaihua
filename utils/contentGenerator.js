const hunyuanService = require('../server/services/hunyuanService.js')

function generateDraft(keyword) {
  const normalizedKeyword = String(keyword || '').trim()

  if (!normalizedKeyword) {
    return Promise.reject(new Error('缺少待生成的关键词'))
  }

  return hunyuanService.explain(normalizedKeyword).then(result => ({
    term: result.term || normalizedKeyword,
    summary: result.summary || result.explanation || '',
    analogy: result.analogy || '',
    examples: result.examples || [],
    usage: result.usage || '',
    relatedTerms: result.relatedTerms || []
  }))
}

module.exports = {
  generateDraft
}
