---
status: passed
phase: 14-leaflet
source:
  - VERIFICATION.md
  - 14-UAT.md
  - 14-03-SUMMARY.md
started: 2026-04-03T05:49:49Z
updated: 2026-04-03T06:57:45Z
---

## Current Test

[testing complete]

## Environment

app_url: user-confirmed local dev session
browser: user-confirmed browser session
bing_key: present
geometry_assets: present
seed_record_ready: yes

## Tests

### 1. Popup 跟随地图拖动时锚点实时更新
expected: 地图拖拽和缩放过程中 popup 始终跟随点击坐标，不出现明显漂移、延迟或错位。
steps:
- 启动 `pnpm dev` 或等价的 web + server 本地环境
- 在地图上点击一个可识别地点，等待 popup 出现
- 连续拖动和缩放地图至少 10 秒
- 观察 popup 是否持续贴合原始点击位置
result: pass
evidence: 用户于 2026-04-03 明确反馈“全部 pass”；确认 popup 在地图拖拽与缩放过程中持续跟随点击锚点，未出现肉眼可见的飘移或滞后。
notes: 未报告异常。

### 2. Bing Maps CanvasLight 瓦片加载（需要 API Key）
expected: 配置 `VITE_BING_MAPS_KEY` 后，底图切换为 Bing CanvasLight，显示中英双语地名，且没有 broken tiles。
steps:
- 确认本地环境存在有效 `VITE_BING_MAPS_KEY`
- 刷新页面并观察地图底图
- 在多个缩放级别和不同区域检查瓦片与地名
- 若 key 缺失或请求失败，记录为 blocked 并写明原因
result: pass
evidence: 用户确认已在配置可用 Bing key 的真实浏览器环境中看到 CanvasLight 底图与双语地名，未出现 broken tiles。
notes: 未报告 key/配额/网络问题。

### 3. 已点亮边界启动时预加载
expected: 页面刷新后，只要存在已点亮记录，对应 saved boundary 会在地图 ready 后自动显示，不需要用户再次点击该地点。
steps:
- 先确保当前环境至少有一个已点亮地点记录
- 刷新页面，等待地图完全 ready
- 观察该地点的 saved boundary 是否自动出现
- 如未出现，记录是否需要手动 reopen/click 才能显示
result: pass
evidence: 用户确认在存在已点亮记录的情况下刷新页面后，对应 saved boundary 会自动出现，无需再次手动点击该地点。
notes: 未报告 reopen/refresh 后的缺失或残留问题。

## Summary

total: 3
passed: 3
issues: 0
pending: 0
blocked: 0

## Gaps

None.
