# AI大白话结果页运行时白屏排查报告

检查时间：2026-07-30

检查目标：定位 `pages/result/result` 在微信开发者工具中正文空白的运行时原因。

本次只做检查并生成文档，未修改任何业务代码。

## 1. result.js 运行链路

### onLoad 参数接收

当前 `pages/result/result.js`：

```js
onLoad(options) {
  const term = decodeURIComponent(options.term || '')
  this.setData({ term })
  wx.setNavigationBarTitle({ title: 'AI大白话' })
  this.loadExplanation(term)
}
```

结论：

- 页面参数读取字段是 `options.term`
- 首页跳转参数也是 `term`
- 参数名一致
- `onLoad` 会调用 `loadExplanation(term)`

首页跳转位置：

```js
wx.navigateTo({
  url: `/pages/result/result?term=${encodeURIComponent(searchText)}`
})
```

结论：首页到结果页的参数链路一致。

### data 初始化

当前初始化：

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

WXML 使用的是 `isLoading`，不是 `loading`。

结论：

- 没有发现 `loading` / `isLoading` 字段名不一致问题。
- 初始状态会显示 loading。

### setData 成功路径

成功拿到接口数据后：

```js
this.setData({
  resultData: viewModel,
  relatedTerms: viewModel.relatedTerms.length ? viewModel.relatedTerms : this.data.relatedTerms,
  isFavorite: isFavoriteTerm(viewModel.favoriteKey),
  isLoading: false
})
```

结论：

- 成功后 `isLoading=false`
- 成功后 `resultData=viewModel`
- 成功后 `errorText` 仍为空字符串
- WXML 的 `wx:elif="{{resultData}}"` 应该命中

### 本地模拟 API 输入结果

本地模拟输入：

```text
API
Token
Phi
Claude
```

结果：

```json
[
  {
    "term": "API",
    "source": "knowledge",
    "success": true,
    "hasResultData": true,
    "title": "API是什么？",
    "summary": true,
    "professionalExplanation": true,
    "currentLifeExample": true,
    "aiExample": true,
    "relatedTerms": 3
  },
  {
    "term": "Token",
    "source": "knowledge",
    "success": true,
    "hasResultData": true,
    "title": "Token是什么？",
    "summary": true,
    "professionalExplanation": true,
    "currentLifeExample": true,
    "aiExample": true,
    "relatedTerms": 3
  },
  {
    "term": "Phi",
    "source": "knowledge",
    "success": true,
    "hasResultData": true,
    "title": "Phi是什么？",
    "summary": true,
    "professionalExplanation": true,
    "currentLifeExample": true,
    "aiExample": true,
    "relatedTerms": 3
  },
  {
    "term": "Claude",
    "source": "knowledge",
    "success": true,
    "hasResultData": true,
    "title": "Claude是什么？",
    "summary": true,
    "professionalExplanation": true,
    "currentLifeExample": true,
    "aiExample": true,
    "relatedTerms": 4
  }
]
```

结论：

- 本地运行时模拟下，`API` 和其他完整词条都能生成可渲染数据。
- 如果微信开发者工具仍然正文空白，问题不在静态数据适配本身。

## 2. 建议临时插入的运行时 console.log

本次没有修改代码。若下一步允许临时调试，可在 `pages/result/result.js` 加以下日志定位真实模拟器数据：

### onLoad 中

```js
console.log('[result:onLoad] options =', options)
console.log('[result:onLoad] keyword =', term)
```

### api.explainTerm 返回后

```js
console.log('[result:loadExplanation] api response =', res)
```

### normalizeResultData 后

```js
console.log('[result:loadExplanation] viewModel =', viewModel)
```

### setData 后

```js
this.setData({
  resultData: viewModel,
  relatedTerms: viewModel.relatedTerms.length ? viewModel.relatedTerms : this.data.relatedTerms,
  isFavorite: isFavoriteTerm(viewModel.favoriteKey),
  isLoading: false
}, () => {
  console.log('[result:loadExplanation] final data =', this.data)
})
```

重点看：

- `options.term` 是否存在
- `term` 是否是 `API`
- `res.success` 是否为 `true`
- `res.data` 是否存在
- `viewModel.title` 是否存在
- `viewModel.professionalExplanation` 是否存在
- `viewModel.currentLifeExample` 是否存在
- `this.data.isLoading` 最终是否为 `false`
- `this.data.errorText` 最终是否为空
- `this.data.resultData` 最终是否存在

## 3. result.wxml 条件与字段检查

当前 WXML 条件链：

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

结论：

- 没有 `wx:if="{{!loading && resultData}}"`。
- 没有 `loading` 字段误用。
- 条件使用的是 `isLoading` 和 `resultData`。

### WXML 实际读取字段

当前 WXML 读取了：

- `resultData.title`
- `resultData.assets.orangeBubble`
- `resultData.assets.robot`
- `resultData.professionalExplanation`
- `resultData.summary`
- `resultData.translation`
- `resultData.translation.english`
- `resultData.translation.chinese`
- `resultData.currentLifeExample`
- `resultData.currentLifeExample.title`
- `resultData.currentLifeExample.content`
- `resultData.canSwitchExample`
- `resultData.lifeExamples.length`
- `resultData.currentExampleIndex`
- `resultData.aiExample`
- `relatedTerms`

这些字段都由 `normalizeResultData()` 生成。

### 空对象风险

如果 `resultData` 是 `{}`：

- `wx:elif="{{resultData}}"` 在小程序里通常会被当作 truthy。
- `title-card` 会显示但标题为空。
- `main-card` 会显示但解释为空。
- `life-card`、`ai-card`、`learn-card` 可能不显示。

但当前 `loadExplanation` 有校验：

```js
if (!viewModel.summary && !viewModel.currentLifeExample && !viewModel.aiExample) {
  throw new Error('暂时没有找到解释，请换一个问题试试')
}
```

结论：

- 正常情况下不应该把纯空对象写入 `resultData`。
- 若模拟器里实际出现空白，必须用上面的 `console.log` 确认运行时 `viewModel` 是否和本地模拟一致。

## 4. WXML 表达式兼容风险

当前 WXML 有以下复杂表达式：

```xml
class="icon-action {{isFavorite ? 'active' : ''}}"
{{isFavorite ? '已收藏' : '收藏'}}
{{resultData.professionalExplanation || resultData.summary}}
wx:if="{{resultData.lifeExamples.length > 1}}"
class="example-dot {{index === resultData.currentExampleIndex ? 'active' : ''}}"
wx:if="{{relatedTerms && relatedTerms.length}}"
```

这些表达式在现代基础库通常可用，但当前项目配置里：

```json
{
  "libVersion": "2.19.4"
}
```

`project.private.config.json` 中是：

```json
{
  "libVersion": "3.17.0"
}
```

风险判断：

- 如果开发者工具实际使用较低基础库或编译缓存异常，复杂 Mustache 表达式可能导致局部渲染异常。
- 但这类问题通常会在控制台出现 WXML 编译或运行警告。
- 当前文件标签数量正常：`<view>` 32 个，`</view>` 32 个；`<text>` 21 个，`</text>` 21 个。

建议下一步在微信开发者工具控制台重点看：

- WXML compile error
- `Cannot read property 'length' of undefined`
- `Cannot read property 'orangeBubble' of undefined`
- `resultData.lifeExamples.length` 相关报错

## 5. 项目路径与入口配置检查

当前工作目录：

```text
C:\Users\Administrator\workbuddy-ai\AI大白话
```

用户要求核对路径：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

两者是同一目录。

### project.config.json

解析结果：

```json
{
  "miniprogramRoot": null,
  "compileType": "miniprogram",
  "projectname": "ai-dabaihua",
  "appid": "wx573e3fb91e268cbd"
}
```

结论：

- `project.config.json` 没有设置 `miniprogramRoot`。
- 小程序根目录就是当前项目根目录。
- 如果微信开发者工具打开的是 `C:/Users/Administrator/workbuddy-ai/AI大白话`，编译入口正确。

### app.json

解析结果：

```json
{
  "pages": [
    "pages/index/index",
    "pages/result/result"
  ],
  "navigationBarTitleText": "AI大白话"
}
```

结论：

- `pages/result/result` 已注册。
- 页面路径不是缺失状态。

### project.private.config.json

解析结果：

```json
{
  "libVersion": "3.17.0",
  "projectname": "ai-dabaihua",
  "setting": {
    "compileHotReLoad": true,
    "ignoreDevUnusedFiles": true,
    "useIsolateContext": true
  }
}
```

结论：

- 私有配置没有改变小程序根目录。
- 没有发现会让开发者工具读取其他目录的配置项。

## 6. 静态资源检查

结果页引用资源存在：

- `assets/home/hero-robot.png`：存在
- `assets/home/hero-woman.png`：存在
- `assets/home/hero-bubble-orange.png`：存在
- `assets/home/hero-bubble-white.png`：存在
- `assets/home/hero-coffee.png`：存在

结论：

- 资源缺失不会导致正文整体空白。
- 即使图片加载失败，文字卡片仍应显示。

## 7. 当前最可能原因排序

### 可能性 1：微信开发者工具缓存或未读取最新编译产物

理由：

- 本地源码和模拟链路都显示 `API` 可渲染。
- 配置入口正确。
- WXML 结构存在。
- CSS 没有隐藏正文。

建议检查：

- 点击“编译”而不是只刷新预览。
- 使用“清缓存并编译”。
- 确认左侧资源管理器中 `pages/result/result.wxml` 内容是当前版本。
- 确认页面路径不是旧打开记录。

### 可能性 2：小程序运行时实际返回数据与本地 Node 模拟不同

理由：

- 本地模拟调用的是同一套 `utils/api.js`，但微信运行时可能因为环境差异走到不同分支或报错。
- 需要通过控制台日志确认。

必须输出的运行时关键值：

```text
[result:onLoad] keyword
[result:loadExplanation] api response
[result:loadExplanation] viewModel
[result:loadExplanation] final data
```

### 可能性 3：WXML 复杂表达式在当前基础库/编译缓存下异常

理由：

- 当前 WXML 使用了 `||`、`&&`、`>`、`===`、三元表达式。
- 正常基础库应支持，但若编译器缓存异常或实际基础库低于配置，可能出现局部渲染问题。

重点排查表达式：

```xml
{{resultData.professionalExplanation || resultData.summary}}
wx:if="{{resultData.lifeExamples.length > 1}}"
class="example-dot {{index === resultData.currentExampleIndex ? 'active' : ''}}"
wx:if="{{relatedTerms && relatedTerms.length}}"
```

## 8. 本次结论

1. `result.js` 参数、接口、数据适配、`setData` 路径静态检查正常。
2. 本地模拟 `API`、`Token`、`Phi`、`Claude` 均能生成完整 `resultData`。
3. `result.wxml` 有实际展示结构，不是空模板。
4. 没有发现 `wx:if="{{!loading && resultData}}"` 这类字段名错误。
5. `project.config.json` 没有 `miniprogramRoot`，项目入口应为当前根目录。
6. `app.json` 已注册 `pages/result/result`。
7. 当前源码状态下，正文空白更像运行时编译缓存、实际数据不一致或 WXML 表达式兼容问题。

## 9. 下一步建议

如果允许临时调试代码，建议只在 `pages/result/result.js` 增加运行时日志，不改业务逻辑：

- `onLoad` 打印 `options` 和 `term`
- `api.explainTerm` 返回后打印 `res`
- `normalizeResultData` 后打印 `viewModel`
- `setData` callback 打印 `this.data`

如果日志显示 `resultData` 正常但页面仍空白，再把 WXML 的复杂表达式临时拆到 JS 数据字段里，降低 WXML 表达式复杂度。

