// storage.js - 本地存储封装

/**
 * 获取存储数据
 * @param {string} key - 存储key
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的数据
 */
export function get(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (e) {
    console.error('获取存储失败:', e)
    return defaultValue
  }
}

/**
 * 保存数据到存储
 * @param {string} key - 存储key
 * @param {*} value - 要存储的数据
 * @returns {boolean} 是否成功
 */
export function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    console.error('保存存储失败:', e)
    return false
  }
}

/**
 * 删除存储数据
 * @param {string} key - 存储key
 * @returns {boolean} 是否成功
 */
export function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除存储失败:', e)
    return false
  }
}

/**
 * 清空所有存储数据
 * @returns {boolean} 是否成功
 */
export function clear() {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('清空存储失败:', e)
    return false
  }
}

/**
 * 添加到数组（如果不存在）
 * @param {string} key - 存储key
 * @param {*} item - 要添加的项
 * @param {number} maxCount - 最大数量
 * @param {string} uniqueKey - 去重的字段名
 */
export function addToArray(key, item, maxCount = 20, uniqueKey = null) {
  const arr = get(key, [])
  
  // 去重
  if (uniqueKey) {
    const index = arr.findIndex(i => i[uniqueKey] === item[uniqueKey])
    if (index > -1) {
      arr.splice(index, 1)
    }
  }
  
  // 添加到开头
  arr.unshift(item)
  
  // 限制最大数量
  if (arr.length > maxCount) {
    arr.splice(maxCount)
  }
  
  set(key, arr)
  return arr
}

/**
 * 从数组中移除
 * @param {string} key - 存储key
 * @param {*} value - 要移除的值
 * @param {string} compareKey - 比较的字段名
 */
export function removeFromArray(key, value, compareKey = null) {
  const arr = get(key, [])
  const newArr = compareKey 
    ? arr.filter(item => item[compareKey] !== value)
    : arr.filter(item => item !== value)
  set(key, newArr)
  return newArr
}

/**
 * 检查数组中是否存在
 * @param {string} key - 存储key
 * @param {*} value - 要检查的值
 * @param {string} compareKey - 比较的字段名
 */
export function existsInArray(key, value, compareKey = null) {
  const arr = get(key, [])
  return compareKey
    ? arr.some(item => item[compareKey] === value)
    : arr.includes(value)
}
