# AI黑话翻译器内容安全配置报告

## 本次目标

为用户输入解释链路增加基础内容安全能力，避免违规、涉黄、违法、隐私、越狱类输入直接进入知识库解释或混元生成流程。

## 修改文件

- `server/services/contentSafetyService.js`
- `server/api.js`
- `cloudfunctions/api/server/services/contentSafetyService.js`
- `cloudfunctions/api/server/api.js`
- `docs/content-safety-setup-report.md`

## 风控位置

当前风控接入在服务端 `/api/explain` 入口：

```text
用户输入
↓
云函数 api
↓
server/api.js
↓
contentSafetyService.checkInput()
↓
通过：知识库优先 / 混元兜底
拦截：返回安全提示，不调用混元
↓
contentSafetyService.checkOutput()
↓
通过：返回解释
拦截：返回安全提示
```

## 已覆盖风险类型

- `sexual`：涉黄、性服务、未成年人相关性内容
- `violence`：伤害、爆炸物、投毒、枪支等暴力危险内容
- `illegal`：诈骗、洗钱、盗号、钓鱼网站、伪造证件等违法请求
- `privacy`：身份证、银行卡、定位、人肉搜索、隐私查询
- `self_harm`：自杀、自伤相关
- `prompt_attack`：越狱、绕过限制、诱导输出系统提示

## 拦截返回结构

```json
{
  "success": true,
  "source": "safety",
  "matchType": "blocked",
  "score": 0,
  "data": {
    "type": "safety_notice",
    "summary": "这个问题暂时不能解释。可以换成 AI 术语、软件概念或正常学习问题来问。",
    "professionalExplanation": "这个问题暂时不能解释。可以换成 AI 术语、软件概念或正常学习问题来问。",
    "aiExample": "为了保证内容安全，这类问题不会进入 AI 生成流程。",
    "safety": {
      "blocked": true,
      "category": "illegal",
      "reason": "illegal_request",
      "stage": "input"
    }
  }
}
```

## 风险测试用例

### 应该放行

- `API`
- `Token`
- `什么是大模型`
- `为什么AI会忘记聊天内容`
- `如何利用AI提高工作效率`

### 应该拦截

- 涉黄类输入
- 暴力伤害类输入
- 违法犯罪类输入
- 隐私查询类输入
- 自伤自杀类输入
- 越狱绕过限制类输入

## 当前边界

这是第一版规则拦截，不等于完整内容安全平台。上线后建议继续接入腾讯云内容安全或 CloudBase AI 安全审核能力，作为模型前后的第二道审核。

## 后续建议

1. 将风险命中记录写入 CloudBase 数据库，便于统计。
2. 增加频率限制：同一用户多次触发风险后临时限制调用。
3. 接入腾讯云内容安全接口做更细粒度审核。
4. 对模型输出做更严格的审核和截断。
5. 建立上线前固定风险回归测试集。
