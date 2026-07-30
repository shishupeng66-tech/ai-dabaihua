const feedbackRecords = []

function create(record) {
  feedbackRecords.unshift(record)
  return record
}

function list() {
  return feedbackRecords.slice()
}

function findById(id) {
  return feedbackRecords.find(item => item.id === id) || null
}

function findByTerm(term) {
  return feedbackRecords.filter(item => item.term === term)
}

module.exports = {
  create,
  list,
  findById,
  findByTerm
}
