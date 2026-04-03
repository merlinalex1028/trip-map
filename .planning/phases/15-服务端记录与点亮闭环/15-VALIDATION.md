---
phase: 15
slug: 服务端记录与点亮闭环
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-31
updated: 2026-04-03
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `apps/web/vite.config.ts` / `apps/server/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test run` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test run`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-T1 | 01 | 1 | API-01 | e2e | `pnpm --filter @trip-map/server test run` | ✅ `apps/server/test/records-travel.e2e-spec.ts` | ✅ green |
| 15-01-T2 | 01 | 1 | API-02 | e2e | `pnpm --filter @trip-map/server test run` | ✅ `apps/server/test/records-travel.e2e-spec.ts` | ✅ green |
| 15-01-T3 | 01 | 1 | API-05 | unit | `pnpm --filter @trip-map/contracts build` | ✅ `packages/contracts/src/records.ts` | ✅ green |
| 15-02-T1 | 02 | 2 | API-01, API-05 | unit | `pnpm --filter @trip-map/web test run` | ✅ `apps/web/src/stores/map-points.spec.ts` | ✅ green |
| 15-02-T2 | 02 | 2 | MAP-07 | unit | `pnpm --filter @trip-map/web test run` | ✅ `apps/web/src/stores/map-points.spec.ts` | ✅ green |
| 15-03-T1 | 03 | 3 | UIX-02, UIX-03 | unit | `pnpm --filter @trip-map/web test run` | ✅ `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` | ✅ green |
| 15-03-T2 | 03 | 3 | UIX-05 | manual | n/a | n/a | ✅ passed |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/server/test/records-travel.e2e-spec.ts` — e2e tests covering API-01 (GET/POST/DELETE records), API-02 (duplicate 409, missing 400, unknown 404)
- [x] `apps/web/src/stores/map-points.spec.ts` — unit tests covering API-01 (bootstrap/create/delete), API-05 (localStorage removed), MAP-07 (savedBoundaryIds driven highlight)
- [x] `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — unit tests covering UIX-02 (illuminate button rendering), UIX-03 (illuminate/unilluminate state)

*All Wave 0 test files verified present and passing (129+ unit tests, 8 e2e tests).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Result | Verified |
|----------|-------------|------------|-------------------|--------|----------|
| 点亮后地图边界立即高亮，取消点亮后高亮立即消失 | MAP-07, UIX-03 | 需要真实浏览器渲染 Leaflet GeoJSON 图层 | 启动 dev server，点击已知城市，点击"点亮"，确认边界变高亮色；再点击"已点亮"，确认高亮消失 | ✅ PASS | 2026-04-01 |
| API 失败时 UI 回滚 | UIX-05 | 需要模拟网络错误 | 断开网络 / mock 失败后点击"点亮"，确认按钮状态回滚且 toast 出现 | ✅ PASS | 2026-04-01 |
| 旧 localStorage 数据在启动时静默消失 | API-05 | 需要手动设置旧 localStorage 状态 | 在 localStorage 写入旧格式数据，刷新页面，确认地图为空且无错误 | ✅ PASS | 2026-04-01 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Verification Summary**

| Category | Total | Passed | Pending |
|----------|-------|--------|---------|
| Automated (e2e + unit) | 7 | 7 | 0 |
| Wave 0 file stubs | 3 | 3 | 0 |
| Manual verifications | 3 | 3 | 0 |
| **Total** | **13** | **13** | **0** |

**Approval:** approved — 2026-04-03
