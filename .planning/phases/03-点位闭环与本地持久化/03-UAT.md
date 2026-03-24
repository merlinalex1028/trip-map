---
status: complete
phase: 03-点位闭环与本地持久化
source:
  - 03-01-SUMMARY.md
  - 03-02-SUMMARY.md
  - 03-03-SUMMARY.md
started: 2026-03-24T05:25:46Z
updated: 2026-03-24T05:55:03Z
---

## Current Test

[testing complete]

## Tests

### 1. 创建草稿点位
expected: 在地图上点击一个能够被识别的陆地区域后，应立即出现一个新的草稿点位高亮，抽屉自动打开到识别预览/草稿态，并允许继续保存为正式地点；此时地图上不应只是短暂提示，而是能看到明确的待保存点位。
result: pass

### 2. 重复点击替换草稿
expected: 当已有未保存草稿时，再点击另一个可识别位置，旧草稿应被新位置替换，地图高亮同步切换，并出现“当前未保存地点将被丢弃，并切换到新位置”之类的提示，不应残留两个草稿点。
result: pass

### 3. 已保存点位查看与编辑
expected: 保存后的地点再次点击时，应先进入查看态；用户可切换到编辑态并修改名称、简介、点亮状态，保存后地图与抽屉内容应同步更新。
result: pass

### 4. 删除与隐藏闭环
expected: 用户自己创建的地点应可删除且删除前有确认；预置地点应可隐藏且隐藏前有确认。确认后地图上的对应点位应立即消失，不应留下无效选中态。
result: pass

### 5. 刷新恢复与损坏存档提示
expected: 已保存、已编辑、已隐藏的点位状态在刷新页面后应恢复；如果本地存档损坏，页面应显示明确异常提示，并提供“清空本地存档”入口，清空后应用可恢复正常使用。
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "在地图上点击一个能够被识别的陆地区域后，应立即出现一个新的草稿点位高亮，抽屉自动打开到识别预览/草稿态，并允许继续保存为正式地点；此时地图上不应只是短暂提示，而是能看到明确的待保存点位。"
  status: resolved
  reason: "Re-tested after the marker anchoring and click-space fix; user confirmed pass."
  severity: major
  test: 1
  root_cause: "Marker positioning centered the entire selected marker container, so the visible label shifted the dot up-left; click normalization also read bounds from a different DOM box than the shared map surface."
  artifacts:
    - path: "src/components/SeedMarkerLayer.vue"
      issue: "The centering transform applied to the whole labeled marker wrapper instead of the dot anchor."
    - path: "src/components/WorldMapStage.vue"
      issue: "Click coordinates were normalized from the image bounds instead of the shared surface container."
  missing:
    - "Anchor marker positioning on the dot button only and offset the label independently."
    - "Normalize click coordinates from the map surface container so input and rendering use the same coordinate space."
  debug_session: ""
