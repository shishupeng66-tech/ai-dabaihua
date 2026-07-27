const answerEvaluationModel = {
  id: 'string',
  keyword: 'string',
  mode: 'normal | business | developer',
  score: 'number',
  clarityScore: 'number',
  analogyScore: 'number',
  scenarioScore: 'number',
  accuracyScore: 'number',
  simplicityScore: 'number',
  usefulnessScore: 'number',
  humanScore: 'number',
  promptName: 'string',
  promptVersion: 'string',
  source: 'knowledge | llm',
  createdAt: 'datetime'
}

module.exports = answerEvaluationModel
