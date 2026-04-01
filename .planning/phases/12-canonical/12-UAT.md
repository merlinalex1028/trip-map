---
status: diagnosed
phase: 12-canonical
source: [12-01-SUMMARY.md, 12-02-SUMMARY.md, 12-03-SUMMARY.md, 12-04-SUMMARY.md, 12-05-SUMMARY.md]
started: 2026-04-01T00:00:00Z
updated: 2026-04-01T01:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/frontend. Start fresh with `pnpm dev`. Both web and server boot without errors. The app loads in the browser and the map renders.
result: pass

### 2. Map Click → Canonical Beijing Resolve
expected: Click anywhere on the Beijing area on the map. The app shows a popup with canonical Beijing info — type label shows "直辖市" and subtitle shows parent region context. No local-only geo inference — the data comes from the server `/places/resolve` endpoint.
result: issue
reported: "无标签显示"
severity: major

### 3. Ambiguous Area → Candidate Selection
expected: Click on a geographically ambiguous area (the Jing-Jin-Ji / 京津冀 border region between Beijing, Tianjin, and Hebei). A candidate selection UI appears with up to 3 options. Picking one calls `/places/confirm` and saves that canonical place.
result: skipped
reason: "后续取消了候选了 — 候选选择功能在后续阶段已移除"

### 4. Hong Kong / SAR Type Label
expected: Click on Hong Kong and save it. The popup shows "特别行政区" as the type label — not a generic city label. The subtitle shows the appropriate parent region.
result: issue
reported: "无标签、无副标题"
severity: major

### 5. California / Overseas Admin1 Type Label
expected: Click on California (USA) and save it. The popup shows "State" as the type label with appropriate subtitle. This confirms overseas admin1 semantics work alongside Chinese admin types.
result: issue
reported: "无法识别"
severity: major

### 6. Popup / Drawer Canonical Parity
expected: For a saved canonical point (e.g., Beijing), open the popup then open the drawer. The title, type label, and subtitle are identical in both surfaces — no discrepancy between popup and drawer display.
result: skipped
reason: "该功能也在后续处理了 — 后续阶段已重新处理"

### 7. Beijing Boundary Highlight on Reopen
expected: Save a Beijing canonical point, then click elsewhere to close/deselect it. Click on the saved Beijing point again. The Beijing municipal boundary outline reappears on the map (the colored boundary polygon highlights again).
result: skipped
reason: "该功能应该也改动了 — 后续阶段已修改此行为"

### 8. California Unsupported Boundary in Drawer
expected: Save a California canonical point and open its drawer. The drawer shows a message indicating boundary data is not yet supported for this location. No boundary polygon is highlighted on the map for California.
result: skipped
reason: "跳过"

## Summary

total: 8
passed: 1
issues: 3
skipped: 4
pending: 0

## Gaps

- truth: "Map click on Beijing shows popup with type label 直辖市 and subtitle from server canonical resolve"
  status: failed
  reason: "User reported: 无标签显示"
  severity: major
  test: 2
  root_cause: "recordToDisplayPoint() in map-points.ts hardcodes typeLabel: null and parentLabel: null because TravelRecord in packages/contracts/src/records.ts has no typeLabel/parentLabel fields. Saved points re-opened in view mode always have typeLabel=null. PointSummaryCard.vue gates the type-label pill on v-if=\"summaryTypeLabel\" — rendering logic is correct but value is always null for saved points."
  artifacts:
    - path: "packages/contracts/src/records.ts"
      issue: "TravelRecord interface missing typeLabel and parentLabel fields — root of the data gap"
    - path: "apps/web/src/stores/map-points.ts"
      issue: "recordToDisplayPoint() hardcodes typeLabel: null / parentLabel: null — no source field to read from"
  missing:
    - "Add typeLabel and parentLabel to TravelRecord in contracts"
    - "Add fields to CreateTravelRecordDto and server DB schema"
    - "Update recordToDisplayPoint to read typeLabel/parentLabel from TravelRecord"
    - "Ensure illuminate() action persists typeLabel/parentLabel when saving a point"
  debug_session: ".planning/debug/beijing-no-type-label.md"
- truth: "Clicking Hong Kong shows popup with type label 特别行政区 and parent region subtitle"
  status: failed
  reason: "User reported: 无标签、无副标题"
  severity: major
  test: 4
  root_cause: "Same root cause as Beijing: TravelRecord lacks typeLabel/parentLabel, so recordToDisplayPoint() hardcodes both to null for all saved points. This is a systematic gap affecting all canonical place types (CN_ADMIN and OVERSEAS_ADMIN1 alike). The server fixture for cn-hong-kong is correct (typeLabel: '特别行政区', parentLabel: '中国') — data is available at resolve time but lost on save."
  artifacts:
    - path: "packages/contracts/src/records.ts"
      issue: "TravelRecord missing typeLabel and parentLabel — same root as Beijing"
    - path: "apps/web/src/stores/map-points.ts"
      issue: "recordToDisplayPoint() hardcodes typeLabel: null / parentLabel: null"
  missing:
    - "Same fix as Beijing gap — adding typeLabel/parentLabel to TravelRecord and recordToDisplayPoint"
  debug_session: ".planning/debug/hk-no-type-label.md"
- truth: "Clicking California shows popup with type label State and parent region subtitle (United States)"
  status: failed
  reason: "User reported: 无法识别"
  severity: major
  test: 5
  root_cause: "findFixture() in canonical-places.service.ts uses ±0.0001° tolerance (~11 meters) to match click coordinates against a single registered point (36.7783, -119.4179). Any real map click on California differs by degrees, so server always returns OUTSIDE_SUPPORTED_DATA. LeafletMapStage falls back to client-side geo lookup (non-canonical, no typeLabel). Secondary: us-california fixture has typeLabel: '一级行政区' not 'State'."
  artifacts:
    - path: "apps/server/src/modules/canonical-places/canonical-places.service.ts"
      issue: "findFixture() tolerance ±0.0001° is ~11m — far too tight for real map clicks on a world-scale map"
    - path: "apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts"
      issue: "us-california fixture has typeLabel: '一级行政区' (wrong) not 'State'; single point coordinate cannot be hit by real user click"
    - path: "apps/web/src/components/LeafletMapStage.vue"
      issue: "handleMapClick silently degrades to non-canonical fallback on OUTSIDE_SUPPORTED_DATA — no canonical popup shown"
  missing:
    - "Change findFixture() to use bounding-box/polygon matching instead of point+tiny-radius"
    - "Fix us-california fixture typeLabel from '一级行政区' to 'State'"
    - "Ensure OUTSIDE_SUPPORTED_DATA fallback either shows a useful message or re-attempts with relaxed tolerance"
  debug_session: ".planning/debug/california-not-recognized.md"
