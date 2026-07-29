const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const termsPath = path.join(projectRoot, 'data', 'knowledge', 'terms.json');
const reportPath = path.join(projectRoot, 'docs', 'knowledge-quality-report-v1.md');

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

const riskTerms = [
  'Transformer',
  'Neural Network',
  'Architecture',
  'Framework',
  'Protocol',
  'Algorithm',
  'API',
  'Database',
];

function readJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(content);
}

function textLength(value) {
  return String(value || '').trim().length;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isEnglishTerm(term) {
  const value = String(term || '').trim();
  return /[A-Za-z]/.test(value) && /^[A-Za-z0-9\s+.#/_-]+$/.test(value);
}

function normalizeTerm(term) {
  return String(term || '').trim().toLowerCase();
}

function countRiskTerms(text) {
  const value = String(text || '');
  return riskTerms.reduce((count, term) => {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    return count + (value.match(pattern) || []).length;
  }, 0);
}

function formatList(items, emptyText = '无') {
  if (items.length === 0) return emptyText;
  return items.map((item) => `- ${item}`).join('\n');
}

function scoreByIssueCount(maxScore, total, issueCount) {
  if (total === 0) return 0;
  const validCount = Math.max(0, total - issueCount);
  return Math.floor((validCount / total) * maxScore);
}

function main() {
  const terms = readJson(termsPath);
  if (!Array.isArray(terms)) {
    throw new Error('data/knowledge/terms.json must be a JSON array');
  }

  const missingFieldIssues = [];
  const translationIssues = [];
  const explanationIssues = [];
  const lifeExampleIssues = [];
  const plainLanguageRisks = [];
  const duplicateTerms = [];
  const relatedTermIssues = [];
  const seenTerms = new Map();

  for (const [index, entry] of terms.entries()) {
    const label = entry && entry.term ? entry.term : `#${index + 1}`;

    const missingFields = requiredFields.filter((field) => !Object.prototype.hasOwnProperty.call(entry, field));
    if (missingFields.length > 0) {
      missingFieldIssues.push(`${label}：缺失 ${missingFields.join(', ')}`);
    }

    const translation = entry.translation;
    if (
      isEnglishTerm(entry.term) &&
      (!isPlainObject(translation) || textLength(translation.chinese) === 0)
    ) {
      translationIssues.push(`${label}：英文 term 缺少中文翻译`);
    }

    const explanationLength = textLength(entry.professionalExplanation);
    if (explanationLength === 0) {
      explanationIssues.push(`${label}：专业解释为空`);
    } else if (explanationLength < 20) {
      explanationIssues.push(`${label}：专业解释过短（${explanationLength}字）`);
    } else if (explanationLength > 120) {
      explanationIssues.push(`${label}：专业解释过长（${explanationLength}字）`);
    }

    const lifeExamples = Array.isArray(entry.lifeExamples) ? entry.lifeExamples : [];
    if (lifeExamples.length < 3) {
      lifeExampleIssues.push(`${label}：生活案例少于3个（当前 ${lifeExamples.length} 个）`);
    }

    for (const [exampleIndex, example] of lifeExamples.entries()) {
      const exampleNo = exampleIndex + 1;
      if (!example || textLength(example.title) === 0) {
        lifeExampleIssues.push(`${label}：第 ${exampleNo} 个案例缺少 title`);
      }
      const contentLength = textLength(example && example.content);
      if (contentLength === 0) {
        lifeExampleIssues.push(`${label}：第 ${exampleNo} 个案例内容为空`);
      } else if (contentLength < 50) {
        lifeExampleIssues.push(`${label}：第 ${exampleNo} 个案例过短（${contentLength}字）`);
      } else if (contentLength > 300) {
        lifeExampleIssues.push(`${label}：第 ${exampleNo} 个案例过长（${contentLength}字）`);
      }
    }

    const riskCount = countRiskTerms(entry.professionalExplanation)
      + lifeExamples.reduce((sum, example) => sum + countRiskTerms(example && example.content), 0);
    if (riskCount >= 3) {
      plainLanguageRisks.push(`${label}：可能不够大白话，技术词出现 ${riskCount} 次`);
    }

    const normalizedTerm = normalizeTerm(entry.term);
    if (normalizedTerm) {
      if (seenTerms.has(normalizedTerm)) {
        duplicateTerms.push(`${seenTerms.get(normalizedTerm)} / ${label}`);
      } else {
        seenTerms.set(normalizedTerm, label);
      }
    }

    if (!Array.isArray(entry.relatedTerms) || entry.relatedTerms.length === 0) {
      relatedTermIssues.push(`${label}：relatedTerms 为空或不是数组`);
    }
  }

  const total = terms.length;
  const fieldScore = scoreByIssueCount(30, total, missingFieldIssues.length);
  const translationScore = scoreByIssueCount(20, total, translationIssues.length);
  const explanationScore = scoreByIssueCount(20, total, explanationIssues.length);
  const lifeExampleScore = scoreByIssueCount(25, total, lifeExampleIssues.length);
  const relatedTermsScore = scoreByIssueCount(5, total, relatedTermIssues.length);
  const totalScore = fieldScore + translationScore + explanationScore + lifeExampleScore + relatedTermsScore;

  const fieldStatus = missingFieldIssues.length === 0 ? '通过' : `异常（${missingFieldIssues.length}项）`;
  const translationStatus = translationIssues.length === 0 ? '通过' : `异常（${translationIssues.length}项）`;

  const report = [
    '# AI大白话知识库质量检查报告',
    '',
    '## 总词条数量',
    '',
    String(total),
    '',
    '## 字段完整性',
    '',
    fieldStatus,
    '',
    `缺失字段数量：${missingFieldIssues.length}`,
    '',
    formatList(missingFieldIssues),
    '',
    '## 翻译完整性',
    '',
    translationStatus,
    '',
    `翻译缺失数量：${translationIssues.length}`,
    '',
    formatList(translationIssues),
    '',
    '## 专业解释问题',
    '',
    formatList(explanationIssues),
    '',
    '## 生活案例问题',
    '',
    formatList(lifeExampleIssues),
    '',
    '## 大白话风险词条',
    '',
    formatList(plainLanguageRisks),
    '',
    '## 重复词条',
    '',
    formatList(duplicateTerms),
    '',
    '## 总体评分',
    '',
    `${totalScore}/100`,
    '',
    '| 项目 | 分值 | 得分 |',
    '| --- | ---: | ---: |',
    `| 字段完整 | 30 | ${fieldScore} |`,
    `| 翻译完整 | 20 | ${translationScore} |`,
    `| 专业解释 | 20 | ${explanationScore} |`,
    `| 生活案例 | 25 | ${lifeExampleScore} |`,
    `| 相关词 | 5 | ${relatedTermsScore} |`,
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report, 'utf8');

  console.log('AI大白话知识库质量检查完成');
  console.log(`总词条数量: ${total}`);
  console.log(`字段完整性: ${fieldStatus}`);
  console.log(`翻译完整性: ${translationStatus}`);
  console.log(`专业解释问题: ${explanationIssues.length}`);
  console.log(`生活案例问题: ${lifeExampleIssues.length}`);
  console.log(`大白话风险词条: ${plainLanguageRisks.length}`);
  console.log(`重复词条: ${duplicateTerms.length}`);
  console.log(`报告路径: ${reportPath}`);
  console.log(`总评分: ${totalScore}/100`);
}

main();
