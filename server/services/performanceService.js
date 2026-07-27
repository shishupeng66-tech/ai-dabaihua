const metrics = {
  api: [],
  hunyuan: [],
  knowledge: [],
  database: []
}

function recordMetric(type, payload) {
  const bucket = metrics[type]
  if (!bucket) {
    throw new Error(`未知性能指标类型：${type}`)
  }

  const record = {
    name: payload && payload.name ? payload.name : '',
    duration: payload && typeof payload.duration === 'number' ? payload.duration : 0,
    requestId: payload && payload.requestId ? payload.requestId : '',
    createdAt: new Date().toISOString()
  }

  bucket.unshift(record)
  return record
}

function average(records) {
  if (!records.length) return 0
  return Number((records.reduce((sum, item) => sum + item.duration, 0) / records.length).toFixed(1))
}

function getPerformanceStats() {
  return {
    api: {
      count: metrics.api.length,
      averageDuration: average(metrics.api)
    },
    hunyuan: {
      count: metrics.hunyuan.length,
      averageDuration: average(metrics.hunyuan)
    },
    knowledge: {
      count: metrics.knowledge.length,
      averageDuration: average(metrics.knowledge)
    },
    database: {
      count: metrics.database.length,
      averageDuration: average(metrics.database)
    }
  }
}

function measure(type, name, fn, requestId) {
  const start = Date.now()

  try {
    const result = fn()

    if (result && typeof result.then === 'function') {
      return result.finally(() => {
        recordMetric(type, {
          name,
          requestId,
          duration: Date.now() - start
        })
      })
    }

    recordMetric(type, {
      name,
      requestId,
      duration: Date.now() - start
    })
    return result
  } catch (err) {
    recordMetric(type, {
      name,
      requestId,
      duration: Date.now() - start
    })
    throw err
  }
}

module.exports = {
  recordMetric,
  getPerformanceStats,
  measure
}
