const pending = require('../../utils/pending.js')
const exportKnowledge = require('../../utils/exportKnowledge.js')

Page({
  data: {
    items: []
  },

  onLoad() {
    this.refreshItems()
  },

  refreshItems() {
    this.setData({
      items: this.formatItems(pending.getPendingItems())
    })
  },

  formatItems(items) {
    return items.map(item => Object.assign({}, item, {
      draftText: JSON.stringify(item.draft || {}, null, 2),
      isEditing: false
    }))
  },

  onGenerateAllTap() {
    wx.showLoading({ title: '生成中' })

    pending.generateDraftsForPendingItems()
      .then(items => {
        this.setData({ items: this.formatItems(items) })
        wx.hideLoading()
      })
      .catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: err && err.message ? err.message : '生成失败',
          icon: 'none'
        })
      })
  },

  onApproveTap(e) {
    const id = e.currentTarget.dataset.id
    pending.updatePendingItem(id, {
      status: 'approved'
    })
    this.refreshItems()
  },

  onEditTap(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.items.find(item => item.id === id)

    if (!item) return

    if (!item.isEditing) {
      this.setData({
        items: this.data.items.map(current => Object.assign({}, current, {
          isEditing: current.id === id
        }))
      })
      return
    }

    try {
      const draft = JSON.parse(item.draftText || '{}')
      pending.updatePendingItem(id, {
        draft
      })
      this.refreshItems()
    } catch (err) {
      wx.showToast({
        title: '草稿JSON格式错误',
        icon: 'none'
      })
    }
  },

  onDraftInput(e) {
    const id = e.currentTarget.dataset.id
    const draftText = e.detail.value

    this.setData({
      items: this.data.items.map(item => {
        if (item.id !== id) return item
        return Object.assign({}, item, { draftText })
      })
    })
  },

  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id
    pending.removePendingItem(id)
    this.refreshItems()
  },

  onExportTap() {
    wx.setClipboardData({
      data: exportKnowledge.exportKnowledgeJSON(),
      success: () => {
        wx.showToast({
          title: '已复制JSON',
          icon: 'success'
        })
      }
    })
  }
})
