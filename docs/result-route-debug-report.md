# AI大白话 result 页面 not-found 路由排查报告

检查时间：2026-07-30

现象：

微信开发者工具进入结果页后，WXML 面板显示：

```html
<body id="wx://not-found"></body>
```

这说明运行时没有加载到真实的 `pages/result/result` 页面模板，而是进入了小程序框架的 not-found 页面。

本次只检查并生成报告，未修改任何代码。

## 1. app.json 注册情况

检查文件：`app.json`

解析结果：

```json
{
  "pages": [
    "pages/index/index",
    "pages/result/result"
  ],
  "hasResultPage": true,
  "resultPageIndex": 1,
  "rawResultEntry": "pages/result/result"
}
```

结论：

- `pages/result/result` 已注册。
- 注册路径没有多余空格。
- 注册路径大小写为全小写：`pages/result/result`。
- 路由注册本身没有发现问题。

## 2. 首页跳转代码

检查文件：`pages/index/index.js`

搜索按钮点击事件当前使用：

```js
wx.navigateTo({
  url: `/pages/result/result?term=${encodeURIComponent(searchText)}`
})
```

结论：

- 首页使用的是 `wx.navigateTo`。
- 跳转路径是 `/pages/result/result?term=xxx`。
- 路径和 `app.json` 注册页 `pages/result/result` 对应。
- query 参数名是 `term`。

结果页 `onLoad` 读取的也是：

```js
const term = decodeURIComponent(options.term || '')
```

结论：

- 首页传参和结果页接参一致。

## 3. pages 目录结构检查

当前 `pages` 目录：

```text
pages/
  index/
  result/
```

当前 `pages/result` 目录：

```text
pages/result/
  result.js
  result.json
  result.wxml
  result.wxss
```

文件存在性：

```json
{
  "pages/result/result.js": true,
  "pages/result/result.json": true,
  "pages/result/result.wxml": true,
  "pages/result/result.wxss": true
}
```

结论：

- result 页面四件套都存在。
- 不存在缺少 `result.json` 的问题。
- 文件名和页面路径一致。

## 4. 大小写检查

`app.json` 注册路径：

```text
pages/result/result
```

实际目录：

```text
pages/result
```

实际文件：

```text
result.js
result.json
result.wxml
result.wxss
```

字符级检查：

```json
{
  "entry": "pages/result/result",
  "length": 19,
  "exactLowercase": true
}
```

结论：

- 没有 `Result` / `result` 大小写不一致。
- 没有隐藏字符。
- 路径字符精确等于 `pages/result/result`。

## 5. project.config.json 检查

检查文件：`project.config.json`

解析结果：

```json
{
  "miniprogramRoot": null,
  "compileType": "miniprogram",
  "projectname": "ai-dabaihua",
  "appid": "wx573e3fb91e268cbd",
  "hasPagesIgnored": false
}
```

检查文件：`project.private.config.json`

解析结果：

```json
{
  "miniprogramRoot": null,
  "projectname": "ai-dabaihua",
  "libVersion": "3.17.0"
}
```

结论：

- 没有配置 `miniprogramRoot`。
- 小程序根目录就是当前项目根目录。
- `packOptions.ignore` 没有忽略 `pages` 目录。
- `compileType` 是 `miniprogram`。
- 项目配置没有发现会把 `pages/result/result` 排除出编译入口的问题。

## 6. JS / JSON 语法检查

执行检查：

```text
node --check pages/index/index.js
node --check pages/result/result.js
JSON.parse(app.json)
JSON.parse(project.config.json)
JSON.parse(pages/result/result.json)
```

结果：

- `pages/index/index.js` 语法通过。
- `pages/result/result.js` 语法通过。
- `app.json` 可正常解析。
- `project.config.json` 可正常解析。
- `pages/result/result.json` 可正常解析。

结论：

- 当前没有发现 JS 语法错误导致页面注册失败。
- 当前没有发现 JSON 语法错误导致页面配置加载失败。

## 7. 当前跳转路径汇总

首页搜索跳转：

```text
/pages/result/result?term=${encodeURIComponent(searchText)}
```

结果页相关词跳转：

```text
/pages/result/result?term=${encodeURIComponent(term)}
```

分享路径：

```text
/pages/result/result?term=${encodeURIComponent(shareTerm)}
```

`app.json` 注册路径：

```text
pages/result/result
```

结论：

- 所有实际跳转路径都指向同一个页面。
- 未发现跳转到 `pages/result/index`、`pages/result/detail`、`pages/Result/result` 等错误路径。

## 8. not-found 原因判断

从源码检查结果看：

- 页面已注册。
- 页面文件存在。
- 路径大小写一致。
- 首页跳转路径正确。
- 项目配置没有改变小程序根目录。
- `pages` 没有被忽略。

因此，当前 `wx://not-found` 不像是代码中的路由路径写错。

更可能原因按优先级排序如下：

### 原因 1：微信开发者工具编译缓存没有刷新

证据：

- 源码路由配置正确。
- 文件存在。
- 但运行时 WXML 是 `wx://not-found`，说明编译产物里没有拿到这个页面。

建议：

1. 点击“编译”。
2. 使用“清缓存并编译”。
3. 关闭微信开发者工具后重新打开项目。
4. 确认打开路径是：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

### 原因 2：开发者工具打开的不是当前项目目录

证据：

- 当前磁盘项目路径检查无异常。
- 如果工具实际打开的是另一个同名目录，仍可能出现 not-found。

建议：

在微信开发者工具中检查：

```text
详情 -> 本地目录
```

必须等于：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

### 原因 3：开发者工具页面路径输入或启动参数缓存错误

截图底部显示页面路径为：

```text
pages/result/result
```

但如果工具上方“普通编译”的启动场景仍缓存旧路径，可能没有按首页真实跳转重新进入。

建议：

- 从首页点击按钮进入结果页，不要直接在页面路径框里手动打开。
- 或在编译模式里新建启动页：

```text
pages/result/result?term=API
```

注意不要写成：

```text
/pages/result/result?term=API
```

编译模式里的页面路径建议不带开头 `/`。

### 原因 4：开发者工具内部编译异常未显示在 WXML 面板

虽然 JS / JSON 静态检查通过，但仍建议看控制台是否有：

- page not found
- route not found
- app.json pages not found
- WXML compile error
- project config cache error

## 9. 修复建议

本次不修改代码。

建议按以下顺序处理：

1. 在微信开发者工具执行“清缓存并编译”。
2. 关闭并重新打开项目。
3. 确认项目本地目录是：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

4. 从首页输入 `API` 后点击按钮进入结果页。
5. 如果仍然 not-found，在编译模式中手动设置：

```text
pages/result/result?term=API
```

6. 如果仍然 not-found，再考虑临时改动路由进行验证：

```js
wx.navigateTo({
  url: 'pages/result/result?term=API'
})
```

但这一步目前不建议直接改，因为源码层面 `/pages/result/result?term=API` 是合法路径。

## 10. 结论

当前代码检查没有发现 `pages/result/result` 路由错误。

`wx://not-found` 的最可能原因是微信开发者工具编译缓存、打开目录不一致，或编译模式启动路径缓存问题。

若清缓存后仍复现，下一步应在开发者工具 Console 中读取具体路由错误日志，而不是继续检查数据渲染层。

