const hunyuanService = require('../server/services/hunyuanService.js')

function explainByLLM(keyword) {
  return hunyuanService.explain(keyword)
}

module.exports = {
  explainByLLM
}
