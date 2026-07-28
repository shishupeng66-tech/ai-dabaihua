const assert = require('assert')

function clearModule(modulePath) {
  delete require.cache[require.resolve(modulePath)]
}

function loadApiWithMode(mode) {
  process.env.EXPLANATION_PIPELINE_MODE = mode

  clearModule('../../config/env.js')
  clearModule('../../server/services/explainService.js')
  clearModule('../../server/api.js')

  return require('../../server/api.js')
}

async function run() {
  const v1Api = loadApiWithMode('v1')
  const v1Result = await v1Api.postExplain({
    keyword: 'Token是什么'
  })

  assert.strictEqual(v1Result.success, true)
  assert.ok(v1Result.source)
  assert.ok(v1Result.data)

  const hunyuanService = require('../../server/services/hunyuanService.js')
  const originalExplainWithPrompt = hunyuanService.explainWithPrompt
  let v2ModelCallCount = 0

  hunyuanService.explainWithPrompt = function patchedExplainWithPrompt(payload) {
    v2ModelCallCount += 1
    return originalExplainWithPrompt.call(this, payload)
  }

  try {
    const v2Api = loadApiWithMode('v2')
    const tokenResult = await v2Api.postExplain({
      keyword: 'Token是什么'
    })

    assert.strictEqual(tokenResult.success, true)
    assert.strictEqual(tokenResult.source, 'knowledge')
    assert.strictEqual(v2ModelCallCount, 0)
    assert.ok(tokenResult.data)

    const llmCases = [
      ['为什么AI会忘记聊天', 'principle_explain'],
      ['RAG和微调区别', 'compare_explain'],
      ['用医生行业解释Agent', 'industry_explain']
    ]
    const results = []

    for (const [keyword, expectedIntent] of llmCases) {
      const result = await v2Api.postExplain({ keyword })

      assert.strictEqual(result.success, true, keyword)
      assert.strictEqual(result.source, 'llm', keyword)
      assert.strictEqual(result.intent, expectedIntent, keyword)
      assert.ok(result.data, keyword)
      assert.ok(result.data.type, keyword)

      results.push({
        keyword,
        source: result.source,
        intent: result.intent,
        type: result.data.type,
        tokenUsage: result.tokenUsage,
        title: result.data.title,
        summary: result.data.summary
      })
    }

    assert.strictEqual(v2ModelCallCount, llmCases.length)

    console.log(JSON.stringify({
      ok: true,
      v1: {
        keyword: 'Token是什么',
        success: v1Result.success,
        source: v1Result.source
      },
      v2Knowledge: {
        keyword: 'Token是什么',
        success: tokenResult.success,
        source: tokenResult.source,
        modelCallCountAfterToken: 0
      },
      v2ModelCallCount,
      v2Results: results
    }, null, 2))
  } finally {
    hunyuanService.explainWithPrompt = originalExplainWithPrompt
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
