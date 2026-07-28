const assert = require('assert')

global.Page = function noopPage() {}

global.wx = {
  setNavigationBarTitle() {},
  showToast() {},
  setClipboardData() {},
  redirectTo() {}
}

const {
  normalizeResultData,
  buildCopyText
} = require('../../pages/result/result.js')

function assertCopyHasNoUndefined(viewModel) {
  const text = buildCopyText(viewModel)
  assert.ok(text)
  assert.strictEqual(text.includes('undefined'), false)
  assert.strictEqual(text.includes('null'), false)
}

const tokenKnowledge = normalizeResultData({
  success: true,
  source: 'knowledge',
  data: {
    term: 'Token',
    summary: 'Token就是AI处理文字的小单位。',
    explanation: 'Token就是AI处理文字的小单位。',
    analogy: '就像积木。',
    examples: ['长文章会消耗更多Token'],
    usage: '理解Token能帮助判断成本和长度。',
    relatedTerms: ['Prompt']
  }
}, 'Token是什么')

assert.strictEqual(tokenKnowledge.type, 'term_explain')
assert.strictEqual(tokenKnowledge.term, 'Token')
assert.strictEqual(tokenKnowledge.favoriteKey, 'Token')
assert.ok(tokenKnowledge.sections.some(item => item.key === 'analogy'))
assert.deepStrictEqual(tokenKnowledge.examples, ['长文章会消耗更多Token'])
assertCopyHasNoUndefined(tokenKnowledge)

const principle = normalizeResultData({
  success: true,
  source: 'llm',
  data: {
    type: 'principle_explain',
    title: '为什么AI会忘记聊天',
    term: 'AI忘记聊天',
    summary: 'AI会忘记聊天，是因为上下文有限。',
    content: {
      coreAnswer: 'AI每次能看到的内容有限。',
      reasons: [
        { title: '窗口有限', detail: '前文太长会被挤掉。' }
      ],
      solutions: ['重新补充背景']
    },
    relatedTerms: ['上下文窗口']
  }
}, '为什么AI会忘记聊天')

assert.strictEqual(principle.type, 'principle_explain')
assert.ok(principle.sections.some(item => item.key === 'reasons'))
assertCopyHasNoUndefined(principle)

const compare = normalizeResultData({
  success: true,
  source: 'llm',
  data: {
    type: 'compare_explain',
    title: 'RAG和微调区别',
    term: 'RAG vs 微调',
    summary: 'RAG是现查资料，微调是提前训练。',
    content: {
      oneSentenceDifference: 'RAG像开卷，微调像提前培训。',
      dimensions: [
        {
          dimension: '知识更新',
          left: '更新快',
          right: '要重训',
          conclusion: '资料常变选RAG'
        }
      ],
      recommendation: ['知识库问答优先RAG']
    },
    relatedTerms: ['RAG', '微调']
  }
}, 'RAG和微调区别')

assert.strictEqual(compare.type, 'compare')
assert.ok(compare.sections.some(item => item.key === 'dimensions'))
assertCopyHasNoUndefined(compare)

const industry = normalizeResultData({
  success: true,
  source: 'llm',
  data: {
    type: 'industry_explain',
    title: '用医生行业解释Agent',
    term: 'Agent',
    summary: 'Agent像会自己推进流程的医生助手。',
    content: {
      industry: '医生行业',
      coreAnswer: 'Agent像会查病历和安排下一步的助手。',
      roleMapping: [
        {
          aiConcept: '工具调用',
          industryRole: '查病历',
          description: '根据目标调用资料。'
        }
      ],
      workflow: ['接收目标', '查资料', '给建议'],
      scenarios: ['智能导诊'],
      safetyBoundaries: ['不能替代医生诊断']
    },
    relatedTerms: ['工具调用']
  }
}, '用医生行业解释Agent')

assert.strictEqual(industry.type, 'industry_explain')
assert.ok(industry.sections.some(item => item.key === 'roleMapping'))
assert.ok(industry.sections.some(item => item.key === 'safetyBoundaries'))
assertCopyHasNoUndefined(industry)

console.log('result normalize ok')
