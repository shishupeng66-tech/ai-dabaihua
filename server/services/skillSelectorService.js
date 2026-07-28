const fs = require('fs')
const path = require('path')

const PRODUCTION_PROMPT_DIR = path.join(__dirname, '..', 'prompts', 'production')

const SKILL_MAP = {
  term_explain: 'termExplainSkill.md',
  principle_explain: 'principleExplainSkill.md',
  industry_explain: 'industryExplainSkill.md',
  compare_explain: 'compareExplainSkill.md',
  value_explain: 'valueExplainSkill.md',
  learning_plan: 'learningPlanSkill.md'
}

function readPromptFile(filename) {
  return fs.readFileSync(path.join(PRODUCTION_PROMPT_DIR, filename), 'utf8')
}

function selectSkill(intent) {
  const normalizedIntent = String(intent || '').trim()
  const filename = SKILL_MAP[normalizedIntent] || SKILL_MAP.term_explain
  const basePrompt = readPromptFile('baseSkill.md')
  const skillPrompt = readPromptFile(filename)

  return {
    intent: SKILL_MAP[normalizedIntent] ? normalizedIntent : 'term_explain',
    skillName: filename.replace(/\.md$/, ''),
    prompt: `${basePrompt}\n\n---\n\n${skillPrompt}`
  }
}

module.exports = {
  selectSkill,
  SKILL_MAP
}
