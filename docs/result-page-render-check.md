# AI大白话结果页 UI 渲染检查报告

检查时间：2026-07-30

检查范围：

- `pages/result/result.js`
- `pages/result/result.wxml`
- `pages/result/result.wxss`

本次只检查并生成报告，未修改业务代码、页面代码、服务端代码、知识库数据。

## A. 页面有没有真正的展示结构

有。

当前 `pages/result/result.wxml` 已经包含完整的结果页展示结构：

1. Loading 状态
   - `loading-container`
   - `loading-card`

2. 错误状态
   - `error-state`
   - `error-card`

3. 结果内容主体
   - `result-content`

4. 顶部解释标题卡
   - `title-card`
   - 读取字段：`resultData.title`

5. AI一句话解释卡
   - `explain-card main-card`
   - 读取字段：`resultData.professionalExplanation || resultData.summary`
   - 翻译区域读取：`resultData.translation.english`、`resultData.translation.chinese`

6. 生活案例卡
   - `explain-card life-card`
   - 显示条件：`resultData.currentLifeExample`
   - 读取字段：`resultData.currentLifeExample.title`、`resultData.currentLifeExample.content`

7. AI应用卡
   - `explain-card ai-card`
   - 显示条件：`resultData.aiExample`

8. 继续学习相关词
   - `learn-card`
   - 显示条件：`relatedTerms && relatedTerms.length`

9. 兜底空状态
   - `wx:else`
   - 文案：`暂时没有找到解释，请换一个问题试试`

结论：当前源码不是“只有顶部、没有正文结构”的状态；正文 UI 结构确实存在。

## B. result.js 数据链路检查

### 1. onLoad 是否执行

`pages/result/result.js` 当前有 `onLoad(options)`：

```js
onLoad(options) {
  const term = decodeURIComponent(options.term || '')
  this.setData({ term })
  wx.setNavigationBarTitle({ title: 'AI大白话' })
  this.loadExplanation(term)
}
```

结论：

- 页面参数来自 `options.term`
- 会执行 `decodeURIComponent`
- 会写入 `data.term`
- 会调用 `loadExplanation(term)`

### 2. data 初始化

当前初始化字段：

```js
data: {
  term: '',
  isLoading: true,
  resultData: null,
  errorText: '',
  isFavorite: false,
  relatedTerms: DEFAULT_RELATED_TERMS
}
```

### 3. loadExplanation 最终写入字段

`loadExplanation(term)` 成功后会执行：

```js
this.setData({
  resultData: viewModel,
  relatedTerms: viewModel.relatedTerms.length ? viewModel.relatedTerms : this.data.relatedTerms,
  isFavorite: isFavoriteTerm(viewModel.favoriteKey),
  isLoading: false
})
```

结论：

- 正常成功时 `isLoading=false`
- `resultData` 会被设置
- `relatedTerms` 会被设置
- WXML 的 `wx:elif="{{resultData}}"` 应该成立

### 4. API 输入 `API` 的本地链路模拟结果

本地执行 `api.explainTerm('API')` 后，再执行 `normalizeResultData(apiResult, 'API')`，得到：

```json
{
  "apiSuccess": true,
  "source": "knowledge",
  "title": "API是什么？",
  "type": "term_explain",
  "summary": "API就是不同软件之间互相调用功能的约定接口，你按规则发请求，对方就返回对应结果，不用管内部怎么实现。",
  "professionalExplanation": "API就是不同软件之间互相调用功能的约定接口，你按规则发请求，对方就返回对应结果，不用管内部怎么实现。",
  "translation": {
    "english": "Application Programming Interface",
    "chinese": "应用程序编程接口"
  },
  "lifeExamplesLength": 3,
  "currentLifeExample": {
    "title": "银行的ATM机",
    "content": "你去ATM机取钱，不用进银行金库自己拿，插卡输密码按金额，机器就会出钱。你不用管银行内部怎么记账，按操作来就行。总结：API就像软件的ATM机，按约定方式调用就能使用对应的服务。"
  },
  "aiExample": "很多APP里的AI聊天、AI画图功能，不是自己开发的模型，而是通过调用大模型厂商的API接口实现的。",
  "relatedTermsLength": 3
}
```

渲染条件检查结果：

```json
{
  "resultContent": true,
  "mainCardText": true,
  "lifeCard": true,
  "aiCard": true,
  "learnCard": true
}
```

结论：

- `API` 命中知识库
- `resultData` 非空
- 主解释卡有文字
- 生活案例卡有数据
- AI应用卡有数据
- 相关词卡有数据

按当前源码和本地数据链路，`API` 不应该出现正文完全空白。

## C. WXML 条件检查

当前核心条件链：

```xml
<view class="loading-container" wx:if="{{isLoading}}">
...
</view>

<view class="error-state" wx:elif="{{errorText}}">
...
</view>

<view class="result-content" wx:elif="{{resultData}}">
...
</view>

<view class="error-state" wx:else>
...
</view>
```

检查结论：

- 有 `wx:if`
- 有 `wx:elif`
- 有 `wx:else`
- `result-content` 的显示条件是 `resultData`
- 当前 `API` 链路会生成 `resultData`
- 文件中未发现字面量 `undefined`
- 文件中未发现字面量 `null`
- 未发现明显错误的 `</text>` 标签结构

风险点：

1. 如果 `isLoading` 一直为 `true`，正文不会显示。
2. 如果 `errorText` 有值，正文不会显示。
3. 如果 `resultData` 没有被设置，正文不会显示。
4. 如果微信开发者工具缓存了旧版 WXML，可能出现源码已修复但预览仍空白。

当前本地模拟显示第 1、2、3 点在 `API` 输入下都不成立。

## D. 新版字段和 WXML 读取是否一致

新版字段支持情况：

| 字段 | result.js 是否生成 | WXML 是否读取 | 状态 |
| --- | --- | --- | --- |
| `term` | 是 | 间接用于标题 | 正常 |
| `translation` | 是 | 是 | 正常 |
| `professionalExplanation` | 是 | 是 | 正常 |
| `lifeExamples` | 是 | 是 | 正常 |
| `currentLifeExample` | 是 | 是 | 正常 |
| `aiExample` | 是 | 是 | 正常 |
| `relatedTerms` | 是 | 是 | 正常 |

结论：

- 当前字段映射是对齐的。
- `result.js` 已经把 `lifeExamples` 转成当前展示用的 `currentLifeExample`。
- `result.wxml` 没有直接依赖不存在的新字段。

## E. WXSS 是否把正文隐藏

检查 `pages/result/result.wxss`：

- `.result-content` 只设置了淡入动画，没有 `display: none`
- `.explain-card`、`.learn-card` 有 `margin-top`、`padding`、背景色、阴影
- `.main-answer` 有 `display: block`
- 没有发现把主体区域设置为 `opacity: 0`、`visibility: hidden`、`height: 0` 的全局样式

结论：

- 当前 CSS 没有明显把正文隐藏的规则。
- 正文空白不太像 WXSS 主动隐藏造成。

## F. 白屏原因判断

基于当前文件检查和 `API` 本地链路模拟，结论如下：

### 当前源码层面

没有发现会导致 `API` 结果页正文完全空白的确定性代码问题。

`API` 的数据、适配层、WXML 条件、WXSS 显示结构都满足渲染要求。

### 与用户现象冲突点

用户看到“顶部正常，正文区域完全空白”，但当前源码模拟结果显示：

- `resultData` 已生成
- `main-card` 应该显示
- `life-card` 应该显示
- `ai-card` 应该显示
- `learn-card` 应该显示

这说明当前现象更可能来自以下情况：

1. 微信开发者工具仍在运行旧缓存或旧编译产物。
2. 预览时没有重新编译最新 `pages/result/result.wxml`。
3. 当前打开的项目目录和实际修改目录不一致。
4. 真机或模拟器中实际返回的数据和本地 Node 模拟返回不一致。
5. 若正文只显示标题卡，可能是旧版 WXML 中卡片结构或闭合标签曾经损坏，开发者工具仍未刷新。

## G. 需要修改哪些文件

本次不修改代码。

如果后续确认微信开发者工具清缓存、重新编译后仍然复现，建议只检查或修改以下文件：

1. `pages/result/result.js`
   - 在 `loadExplanation` 成功后临时打印 `viewModel`
   - 确认小程序运行时实际 `resultData` 是否和本地模拟一致

2. `pages/result/result.wxml`
   - 检查 `wx:if / wx:elif / wx:else` 链是否被开发者工具正确编译
   - 必要时把 `wx:elif="{{resultData}}"` 改成更明确的 `wx:elif="{{resultData && resultData.title}}"`
   - 必要时给主解释卡增加字段兜底，避免数据为空时卡片没有正文

3. `pages/result/result.wxss`
   - 若数据正常但页面仍不显示，再检查是否存在运行时样式覆盖

不建议修改：

- `server/`
- `config/`
- `database/`
- `utils/api.js`
- `data/knowledge/terms.json`

当前问题从检查结果看，不是后端解释链路或知识库命中链路导致。

## H. 检查结论

1. 页面有真正的展示结构。
2. `API` 数据链路本地验证正常。
3. 新版字段和 WXML 读取字段一致。
4. CSS 没有明显隐藏正文。
5. 当前源码状态下，`API` 不应该白屏。
6. 用户看到的白屏更可能是微信开发者工具缓存、编译未刷新、打开目录不一致，或小程序运行时实际返回数据不同。

