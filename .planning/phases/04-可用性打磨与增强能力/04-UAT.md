---
status: diagnosed
phase: 04-可用性打磨与增强能力
source:
  - 04-01-SUMMARY.md
  - 04-02-SUMMARY.md
started: 2026-03-24T08:18:50Z
updated: 2026-03-24T08:34:51Z
---

## Current Test

[testing complete]

## Tests

### 1. 点位层级与键盘反馈
expected: 页面加载后，地图上的已保存/预置点位应保持可见但不过分抢眼。用鼠标点击一个已有点位时，该点位应获得更强的外圈/发光，其余点位略微退后但仍可见。再用键盘 Tab 聚焦到其他点位时，应看到清晰焦点态，并且该点位标签只在 hover / focus / selected 时出现，不会让所有标签常驻铺满地图。
result: pass

### 2. 抽屉焦点循环与 Esc 关闭
expected: 打开任意点位抽屉后，焦点应先进入抽屉标题区域。此时连续按 Tab，焦点应只在抽屉内部控件之间循环，不会跳回地图或页面别处。若当前没有未保存修改，按 Esc 应立即关闭抽屉；若先进入编辑态并修改内容，再按 Esc 应出现“你有未保存的更改，确定关闭吗？”确认。
result: pass

### 3. 长文本与窄屏布局稳定性
expected: 进入点位详情后，把简介改成较长内容，或在较窄视口下查看时，抽屉标题区和底部操作区应保持稳定，长文本只在内容区内部滚动，不应把整个页面或地图主体撑乱；编辑态底部操作仍然容易触达。
result: pass

### 4. 高置信城市增强显示
expected: 点击一个高置信城市候选附近的位置后，新草稿点位应允许直接显示城市名作为标题，例如 Kyoto / Tokyo 这类城市，而抽屉副信息仍能看出其所属国家/地区；这条增强不需要额外按钮触发，而是静默生效。
result: issue
reported: "基本很难选中城市"
severity: major

### 5. 城市未命中时的国家级回退
expected: 点击一个能识别国家/地区、但不在高置信城市候选附近的位置时，系统仍应成功创建草稿/点位，不会因为城市没识别出来而失败；抽屉中应出现“未识别到更精确城市，已回退到国家/地区”说明，同时保存流程仍然可继续。
result: issue
reported: "基本很难选中城市"
severity: major

### 6. 异常本地存档恢复路径
expected: 如果本地存档为空、损坏或版本不兼容，应用不应崩溃，应显示明确恢复提示，并提供“清空本地存档”入口；执行该入口后，页面应恢复到默认可用状态。
result: skipped
reason: user skipped

## Summary

total: 6
passed: 3
issues: 2
pending: 0
skipped: 1

## Gaps

- truth: "点击一个高置信城市候选附近的位置后，新草稿点位应允许直接显示城市名作为标题，例如 Kyoto / Tokyo 这类城市，而抽屉副信息仍能看出其所属国家/地区；这条增强不需要额外按钮触发，而是静默生效。"
  status: failed
  reason: "User reported: 基本很难选中城市"
  severity: major
  test: 4
  root_cause: "城市候选命中半径按真实公里数设置得过小，而当前无缩放世界地图上的用户点击误差远大于 1 到 2 像素，导致 city-high 命中区在实际交互中几乎不可点中。"
  artifacts:
    - path: "src/data/geo/city-candidates.ts"
      issue: "Tokyo / Kyoto / Osaka 等候选城市的 highRadiusKm 和 possibleRadiusKm 在当前世界地图尺度下过于保守。"
    - path: "src/services/geo-lookup.ts"
      issue: "城市增强逻辑完全依赖公里阈值，没有引入适配整张世界地图点击误差的最小交互容差。"
    - path: "src/services/geo-lookup.spec.ts"
      issue: "测试只覆盖精确城市命中，没有覆盖更接近用户真实点击误差的可操作范围。"
  missing:
    - "为城市候选匹配引入更符合整张世界地图交互尺度的最小命中容差。"
    - "补充城市增强的可操作半径回归测试，防止再次退化成难以命中的状态。"
  resolution: "已在 04-03 中为城市命中加入基于世界地图交互尺度的最小像素容差，并新增 near-city service/stage 回归测试，保证用户不需要像素级点击也能触发城市增强。"
  debug_session: ".planning/debug/04-city-hit-radius-too-small.md"
- truth: "点击一个能识别国家/地区、但不在高置信城市候选附近的位置时，系统仍应成功创建草稿/点位，不会因为城市没识别出来而失败；抽屉中应出现“未识别到更精确城市，已回退到国家/地区”说明，同时保存流程仍然可继续。"
  status: failed
  reason: "User reported: 基本很难选中城市"
  severity: major
  test: 5
  root_cause: "与 Test 4 相同，城市增强命中半径过小导致用户难以有意识地落入‘城市命中’或‘城市未命中但国家级成功’的可控测试区间，进而让回退路径难以稳定复现和感知。"
  artifacts:
    - path: "src/data/geo/city-candidates.ts"
      issue: "城市候选区过窄，使用户几乎无法主动验证高置信命中与非命中回退之间的边界。"
    - path: "src/components/WorldMapStage.vue"
      issue: "当前交互链路会正常创建国家级草稿，但用户在地图上难以稳定命中预期的城市附近区域。"
    - path: "src/components/WorldMapStage.spec.ts"
      issue: "缺少一组贴近真实交互误差的城市附近点击回退覆盖。"
  missing:
    - "扩展城市附近但未达到高置信的点击回归覆盖，确保国家级回退可以稳定复现。"
    - "让用户在当前世界地图尺度下更容易触发国家级回退提示，而不是依赖近乎像素级点击。"
  resolution: "已在 04-03 中补充 near-but-not-on city 的回退回归测试，并通过尺度感知容差把国家级回退路径拉回到可稳定复现的交互范围。"
  debug_session: ".planning/debug/04-city-hit-radius-too-small.md"
