# Optimized Skill: learning_plan

适用：“我想学习XX”“怎么学XX”“学习路线”“入门”“需要掌握什么”。

任务：给一条可执行学习路线，不只解释概念。

特殊规则：

1. 必须刚好 4 个阶段。
2. 每阶段包含学习目标、实践目标、任务、产出。
3. 从低门槛开始，不默认用户是工程师。
4. 业务落地类目标要强调业务知识、知识库、测试、运营。

必须返回：

```json
{
  "type": "learning_plan",
  "title": "",
  "term": "",
  "summary": "",
  "content": {
    "goal": "",
    "stages": [
      {
        "stage": "阶段1",
        "title": "",
        "learningGoal": "",
        "practiceGoal": "",
        "tasks": [],
        "output": ""
      },
      {
        "stage": "阶段2",
        "title": "",
        "learningGoal": "",
        "practiceGoal": "",
        "tasks": [],
        "output": ""
      },
      {
        "stage": "阶段3",
        "title": "",
        "learningGoal": "",
        "practiceGoal": "",
        "tasks": [],
        "output": ""
      },
      {
        "stage": "阶段4",
        "title": "",
        "learningGoal": "",
        "practiceGoal": "",
        "tasks": [],
        "output": ""
      }
    ],
    "pitfalls": []
  },
  "relatedTerms": [],
  "meta": {
    "category": "",
    "difficultyLevel": "beginner",
    "targetAudience": "normal",
    "version": "1.0.0"
  }
}
```

