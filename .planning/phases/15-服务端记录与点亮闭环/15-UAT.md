---
status: diagnosed
phase: 15-服务端记录与点亮闭环
source: 15-01-SUMMARY.md, 15-02-SUMMARY.md, 15-03-SUMMARY.md
started: 2026-04-01T01:00:00Z
updated: 2026-04-02T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server. Run `pnpm dev:server`. Server boots without errors, Prisma TravelRecord migration applied, `GET http://localhost:4000/records` returns a valid JSON response (empty array or records list).
result: pass

### 2. 地图启动时无种子数据
expected: Open the app (`pnpm dev:web`). Map loads empty — no pre-seeded pins or highlights. Map starts fresh, fetches records from server (empty on first run).
result: pass

### 3. 弹窗显示"点亮"按钮
expected: Click on the map in a recognized area. After the popup appears, the title row shows a "点亮" button. Button is teal/active color when the place is already saved, grey/off when not saved.
result: issue
reported: "\"点亮\"按钮点击无效果"
severity: major

### 4. 点亮地点 — 按钮状态变化
expected: Click "点亮" button in the popup. Button immediately shows a pending/disabled state. After API call succeeds, button changes to "已点亮" (teal). The place is now saved in the server database.
result: blocked
blocked_by: prior-phase
reason: "按钮点击无效果 — blocked by test 3 illuminate button not responding"

### 5. 点亮后边界高亮出现
expected: After clicking "点亮" and saving, the GeoJSON boundary overlay for that region appears on the map in blue (saved color). The illuminated region is visually highlighted.
result: blocked
blocked_by: prior-phase
reason: "无法测试 — blocked by test 3 illuminate button not responding"

### 6. 取消点亮 — 记录删除
expected: With a saved place popup open (showing "已点亮"), click the button again. Button shows pending state briefly, then returns to "点亮" (unsaved). The GeoJSON boundary overlay disappears or reverts to unrecorded opacity.
result: blocked
blocked_by: prior-phase
reason: "无法测试 — blocked by test 3 illuminate button not responding"

### 7. 重复点亮不重复创建（409 处理）
expected: Clicking "点亮" on an already-saved place should be idempotent — no second API call, or API returns 409 and UI handles gracefully without crashing or showing an error.
result: blocked
blocked_by: prior-phase
reason: "无法测试 — blocked by test 3 illuminate button not responding"

### 8. 全量测试套件通过
expected: Run `pnpm test`. All 138+ tests pass. Run `pnpm typecheck` — zero errors.
result: issue
reported: "test/records-smoke.e2e-spec.ts (1 test | 1 failed): POST /records/smoke with PostgreSQL > persists one smoke record and returns canonical field names unchanged — expected { …(9) } to match object { placeId: 'phase11-demo-place', …(9) }"
severity: major

## Summary

total: 8
passed: 2
issues: 2
pending: 0
skipped: 0
blocked: 4

## Gaps

- truth: "Clicking 点亮 button in popup saves the place and button changes to 已点亮 (teal)"
  status: failed
  reason: "User reported: \"点亮\"按钮点击无效果"
  severity: major
  test: 3
  root_cause: "handleIlluminate in LeafletMapStage.vue has a silent guard `if (!point.placeId || !point.placeKind || !point.datasetVersion) return` that fires for fallback draft points (OUTSIDE_SUPPORTED_DATA path). buildFallbackDraftPoint sets these fields to null, so clicking 点亮 silently exits before reaching the store. The emit chain (PointSummaryCard → MapContextPopup → LeafletMapStage → store) is intact; the button renders as interactive but the guard silently blocks it."
  artifacts:
    - path: "apps/web/src/components/LeafletMapStage.vue"
      issue: "handleIlluminate guard silently returns for fallback points with null placeId; buildFallbackDraftPoint produces these points"
    - path: "apps/web/src/components/map-popup/PointSummaryCard.vue"
      issue: "Button shows as interactive even for un-illuminatable fallback points (no isIlluminatable prop)"
  missing:
    - "Replace silent return in handleIlluminate with setInteractionNotice for fallback points"
    - "Pass isIlluminatable prop (derived from placeId !== null) to PointSummaryCard to hide/disable button for fallback points"
  debug_session: ".planning/debug/illuminate-button-no-effect.md"

- truth: "pnpm test passes all 138+ tests with zero failures"
  status: failed
  reason: "User reported: test/records-smoke.e2e-spec.ts (1 test | 1 failed): POST /records/smoke with PostgreSQL > persists one smoke record and returns canonical field names unchanged — expected { …(9) } to match object { placeId: 'phase11-demo-place', …(9) }"
  severity: major
  test: 8
  root_cause: "SmokeRecord Prisma model is missing 5 columns from CanonicalPlaceSummary (regionSystem, adminType, typeLabel, parentLabel, subtitle). The repository silently drops these fields at write time — DB row never contains them. Test line 89 reads storedRows[0] from DB and fails because those 5 fields are absent. Line 80 (response.json() check) passes because service reconstructs from in-memory input."
  artifacts:
    - path: "apps/server/prisma/schema.prisma"
      issue: "SmokeRecord model missing regionSystem, adminType, typeLabel, parentLabel, subtitle columns"
    - path: "apps/server/src/modules/records/records.repository.ts"
      issue: "createSmokeRecord() does not write the 5 missing fields (blocked by schema gap)"
  missing:
    - "Add 5 missing columns to SmokeRecord in schema.prisma and run prisma migrate dev"
    - "Update createSmokeRecord() in repository to persist all 5 new fields"
  debug_session: ".planning/debug/records-smoke-test-failure.md"
