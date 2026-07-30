# AI黑话翻译器旧 CloudBase 云函数依赖检查

检查时间：2026-07-30

本次只检查，不删除任何云函数或代码。

## 检查目标

确认项目是否仍依赖以下旧云函数：

```text
generateExplanation
login
getTestHistory
saveTestResult
```

检查范围：

```text
pages/
utils/
server/
cloudfunctions/
```

## 1. 旧云函数名搜索结果

搜索结果：

```json
{
  "generateExplanation": [],
  "login": [],
  "getTestHistory": [],
  "saveTestResult": []
}
```

结论：

- `pages/` 中未发现调用。
- `utils/` 中未发现调用。
- `server/` 中未发现调用。
- `cloudfunctions/` 中未发现调用。

## 2. 当前 cloudfunctions 目录

当前顶层云函数目录：

```json
{
  "cloudfunctionTopLevelDirs": [
    "api"
  ]
}
```

结论：

- 当前项目中只存在 `cloudfunctions/api`。
- 未发现 `cloudfunctions/generateExplanation`。
- 未发现 `cloudfunctions/login`。
- 未发现 `cloudfunctions/getTestHistory`。
- 未发现 `cloudfunctions/saveTestResult`。

## 3. 当前小程序云函数调用

当前调用位置：

```text
utils/api.js
```

调用方式：

```js
wx.cloud.callFunction({
  name: CLOUD_FUNCTION_NAME,
  data: {
    action,
    data
  }
})
```

其中：

```js
const CLOUD_FUNCTION_NAME = 'api'
```

结论：

- 当前小程序端只调用统一云函数 `api`。
- 未发现直接调用旧云函数名。

## 4. 其他匹配说明

搜索 `name:` 时出现以下内容：

```text
server/services/hunyuanService.js
cloudfunctions/api/server/services/hunyuanService.js
```

这些是 prompt 配置名称：

```text
businessPrompt
developerPrompt
comparePrompt
explainPrompt
```

它们不是 CloudBase 云函数名，不属于旧云函数依赖。

## 5. 最终结论

当前项目不再依赖以下旧 CloudBase 云函数：

```text
generateExplanation
login
getTestHistory
saveTestResult
```

当前有效云函数入口为：

```text
cloudfunctions/api
```

当前小程序端有效调用为：

```text
wx.cloud.callFunction({ name: "api" })
```

## 6. 建议

如果 CloudBase 控制台中仍存在旧云函数：

```text
generateExplanation
login
getTestHistory
saveTestResult
```

建议先不要立即删除，按以下步骤处理：

1. 确认线上版本已切换到 `api` 云函数。
2. 查看旧云函数最近 7 天调用日志。
3. 若调用量为 0，再进行归档或删除。
4. 删除前导出旧云函数代码备份。

本地项目层面无需继续保留旧云函数依赖。
