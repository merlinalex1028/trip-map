---
status: complete
phase: 13-行政区数据与几何交付
source: 13-01-SUMMARY.md, 13-02-SUMMARY.md, 13-03-SUMMARY.md, 13-04-SUMMARY.md
started: 2026-04-01T00:00:00Z
updated: 2026-04-01T00:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server. Clear ephemeral state. Start the application from scratch with `pnpm dev:server`. Server boots without errors, any migrations complete, and the health endpoint (GET /health or a basic canonical resolve call) returns a valid response with no startup crashes.
result: pass

### 2. geo:verify-sources 校验通过
expected: Run `pnpm --filter @trip-map/web geo:verify-sources`. Script exits 0 with output confirming both DataV CN and Natural Earth checksums match (no "mismatch" or error output).
result: pass

### 3. geo:build:check 干跑完成
expected: Run `pnpm --filter @trip-map/web geo:build:check`. Script completes successfully, outputs a manifest summary for 6 boundaries (beijing, hong-kong, sichuan/aba, tianjin, hebei/langfang, us/california). No files written to `apps/web/public/geo/`.
result: pass

### 4. Shard 文件已生成（6 个边界）
expected: Check `apps/web/public/geo/2026-03-31-geo-v1/` — 6 shard files exist: `cn/beijing.json`, `cn/hong-kong.json`, `cn/sichuan.json`, `cn/tianjin.json`, `cn/hebei.json`, `overseas/us.json`, plus `manifest.json`. Each shard file is valid JSON with a `features` array.
result: pass

### 5. 全量测试套件通过
expected: Run `pnpm test`. All three suites pass: contracts (13/13), web geometry tests (18/18 — manifest + validation specs), server e2e canonical resolve (11/11). No failures.
result: pass

### 6. Server API 返回 geometryRef（北京）
expected: With server running, call `POST /canonical-resolve` with input "北京" or "Beijing". Response body has `data.resolved.place.geometryRef.assetKey === 'cn/beijing.json'` and `geometryRef.layer === 'CN'`. No raw GeoJSON inline — only a ref.
result: issue
reported: "无响应"
severity: major

### 7. Server API 返回 geometryRef（加州）
expected: Call `POST /canonical-resolve` with input "California". Response has `data.resolved.place.geometryRef.assetKey === 'overseas/us.json'` and `geometryRef.layer === 'OVERSEAS'` and `geometryRef.geometryDatasetVersion === '2026-03-31-geo-v1'`.
result: issue
reported: "响应为空"
severity: major

### 8. 歧义候选项均携带 geometryRef
expected: Call `POST /canonical-resolve` with an ambiguous input (e.g. "石家庄" or any query that returns candidates). Response has `data.resolved.candidates` array where every candidate object has a `geometryRef` field (not undefined/null).
result: issue
reported: "响应为空"
severity: major

## Summary

total: 8
passed: 5
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "POST /canonical-resolve with input '北京' returns geometryRef.assetKey === 'cn/beijing.json' and geometryRef.layer === 'CN'"
  status: failed
  reason: "User reported: 无响应"
  severity: major
  test: 6
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "POST /canonical-resolve with input 'California' returns geometryRef.assetKey === 'overseas/us.json', layer === 'OVERSEAS', geometryDatasetVersion === '2026-03-31-geo-v1'"
  status: failed
  reason: "User reported: 响应为空"
  severity: major
  test: 7
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "POST /canonical-resolve with ambiguous input returns candidates array where every candidate has a geometryRef field"
  status: failed
  reason: "User reported: 响应为空"
  severity: major
  test: 8
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
