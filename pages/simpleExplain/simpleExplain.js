const api = require('../../utils/api.js')

const EMPTY_TEXT = '暂时没有找到更简单的解释，请换一个词试试'

function compactList(items) {
  return Array.isArray(items)
    ? items.filter(item => item !== undefined && item !== null && String(item).trim())
    : []
}

function firstText() {
  const values = Array.prototype.slice.call(arguments)
  const value = values.find(item => item !== undefined && item !== null && String(item).trim())
  return value ? String(value).trim() : ''
}

function getContent(data) {
  return data && data.content && typeof data.content === 'object' ? data.content : {}
}

function normalizeLifeExamples(data, content) {
  const source = Array.isArray(data.lifeExamples)
    ? data.lifeExamples
    : (data.lifeExample && typeof data.lifeExample === 'object' ? [data.lifeExample] : [])

  const normalized = source
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      title: firstText(item.title, item.type, '一个小例子'),
      content: firstText(item.content, item.detail, item.description)
    }))
    .filter(item => item.title || item.content)

  if (normalized.length) return normalized

  return compactList(content.examples || data.examples).map((item, index) => ({
    title: `小例子 ${index + 1}`,
    content: String(item)
  }))
}

function getChildFriendlyNote(data, keyword) {
  const content = getContent(data)
  return firstText(
    data.childExplanation,
    data.childFriendlyExplanation,
    data.sixYearOldExplanation,
    data.simpleLongExplanation,
    content.childExplanation,
    content.childFriendlyExplanation,
    content.sixYearOldExplanation,
    content.simpleLongExplanation
  )
}

function buildAvoidExampleText(data) {
  const examples = normalizeLifeExamples(data || {}, getContent(data || {}))
  return examples
    .map(item => compactList([item.title, item.content]).join('：'))
    .filter(Boolean)
    .slice(0, 5)
    .join('\n')
}

function buildFreshStory(term, summary) {
  return [
    `想象一个小朋友在搭积木城堡。桌上有很多块积木，但它们不是乱放的，每一块都有自己的位置。`,
    `小朋友不需要知道积木是怎么生产出来的，也不需要背很难的说明书。他只要知道：这一块可以接在这里，那一块可以帮城堡变高。`,
    `“${term}”也可以先这样理解：它不是让你背一个复杂定义，而是AI世界里一块有用的积木。`,
    summary ? `如果换成人话，它大概就是：${summary}` : '',
    `所以你看到“${term}”时，可以先别紧张。先问自己一句：这块“积木”在帮AI完成什么事？这样就容易懂多了。`
  ].filter(Boolean).join('\n\n')
}

function buildFallbackNote(data, keyword) {
  const content = getContent(data)
  const term = firstText(data.term, keyword)
  const summary = firstText(
    data.professionalExplanation,
    data.summary,
    data.explanation,
    content.oneSentence,
    content.coreAnswer
  )
  const aiExample = firstText(data.aiExample, data.usage, content.importance)

  return compactList([
    buildFreshStory(term, summary),
    aiExample ? `放到AI产品里，它通常会变成这样的作用：${aiExample}` : '',
    `一句话记住：${term}不是考试题，它只是帮你看懂AI怎么工作的一个小线索。`
  ]).join('\n\n')
}

function buildGeneratedPrompt(keyword, sourceData) {
  const avoidExamples = buildAvoidExampleText(sourceData)
  return compactList([
    `请用六岁小孩都能听懂的方式解释“${keyword}”。`,
    '只输出一段长文解释，不要标题，不要列表。',
    '要求用一个完整的生活小故事说明：发生了什么、它和这个概念哪里像、最后一句话总结。',
    '不要使用专业术语；如果必须用，马上用人话解释。',
    '不要复用用户已经看过的例子，也不要换个说法重复同一个场景。',
    avoidExamples ? `下面这些是用户已经看过的例子，禁止使用相同或相近场景：\n${avoidExamples}` : ''
  ]).join('\n')
}

function pickNoteFromResult(res, keyword, fallbackData) {
  const data = res && res.data ? res.data : {}
  const childNote = getChildFriendlyNote(data, keyword)
  if (childNote) return childNote

  if (res && res.source === 'llm') {
    return firstText(data.summary, data.explanation, data.professionalExplanation, buildFallbackNote(fallbackData || data, keyword))
  }

  return buildFallbackNote(fallbackData || data, keyword)
}

Page({
  data: {
    term: '',
    title: '',
    note: '',
    isLoading: true,
    errorText: ''
  },

  onLoad(options) {
    const term = decodeURIComponent(options.term || '')
    this.setData({
      term,
      title: term ? `${term}，换个更简单的说法` : '换个更简单的说法'
    })
    wx.setNavigationBarTitle({ title: 'AI大白话' })
    this.loadSimpleExplanation(term)
  },

  loadSimpleExplanation(term) {
    if (!term || term.trim().length < 2) {
      this.setData({
        isLoading: false,
        errorText: EMPTY_TEXT
      })
      return
    }

    this.setData({
      isLoading: true,
      errorText: '',
      note: ''
    })

    api.explainTerm(term)
      .then(res => {
        const sourceData = res && res.data ? res.data : {}
        const directNote = getChildFriendlyNote(sourceData, term)
        if (directNote) {
          return {
            note: directNote,
            usedGenerated: false
          }
        }

        return api.request({
          method: 'POST',
          url: '/api/explain',
          data: {
            keyword: buildGeneratedPrompt(term, sourceData)
          }
        }).then(generatedRes => ({
          note: pickNoteFromResult(generatedRes, term, sourceData),
          usedGenerated: generatedRes && generatedRes.source === 'llm'
        })).catch(() => ({
          note: buildFallbackNote(sourceData, term),
          usedGenerated: false
        }))
      })
      .then(result => {
        if (!result || !result.note) {
          throw new Error(EMPTY_TEXT)
        }

        this.setData({
          note: result.note,
          isLoading: false,
          errorText: ''
        })
      })
      .catch(err => {
        this.setData({
          isLoading: false,
          errorText: err && err.message ? err.message : EMPTY_TEXT
        })
      })
  }
})

if (typeof module !== 'undefined') {
  module.exports = {
    getChildFriendlyNote,
    buildAvoidExampleText,
    buildFallbackNote,
    buildGeneratedPrompt,
    pickNoteFromResult
  }
}
