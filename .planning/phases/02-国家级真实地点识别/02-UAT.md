---
status: complete
phase: 02-国家级真实地点识别
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md
started: 2026-03-24T03:12:03Z
updated: 2026-03-24T03:54:06Z
---

## Current Test

[testing complete]

## Tests

### 1. 地图底图与初始状态
expected: 打开页面后，世界地图应完整显示为新的真实地理底图，整体仍保持海报感主视觉。初始状态下抽屉默认关闭，预置点位依然可见，页面上不应出现残留的识别提示或失败提示。
result: pass

### 2. 点击有效陆地后识别成功（再次复测）
expected: 点击明显的陆地区域后，点击位置会先出现轻量脉冲点，随后自动打开抽屉并显示识别结果。抽屉标题应为识别出的国家或地区名，副行与坐标信息同步可见，地图上会出现对应的临时高亮点。
result: pass

### 3. 特殊地区优先展示（再次复测）
expected: 点击香港、澳门或格陵兰这类特殊地区时，抽屉标题应优先显示地区名，而不是被并回普通国家名；例如应看到 Hong Kong、Macau 或 Greenland。
result: pass

### 4. 点击海洋或无效区域
expected: 点击海洋或明显无效区域后，不应创建任何新点位或打开抽屉。页面顶部应出现温和提示，引导“请点击有效陆地区域”，提示消失后界面恢复干净状态。
result: pass

### 5. 边界附近保守判定
expected: 点击海岸线或边界附近的模糊位置时，如果系统不够确定，应优先不给出错误国家结果，而是提示“请点击更靠近目标区域的位置”。失败后地图上不应残留错误点位。
result: pass

### 6. 既有预置点位交互未回退
expected: 点击 Lisbon、Cairo 等预置点位时，仍应像之前一样直接打开抽屉查看对应内容，不应被新的识别流程打断或改写。
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "点击明显的陆地区域后会打开抽屉并显示正确的国家或地区识别结果"
  status: failed
  reason: "User reported: 如图所示，点击红色笔触位置后识别到的位置是偏左上的，这存在于几乎所有位置"
  severity: major
  test: 2
  root_cause: "当前点击链路仍依赖‘推断出来的地理绘图区’，而不是运行时真实渲染的地图像素区域；因此只要展示层与推断框稍有漂移，识别结果就会在全图表现为系统性偏左上。"
  artifacts:
    - path: "src/assets/world-map.svg"
      issue: "展示地图是预渲染 SVG 图片，真实可视地理像素并未直接驱动点击层"
    - path: "src/services/map-projection.ts"
      issue: "投影反算仍使用推断框，而不是从真实渲染契约导出的交互框"
    - path: "src/services/geo-lookup.spec.ts"
      issue: "当前回归测试主要验证服务层数学，没有覆盖真实点击对齐"
  missing:
    - "人工回归确认全图点击不再整体偏左上"
  resolution: "已在 02-04 中让检测点改用共享底图 viewBox 的 SVG overlay 渲染，并新增 WorldMapStage 交互级点击对齐测试。"
  debug_session: ".planning/debug/02-projection-frame-mismatch.md"
- truth: "点击香港、澳门或格陵兰等特殊地区时，抽屉应优先显示正确的地区识别结果"
  status: failed
  reason: "User reported: 因为点位偏移的问题无法识别到具体地区"
  severity: major
  test: 3
  root_cause: "与 Test 2 相同，问题不再只是香港样本本身，而是全图点击结果与可视地图像素仍有系统性偏移，导致小区域更难被准确命中。"
  artifacts:
    - path: "src/assets/world-map.svg"
      issue: "特殊地区在视觉上面积更小，更容易被全局偏移放大成识别失败"
    - path: "src/components/WorldMapStage.vue"
      issue: "真实点击坐标到地理结果的映射仍未与显示层精确对齐"
  missing:
    - "人工回归确认 Hong Kong 等小区域恢复可点命中"
  resolution: "已在 02-04 中统一点击层与检测点渲染层的坐标系；Hong Kong 等小区域需要下一轮 verify-work 做人工确认。"
  debug_session: ".planning/debug/02-projection-frame-mismatch.md"
