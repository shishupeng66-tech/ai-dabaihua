const assert = require('assert')
const explanationPipelineService = require('../../server/services/explanationPipelineService.js')
const modelUsageRepository = require('../../server/repositories/modelUsageRepository.js')
const evaluationRepository = require('../../server/repositories/evaluationRepository.js')

const cases = [
  ['Token是什么', 'term_explain', 'termExplainSkill'],
  ['为什么AI会忘记聊天', 'principle_explain', 'principleExplainSkill'],
  ['用医生行业解释Agent', 'industry_explain', 'industryExplainSkill'],
  ['RAG和微调区别', 'compare_explain', 'compareExplainSkill'],
  ['为什么普通人需要了解AI', 'value_explain', 'valueExplainSkill'],
  ['如何学习AI客服', 'learning_plan', 'learningPlanSkill']
]

function getModelUsageCount() {
  return modelUsageRepository.getUsageLogs().length
}

function getEvaluationCount() {
  return evaluationRepository.getEvaluations().length
}

async function run() {
  const beforeModelUsageCount = getModelUsageCount()
  const beforeEvaluationCount = getEvaluationCount()
  const results = []

  for (const [keyword, expectedIntent, expectedSkillName] of cases) {
    const result = await explanationPipelineService.runExplanationPipeline(keyword)

    assert.strictEqual(result.intent, expectedIntent, keyword)
    assert.strictEqual(result.skillName, expectedSkillName, keyword)
    assert.ok(result.answer, keyword)
    assert.ok(result.tokenUsage, keyword)
    assert.strictEqual(result.usedMock, false, keyword)

    results.push({
      keyword,
      intent: result.intent,
      skillName: result.skillName,
      tokenUsage: result.tokenUsage,
      answer: result.answer
    })
  }

  assert.strictEqual(getModelUsageCount(), beforeModelUsageCount)
  assert.strictEqual(getEvaluationCount(), beforeEvaluationCount)

  console.log(JSON.stringify({
    ok: true,
    modelUsageDelta: getModelUsageCount() - beforeModelUsageCount,
    evaluationDelta: getEvaluationCount() - beforeEvaluationCount,
    results
  }, null, 2))
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
