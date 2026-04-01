---
phase: 15
slug: 服务端记录与点亮闭环
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
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
| 15-01-T1 | 01 | 1 | API-01 | unit | `pnpm --filter @trip-map/server test run` | ❌ W0 | ⬜ pending |
| 15-01-T2 | 01 | 1 | API-02 | unit | `pnpm --filter @trip-map/server test run` | ❌ W0 | ⬜ pending |
| 15-01-T3 | 01 | 1 | API-05 | unit | `pnpm --filter @trip-map/contracts test run` | ❌ W0 | ⬜ pending |
| 15-02-T1 | 02 | 2 | API-01, API-05 | unit | `pnpm --filter @trip-map/web test run` | ❌ W0 | ⬜ pending |
| 15-02-T2 | 02 | 2 | MAP-07 | unit | `pnpm --filter @trip-map/web test run` | ❌ W0 | ⬜ pending |
| 15-03-T1 | 03 | 3 | UIX-02, UIX-03 | unit | `pnpm --filter @trip-map/web test run` | ❌ W0 | ⬜ pending |
| 15-03-T2 | 03 | 3 | UIX-05 | manual | n/a | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/server/src/modules/records/records.service.spec.ts` — stubs for API-01, API-02
- [ ] `apps/web/src/stores/travel-records.spec.ts` — stubs for API-01, API-05, MAP-07
- [ ] `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — stubs for UIX-02, UIX-03

*Existing test infrastructure covers Vitest/jest; only stub files need to be added.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 点亮后地图边界立即高亮，取消点亮后高亮立即消失 | MAP-07, UIX-03 | 需要真实浏览器渲染 Leaflet GeoJSON 图层 | 启动 dev server，点击已知城市，点击"点亮"，确认边界变高亮色；再点击"已点亮"，确认高亮消失 |
| API 失败时 UI 回滚 | UIX-05 | 需要模拟网络错误 | 断开网络 / mock 失败后点击"点亮"，确认按钮状态回滚且 toast 出现 |
| 旧 localStorage 数据在启动时静默消失 | API-05 | 需要手动设置旧 localStorage 状态 | 在 localStorage 写入旧格式数据，刷新页面，确认地图为空且无错误 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
