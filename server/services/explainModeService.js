const SUPPORTED_MODES = ['normal', 'business', 'developer']

function normalizeMode(mode) {
  return SUPPORTED_MODES.indexOf(mode) > -1 ? mode : 'normal'
}

function parseExplainInput(input) {
  if (typeof input === 'string') {
    return {
      keyword: input.trim(),
      mode: 'normal'
    }
  }

  return {
    keyword: String(input && input.keyword ? input.keyword : '').trim(),
    mode: normalizeMode(input && input.mode)
  }
}

module.exports = {
  SUPPORTED_MODES,
  normalizeMode,
  parseExplainInput
}
