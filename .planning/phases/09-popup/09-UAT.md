---
status: complete
phase: 09-popup
source:
  - 09-popup-01-SUMMARY.md
  - 09-popup-02-SUMMARY.md
  - 09-popup-03-SUMMARY.md
started: 2026-03-26T08:26:46Z
updated: 2026-03-26T09:05:34Z
---

## Current Test

[testing complete]

## Tests

### 1. 桌面端地图内候选 Popup
expected: 在桌面宽度下点击地图有效陆地区域后，地图舞台内部会出现锚定在命中位置附近的 summary popup，而不是直接打开右侧或底部抽屉；popup 内应看到国家/地区名称、候选确认文案，以及“按国家/地区继续记录”等动作。
result: pass

### 2. 候选确认与回退继续记录
expected: 在候选 popup 中，点击候选城市会把当前 summary surface 切换成该城市的识别结果/查看摘要；如果选择“按国家/地区继续记录”，则会继续保留 fallback 国家/地区摘要，而不是丢失当前上下文。
result: pass

### 3. 已保存点位 Popup 与详情接力
expected: 点击已保存点位 marker 后，会在地图内看到对应地点的 summary popup；点击“查看详情”或“编辑地点”后才打开 deep drawer，关闭 drawer 后仍回到当前点位的 summary surface。
result: issue
reported: "所有的drewer情况都可以修改为popup了"
severity: major

### 4. 移动端或窄屏 Peek 回退
expected: 当窗口缩窄到移动端宽度时，summary surface 不再显示 anchored popup，而是回退到底部 peek；peek 内应有可见的“关闭”按钮，且仍保留同样的摘要内容与动作。
result: pass

### 5. Popup / Peek / Drawer 切换时的边界高亮稳定性
expected: 在 summary popup、移动端 peek、以及 deep drawer 之间切换时，当前城市/地点对应的地图边界高亮应始终和当前选中对象一致；关闭 summary 或 drawer 后，不应残留错误的强高亮。
result: pass

### 6. 长内容摘要的滚动可用性
expected: 当 popup 或 peek 中的描述文本、候选列表或通知内容超过当前可用高度时，内容区应保持可滚动，用户仍能触达底部动作按钮，不会出现内容被裁切但无法滚动的情况。
result: issue
reported: "如图所示，内容区域的滚动失效了"
severity: major

## Summary

total: 6
passed: 4
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "点击已保存点位 marker 后，会在地图内看到对应地点的 summary popup；点击“查看详情”或“编辑地点”后才打开 deep drawer，关闭 drawer 后仍回到当前点位的 summary surface。"
  status: failed
  reason: "User reported: 所有的drewer情况都可以修改为popup了"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "当 popup 或 peek 中的描述文本、候选列表或通知内容超过当前可用高度时，内容区应保持可滚动，用户仍能触达底部动作按钮，不会出现内容被裁切但无法滚动的情况。"
  status: failed
  reason: "User reported: 如图所示，内容区域的滚动失效了"
  severity: major
  test: 6
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
