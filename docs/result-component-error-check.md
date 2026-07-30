# AI大白话 result 页面 Component is not found 检查报告

检查时间：2026-07-30

现象：

进入 `pages/result/result` 后白屏，微信开发者工具报：

```text
Component is not found
wx://not-found
```

本次只检查，不修改代码。

## 1. result.wxml 是否引用自定义组件

检查文件：`pages/result/result.wxml`

识别到的标签只有：

```json
[
  "button",
  "image",
  "text",
  "view"
]
```

这些都是微信小程序内置组件。

未发现以下自定义组件或第三方组件：

- `<xxx />`
- `<van-xxx />`
- `<component />`
- Vant 组件
- 自定义 UI 组件
- 外部组件

结论：

`pages/result/result.wxml` 没有引用自定义组件，因此当前 `Component is not found` 不是由 result 页面 WXML 内部缺少自定义组件导致。

## 2. result.json usingComponents 检查

检查文件：`pages/result/result.json`

当前内容：

```json
{
  "navigationBarTitleText": "",
  "navigationStyle": "default",
  "backgroundColor": "#F5F5F7"
}
```

解析结果：

```json
{
  "usingComponents": null,
  "keys": [
    "navigationBarTitleText",
    "navigationStyle",
    "backgroundColor"
  ]
}
```

结论：

- `result.json` 没有 `usingComponents`。
- 没有注册不存在的组件。
- 没有引用 Vant 或其它第三方组件。

## 3. image src 路径检查

### WXML 静态图片

`result.wxml` 直接引用：

```text
/assets/home/hero-robot.png
```

存在性检查：

```json
{
  "src": "/assets/home/hero-robot.png",
  "fsPath": "assets/home/hero-robot.png",
  "exists": true
}
```

### resultData.assets 动态图片

`result.js` 中 `RESULT_ASSETS`：

```json
{
  "robot": "/assets/home/hero-robot.png",
  "woman": "/assets/home/hero-woman.png",
  "orangeBubble": "/assets/home/hero-bubble-orange.png",
  "whiteBubble": "/assets/home/hero-bubble-white.png",
  "shelfPlant": "/assets/home/hero-shelf-plant.png",
  "coffee": "/assets/home/hero-coffee.png"
}
```

存在性检查：

```json
[
  {
    "src": "/assets/home/hero-robot.png",
    "exists": true
  },
  {
    "src": "/assets/home/hero-woman.png",
    "exists": true
  },
  {
    "src": "/assets/home/hero-bubble-orange.png",
    "exists": true
  },
  {
    "src": "/assets/home/hero-bubble-white.png",
    "exists": true
  },
  {
    "src": "/assets/home/hero-shelf-plant.png",
    "exists": true
  },
  {
    "src": "/assets/home/hero-coffee.png",
    "exists": true
  }
]
```

结论：

- `/assets/home/hero-robot.png` 真实存在。
- result 页面引用的首页插画素材都真实存在。
- 图片路径缺失不会导致当前 `Component is not found`。

## 4. 是否引用 component / vant / 自定义 UI

全项目针对 result 相关文件搜索：

```text
usingComponents
component
vant
van-
<van-
<component
```

结果：

- `pages/result/result.wxml` 未命中。
- `pages/result/result.json` 未命中。
- `app.json` 未注册全局组件。

结论：

当前 result 页面没有组件库依赖，也没有自定义组件依赖。

## 5. WXML 文件真实内容说明

PowerShell 控制台直接 `Get-Content` 时会显示中文乱码，这是控制台编码显示问题，不等于文件真实内容损坏。

使用 Node 按 UTF-8 读取关键行，真实内容为：

```text
<text class="title-kicker">AI 已为你生成解释</text>
<text class="section-title">大白话解释</text>
<button class="switch-example" ...>换一个例子</button>
<button class="bottom-btn secondary" ...>有帮助</button>
```

标签数量检查：

```json
{
  "openView": 32,
  "closeView": 32,
  "openText": 21,
  "closeText": 21
}
```

结论：

- 当前文件按 UTF-8 读取时，WXML 闭合标签是正常的。
- 不是由 `</text>` 或 `</button>` 缺失导致的组件 not-found。

## 6. 错误来源判断

基于本次检查，当前没有在 `pages/result/result.wxml` 或 `pages/result/result.json` 中定位到“组件缺失”的代码来源。

可以排除：

1. result 页面引用了未注册自定义组件。
2. result 页面注册了不存在的 `usingComponents`。
3. result 页面引用 Vant 或外部 UI 组件。
4. `/assets/home/hero-robot.png` 缺失。
5. result 页面内图片资源缺失。

因此当前 `Component is not found wx://not-found` 更可能不是 result 页面内部组件声明错误，而是微信开发者工具运行时仍在加载 not-found 占位页。

结合前一份路由检查报告，优先怀疑：

- 开发者工具编译缓存仍未刷新。
- 运行中的模拟器没有读取当前磁盘文件。
- 打开的项目目录与当前工作目录不一致。
- 编译模式启动页缓存异常。

## 7. 文件位置

本次重点检查文件：

- `pages/result/result.wxml`
- `pages/result/result.json`
- `pages/result/result.js`
- `assets/home/hero-robot.png`
- `assets/home/hero-woman.png`
- `assets/home/hero-bubble-orange.png`
- `assets/home/hero-bubble-white.png`
- `assets/home/hero-shelf-plant.png`
- `assets/home/hero-coffee.png`

没有发现组件引用错误位置。

## 8. 修复建议

不建议在当前阶段继续改 result 页面组件注册，因为页面没有自定义组件依赖。

建议按以下顺序处理：

1. 微信开发者工具执行“清缓存并编译”。
2. 关闭微信开发者工具，重新打开项目。
3. 确认开发者工具项目路径为：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

4. 从首页重新点击“立即解释”进入结果页。
5. 如果仍报 `Component is not found wx://not-found`，打开 Console，复制完整错误堆栈。
6. 如果堆栈指向某个具体组件名，再按组件名检查对应 `usingComponents`。

## 9. 结论

当前代码中没有发现 result 页面自定义组件缺失问题。

`Component is not found wx://not-found` 的直接来源没有落在 `pages/result/result.wxml` 或 `pages/result/result.json` 的组件引用上。当前更像开发者工具运行时/缓存/项目目录问题，需要用完整 Console 堆栈继续定位。

