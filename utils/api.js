// api.js - API封装层

const mockData = require('./mockData.js')

/**
 * 获取术语解释
 * @param {string} term - 要查询的术语
 * @returns {Promise<Object>} 解释结果
 */
function explainTerm(term) {
  if (!term || !term.trim()) {
    return Promise.reject(new Error('请输入要查询的术语'))
  }
  
  return mockData.mockExplainTerm(term)
}

/**
 * 获取热门词汇
 * @returns {Promise<Array>} 热门词汇列表
 */
function getHotTerms() {
  return Promise.resolve({
    success: true,
    data: mockData.HOT_TERMS
  })
}

/**
 * 获取每日一词
 * @returns {Promise<Object>} 每日一词
 */
function getDailyWord() {
  // 根据日期选择当日词汇
  const today = new Date()
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  )
  const index = dayOfYear % mockData.DAILY_WORDS.length
  
  return Promise.resolve({
    success: true,
    data: mockData.DAILY_WORDS[index]
  })
}

module.exports = {
  explainTerm,
  getHotTerms,
  getDailyWord
}
