// constant.js - 常量配置

// 存储key
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'search_history',
  FAVORITE_TERMS: 'favorite_terms'
}

// 最大历史记录数
export const MAX_HISTORY_COUNT = 20

// 最大收藏数
export const MAX_FAVORITE_COUNT = 100

// 防抖延迟（毫秒）
export const DEBOUNCE_DELAY = 300

// 搜索节流时间（毫秒）
export const SEARCH_THROTTLE = 1000

// AI提示词模板（供参考，实际在云函数中使用）
export const AI_PROMPT_TEMPLATE = `
请用大白话解释以下AI相关术语，不要使用专业术语，让普通人也能听懂。
术语：{term}

请按照以下JSON格式返回：
{
  "explanation": "这里是大白话解释，100-200字",
  "examples": ["例子1", "例子2", "例子3"]
}
`
