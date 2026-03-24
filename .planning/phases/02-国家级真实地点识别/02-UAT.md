---
status: diagnosed
phase: 02-国家级真实地点识别
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md
started: 2026-03-24T03:12:03Z
updated: 2026-03-24T03:31:00Z
---

## Current Test

[testing complete]

## Tests

### 1. 地图底图与初始状态
expected: 打开页面后，世界地图应完整显示为新的真实地理底图，整体仍保持海报感主视觉。初始状态下抽屉默认关闭，预置点位依然可见，页面上不应出现残留的识别提示或失败提示。
result: pass

### 2. 点击有效陆地后识别成功
expected: 点击明显的陆地区域后，点击位置会先出现轻量脉冲点，随后自动打开抽屉并显示识别结果。抽屉标题应为识别出的国家或地区名，副行与坐标信息同步可见，地图上会出现对应的临时高亮点。
result: issue
reported: "点击明显日本位置会显示中国"
severity: major

### 3. 特殊地区优先展示
expected: 点击香港、澳门或格陵兰这类特殊地区时，抽屉标题应优先显示地区名，而不是被并回普通国家名；例如应看到 Hong Kong、Macau 或 Greenland。
result: issue
reported: "点击香港位置显示了Myanmar"
severity: major

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
passed: 4
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "点击明显的陆地区域后会打开抽屉并显示正确的国家或地区识别结果"
  status: failed
  reason: "User reported: 点击明显日本位置会显示中国"
  severity: major
  test: 2
  root_cause: "世界地图 SVG 的真实球面边框横向落在 x=160..1440，但 WORLD_PROJECTION_CONFIG 假定地理绘图区为 x=40..1560，导致点击反算比实际底图向西偏移约 120px。"
  artifacts:
    - path: "src/assets/world-map.svg"
      issue: "可见地理框与投影契约横向范围不一致"
    - path: "src/services/map-projection.ts"
      issue: "点击反算仍使用 40..1560 的横向地理范围"
  missing:
    - "人工回归确认日本点击在真实页面中已恢复正确识别"
  resolution: "已在 02-03 中将 WORLD_PROJECTION_CONFIG 对齐到真实球面框 x=160..1440，并新增 Japan 点击回归测试。"
  debug_session: ".planning/debug/02-projection-frame-mismatch.md"
- truth: "点击香港、澳门或格陵兰等特殊地区时，抽屉应优先显示正确的地区识别结果"
  status: failed
  reason: "User reported: 点击香港位置显示了Myanmar"
  severity: major
  test: 3
  root_cause: "与日本误判相同，底图横向投影框比反算契约更窄，东亚点击整体被映射到更靠西的经度，导致香港样本落到 Myanmar 附近。"
  artifacts:
    - path: "src/assets/world-map.svg"
      issue: "东亚区域视觉位置与经度映射不一致"
    - path: "src/components/WorldMapStage.vue"
      issue: "用户点击结果依赖了错误的底图横向地理框"
  missing:
    - "人工回归确认 Hong Kong 点击在真实页面中已恢复正确识别"
  resolution: "已在 02-03 中修正 East Asia 横向投影对齐，并新增 Hong Kong 点击回归测试。"
  debug_session: ".planning/debug/02-projection-frame-mismatch.md"
