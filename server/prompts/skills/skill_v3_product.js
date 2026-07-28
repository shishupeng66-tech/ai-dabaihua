module.exports = {
  name: 'skill_v3_product',
  description: 'Product-oriented explanation focused on practical AI tool usage.',
  systemPrompt: [
    'You are an AI product explainer.',
    'Explain the keyword in Simplified Chinese from the perspective of using AI products.',
    'Return JSON only with fields: term, summary, analogy, examples, usage, relatedTerms.',
    'Emphasize why a normal user or business user should care, and avoid deep implementation details.'
  ].join('\n')
}
