const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const importsDir = path.join(projectRoot, 'data', 'knowledge', 'imports');
const termsPath = path.join(projectRoot, 'data', 'knowledge', 'terms.json');
const reportPath = path.join(projectRoot, 'docs', 'knowledge-import-report.md');
const includeTestFile = process.argv.includes('--include-test');

const requiredFields = [
  'id',
  'term',
  'aliases',
  'category',
  'priority',
  'translation',
  'professionalExplanation',
  'lifeExamples',
  'aiExample',
  'relatedTerms',
];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function normalizeTerm(term) {
  return String(term || '').trim().toLowerCase();
}

function createBaseId(term) {
  const baseId = String(term || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return baseId || 'term';
}

function createUniqueId(term, usedIds) {
  const baseId = createBaseId(term);
  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

function applyCompatibilityDefaults(entry, usedIds) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return entry;
  }

  if (!Object.prototype.hasOwnProperty.call(entry, 'priority') || !hasValue(entry.priority)) {
    entry.priority = 'P0';
  }

  if (!Object.prototype.hasOwnProperty.call(entry, 'aliases') || entry.aliases === null || entry.aliases === undefined) {
    entry.aliases = [];
  }

  if (!Object.prototype.hasOwnProperty.call(entry, 'relatedTerms') || entry.relatedTerms === null || entry.relatedTerms === undefined) {
    entry.relatedTerms = [];
  }

  if (!Object.prototype.hasOwnProperty.call(entry, 'category') || !hasValue(entry.category)) {
    entry.category = '未分类';
  }

  if (!Object.prototype.hasOwnProperty.call(entry, 'id') || !hasValue(entry.id)) {
    entry.id = createUniqueId(entry.term, usedIds);
  } else {
    let id = String(entry.id).trim();
    if (usedIds.has(id)) {
      id = createUniqueId(id, usedIds);
    } else {
      usedIds.add(id);
    }
    entry.id = id;
  }

  return entry;
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function validateEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return ['词条不是对象'];
  }

  const errors = [];
  for (const field of requiredFields) {
    const allowsEmptyArray = field === 'aliases' || field === 'relatedTerms';
    const exists = Object.prototype.hasOwnProperty.call(entry, field);
    const validValue = allowsEmptyArray
      ? Array.isArray(entry[field])
      : hasValue(entry[field]);

    if (!exists || !validValue) {
      errors.push(`缺失字段 ${field}`);
    }
  }

  if (!entry.translation || typeof entry.translation !== 'object' || Array.isArray(entry.translation)) {
    errors.push('translation 必须是对象');
  }

  if (!Array.isArray(entry.lifeExamples)) {
    errors.push('lifeExamples 必须是数组');
  }

  if (!Array.isArray(entry.aliases)) {
    errors.push('aliases 必须是数组');
  }

  if (!Array.isArray(entry.relatedTerms)) {
    errors.push('relatedTerms 必须是数组');
  }

  return errors;
}

function qualityScore(entry) {
  const explanationLength = String(entry.professionalExplanation || '').trim().length;
  const lifeExampleCount = Array.isArray(entry.lifeExamples) ? entry.lifeExamples.length : 0;
  const aiExampleScore = String(entry.aiExample || '').trim().length > 0 ? 1000 : 0;

  return explanationLength + lifeExampleCount * 100 + aiExampleScore;
}

function findImportFiles() {
  if (!fs.existsSync(importsDir)) return [];

  return fs.readdirSync(importsDir)
    .filter((fileName) => {
      if (/^batch.*\.json$/i.test(fileName)) return true;
      return includeTestFile && fileName === 'test.json';
    })
    .sort((a, b) => a.localeCompare(b, 'en'));
}

function createReport(summary, fileResults, failures) {
  const lines = [
    '# 知识库导入报告',
    '',
    '导入文件：',
    '',
    fileResults.length === 0
      ? '无'
      : fileResults.map((item) => `- ${item.fileName}：${item.status}，读取 ${item.total} 条，可导入 ${item.valid} 条，失败 ${item.failed} 条`).join('\n'),
    '',
    '原词条数量：',
    '',
    String(summary.originalCount),
    '',
    '新增：',
    '',
    String(summary.addedCount),
    '',
    '重复：',
    '',
    String(summary.duplicateCount),
    '',
    '失败：',
    '',
    String(summary.failedCount),
    '',
    '最终词条数量：',
    '',
    String(summary.finalCount),
    '',
    '## 失败详情',
    '',
    failures.length === 0
      ? '无'
      : failures.map((item) => `- ${item.fileName} 第 ${item.index + 1} 条：${item.errors.join('；')}`).join('\n'),
    '',
  ];

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  const currentTerms = readJson(termsPath);
  if (!Array.isArray(currentTerms)) {
    throw new Error('data/knowledge/terms.json 必须是 JSON 数组');
  }

  const importFiles = findImportFiles();
  const fileResults = [];
  const failures = [];
  const termsByName = new Map();
  const order = [];
  const usedIds = new Set();
  let duplicateCount = 0;
  let addedCount = 0;
  let validImportCount = 0;
  let failedCount = 0;

  for (const entry of currentTerms) {
    const key = normalizeTerm(entry.term);
    if (!key) continue;
    if (hasValue(entry.id)) usedIds.add(String(entry.id).trim());
    if (!termsByName.has(key)) order.push(key);
    termsByName.set(key, entry);
  }

  for (const fileName of importFiles) {
    const filePath = path.join(importsDir, fileName);
    let data;

    try {
      data = readJson(filePath);
      if (!Array.isArray(data)) {
        throw new Error('文件内容必须是 JSON 数组');
      }
    } catch (error) {
      fileResults.push({ fileName, status: 'ERROR', total: 0, valid: 0, failed: 1 });
      failures.push({ fileName, index: 0, errors: [error.message] });
      failedCount += 1;
      continue;
    }

    let valid = 0;
    let failed = 0;

    for (const [index, entry] of data.entries()) {
      const normalizedEntry = applyCompatibilityDefaults(entry, usedIds);
      const errors = validateEntry(normalizedEntry);
      const key = normalizeTerm(normalizedEntry && normalizedEntry.term);
      if (!key) errors.push('term 不能为空');

      if (errors.length > 0) {
        failures.push({ fileName, index, errors });
        failed += 1;
        failedCount += 1;
        continue;
      }

      valid += 1;
      validImportCount += 1;

      if (!termsByName.has(key)) {
        termsByName.set(key, normalizedEntry);
        order.push(key);
        addedCount += 1;
        continue;
      }

      duplicateCount += 1;
      const current = termsByName.get(key);
      if (qualityScore(normalizedEntry) > qualityScore(current)) {
        termsByName.set(key, normalizedEntry);
      }
    }

    fileResults.push({ fileName, status: 'OK', total: data.length, valid, failed });
  }

  const mergedTerms = order.map((key) => termsByName.get(key));
  writeJson(termsPath, mergedTerms);
  JSON.parse(readText(termsPath));

  const summary = {
    originalCount: currentTerms.length,
    addedCount,
    duplicateCount,
    failedCount,
    finalCount: mergedTerms.length,
    validImportCount,
  };

  createReport(summary, fileResults, failures);

  console.log('知识库导入完成');
  console.log(`导入文件: ${importFiles.length}`);
  console.log(`原词条数量: ${summary.originalCount}`);
  console.log(`可导入词条: ${summary.validImportCount}`);
  console.log(`新增: ${summary.addedCount}`);
  console.log(`重复: ${summary.duplicateCount}`);
  console.log(`失败: ${summary.failedCount}`);
  console.log(`最终词条数量: ${summary.finalCount}`);
  console.log(`报告路径: ${reportPath}`);
  console.log('JSON有效: 是');
}

main();
