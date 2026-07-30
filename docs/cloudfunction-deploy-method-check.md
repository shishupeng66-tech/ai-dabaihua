# AI大白话 CloudBase 云函数部署方式检查

检查时间：2026-07-30

本次只检查部署方式，不修改代码。

## 结论

当前 `cloudfunctions/api` 可以通过微信开发者工具直接部署到 CloudBase。

当前项目已具备微信开发者工具识别云函数目录的必要配置：

```json
{
  "cloudfunctionRoot": "cloudfunctions/"
}
```

但当前项目没有在代码中显式绑定 CloudBase 环境 ID：

```js
wx.cloud.init({
  traceUser: true
})
```

因此部署和运行前，需要在微信开发者工具中选择正确的云开发环境，并建议后续在 `app.js` 显式配置 `env`。

## 1. cloudfunctions/api 是否可以直接部署

检查目录：

```text
cloudfunctions/api/
```

当前结构：

```text
cloudfunctions/api/
  index.js
  package.json
  config/env.js
  data/knowledge/terms.json
  data/knowledge/version.json
  server/
  utils/
```

`package.json`：

```json
{
  "name": "ai-dabaihua-api",
  "version": "1.0.0",
  "main": "index.js",
  "private": true,
  "engines": {
    "node": ">=18"
  },
  "dependencies": {}
}
```

判断：

- `index.js` 存在。
- `exports.main` 存在。
- `package.json` 存在。
- 无外部 npm 依赖。
- `node_modules` 不存在且不需要上传。
- 云函数包约 `0.82MB`，主要是 `terms.json`。

结论：

```text
可以直接部署。
```

前提：

- CloudBase 云函数运行环境选择 Node 18 或更高版本。
- 云函数环境变量配置完整。

## 2. 当前项目是否绑定 CloudBase 环境

### project.config.json

当前有小程序 `appid`：

```json
{
  "appid": "wx573e3fb91e268cbd"
}
```

当前有云函数根目录：

```json
{
  "cloudfunctionRoot": "cloudfunctions/"
}
```

### app.js

当前初始化：

```js
wx.cloud.init({
  traceUser: true
})
```

未显式配置：

```js
env: ''
```

判断：

- 项目已绑定小程序 AppID。
- 项目本地已配置云函数根目录。
- 代码层面未显式绑定 CloudBase 环境 ID。
- 是否已开通并绑定云开发环境，需要在微信开发者工具的「云开发」面板中确认。

结论：

```text
项目已具备 CloudBase 目录配置，但代码未显式绑定具体 env。
```

建议：

- 部署前在微信开发者工具顶部「云开发」面板确认当前环境。
- 生产发布前建议在 `wx.cloud.init` 中显式配置正式环境 ID。

## 3. 是否需要微信开发者工具上传

当前最推荐方式：

```text
使用微信开发者工具上传并部署云函数
```

原因：

- 项目已经配置 `cloudfunctionRoot`。
- `cloudfunctions/api` 是标准云函数目录。
- 当前没有 `cloudbaserc.json`，不适合直接走 CloudBase CLI。
- 微信开发者工具能直接识别 `cloudfunctions/` 下一级目录为云函数。

推荐操作：

```text
微信开发者工具
  ↓
资源管理器
  ↓
cloudfunctions/api
  ↓
右键
  ↓
上传并部署：所有文件
```

部署后再上传小程序代码：

```text
工具栏「上传」
```

注意：

- 云函数部署和小程序代码上传是两件事。
- 先部署云函数，再预览/真机测试小程序。

## 4. 是否需要 cloudbaserc.json

检查结果：

```text
cloudbaserc.json: 不存在
.cloudbaserc.json: 不存在
cloudbase.json: 不存在
```

结论：

```text
使用微信开发者工具部署云函数，不需要 cloudbaserc.json。
```

什么时候需要：

- 使用 CloudBase CLI。
- 使用 CI/CD 自动部署。
- 使用命令行指定环境、函数、静态托管等资源。

当前阶段：

```text
不需要。
```

后续如果要自动化部署，再补：

```text
cloudbaserc.json
```

## 5. 当前微信开发者工具版本下最正确部署步骤

当前本地配置显示：

```text
project.private.config.json libVersion = 3.17.0
project.config.json libVersion = 2.19.4
```

建议以微信开发者工具实际运行环境为准。你截图中使用的是微信开发者工具 Nightly，当前应按新版云开发面板流程操作。

### 步骤 1：打开正确项目

路径：

```text
C:/Users/Administrator/workbuddy-ai/AI大白话
```

确认左侧能看到：

```text
cloudfunctions/api
```

如果看不到云函数图标：

1. 确认 `project.config.json` 有：

```json
"cloudfunctionRoot": "cloudfunctions/"
```

2. 重启微信开发者工具。

### 步骤 2：确认云开发环境

在微信开发者工具顶部点击：

```text
云开发
```

确认：

- 当前 AppID 已开通云开发。
- 已选择正确环境。
- 环境 ID 与 CloudBase AI Gateway 资源一致。

### 步骤 3：配置云函数环境变量

在 CloudBase 控制台或微信开发者工具云开发面板中，为 `api` 云函数配置：

```text
CLOUDBASE_ENV_ID
CLOUDBASE_AI_API_KEY
MODEL_API_URL
HUNYUAN_MODEL=hy3
```

暂不接数据库时：

```text
DATABASE_URL 可为空
```

接数据库后：

```text
DATABASE_URL=<数据库连接串>
```

### 步骤 4：部署云函数 api

在资源管理器中：

```text
cloudfunctions/api
```

右键选择：

```text
上传并部署：所有文件
```

由于当前没有外部依赖：

- 不需要先执行 `npm install`。
- 不需要上传 `node_modules`。

### 步骤 5：云函数测试

在云函数测试面板或临时调用中测试：

```json
{
  "action": "explain",
  "data": {
    "keyword": "API"
  }
}
```

期望：

```json
{
  "success": true,
  "source": "knowledge"
}
```

再测试：

```json
{
  "action": "explain",
  "data": {
    "keyword": "为什么AI会忘记聊天？"
  }
}
```

期望：

```json
{
  "success": true,
  "source": "llm",
  "data": {
    "isMock": false
  }
}
```

如果返回：

```json
{
  "isMock": true
}
```

说明云函数环境变量没有生效，或 `CLOUDBASE_AI_API_KEY` 未配置。

### 步骤 6：小程序端预览测试

在开发者工具中点击：

```text
编译
```

测试首页输入：

```text
API
Phi
Claude
为什么AI会忘记聊天？
```

确认：

- 首页能跳转结果页。
- 知识库词能返回解释。
- 长问题能返回真实 LLM 结果。
- 开发者工具 Console 没有 `cloud function not found`、`env not found`、`permission denied`。

### 步骤 7：上传小程序代码

云函数测试通过后，再点击工具栏：

```text
上传
```

上传小程序代码。

然后到微信公众平台提交审核。

## 6. 当前项目需要注意的问题

### env 未显式配置

当前：

```js
wx.cloud.init({
  traceUser: true
})
```

风险：

- 多个 CloudBase 环境时，可能调用默认环境。
- 开发环境和生产环境容易混淆。

建议生产前改为：

```js
wx.cloud.init({
  env: '正式环境ID',
  traceUser: true
})
```

### 本地无法证明真实混元调用

当前本地检查结果：

```text
hunyuan=mock
```

必须部署云函数并配置环境变量后验证。

### cloudbaserc.json 不存在不是问题

当前使用微信开发者工具部署：

```text
不需要 cloudbaserc.json
```

如果后续走自动化部署：

```text
需要新增 cloudbaserc.json 或 CI/CD 部署配置
```

## 7. 参考依据

- CloudBase 文档说明微信小程序可通过 `wx.cloud.callFunction` 调用云函数，并给出 `cloudfunctions/<函数名>/index.js`、`package.json` 的目录方式。
- 腾讯云函数部署文档说明可在微信开发者工具内开通云开发环境，并通过开发者工具创建、上传部署云函数。
- 微信云函数实践资料普遍要求在 `project.config.json` 配置 `cloudfunctionRoot`，云函数根目录下一级目录即函数名。

参考链接：

- [CloudBase：在微信小程序中调用 CloudBase 云函数](https://docs.cloudbase.net/recipes/add-cloud-function-wechat-miniprogram)
- [腾讯云：函数部署](https://cloud.tencent.com/document/product/583/30936)

## 最终判断

### 1. cloudfunctions/api 是否可以直接部署

```text
可以。
```

通过微信开发者工具右键 `cloudfunctions/api`，选择“上传并部署：所有文件”。

### 2. 当前项目是否绑定 CloudBase 环境

```text
部分绑定。
```

项目有 AppID 和 `cloudfunctionRoot`，但代码中未显式配置 `env`。需要在微信开发者工具云开发面板确认实际环境。

### 3. 是否需要微信开发者工具上传

```text
需要。
```

当前最正确方式是先用微信开发者工具部署云函数，再上传小程序代码。

### 4. 是否需要 cloudbaserc.json

```text
不需要。
```

除非改用 CloudBase CLI 或 CI/CD 自动部署。

### 5. 当前最正确部署方式

```text
微信开发者工具打开项目
  ↓
确认云开发环境
  ↓
配置 api 云函数环境变量
  ↓
右键 cloudfunctions/api
  ↓
上传并部署：所有文件
  ↓
测试 action=explain
  ↓
确认长问题 isMock=false
  ↓
上传小程序代码
  ↓
提交审核
```
