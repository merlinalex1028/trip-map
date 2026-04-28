---
phase: 27
slug: multi-visit-record-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-20
---

# Phase 27 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (全包统一) |
| **Config file** | `apps/web/vitest.config.ts` / `apps/server/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web test` (frontend) or `pnpm --filter @trip-map/server test` (backend)
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 27-01-01 | 01 | 0 | TRIP-01 | — | schema 迁移不丢失现有记录 | unit | `pnpm --filter @trip-map/server test` | ✅ | ✅ green |
| 27-01-02 | 01 | 0 | TRIP-01 | — | contracts TravelRecord 含日期字段 | unit | `pnpm --filter @trip-map/contracts build` | ✅ | ✅ green |
| 27-02-01 | 02 | 1 | TRIP-01 | — | create API 接受并保存日期字段 | unit | `pnpm --filter @trip-map/server test` | ✅ | ✅ green |
| 27-02-02 | 02 | 1 | TRIP-03 | — | bootstrap 返回带日期字段的记录 | unit | `pnpm --filter @trip-map/server test` | ✅ | ✅ green |
| 27-03-01 | 03 | 2 | TRIP-02 | — | store 不按 placeId 去重 travelRecords | unit | `pnpm --filter @trip-map/web test` | ✅ | ✅ green |
| 27-03-02 | 03 | 2 | TRIP-03 | — | displayPoints 按 placeId 聚合保持点亮 | unit | `pnpm --filter @trip-map/web test` | ✅ | ✅ green |
| 27-04-01 | 04 | 3 | TRIP-01 | — | 日期输入表单渲染并校验 D-03 约束 | unit | `pnpm --filter @trip-map/web test` | ✅ | ✅ green |
| 27-04-02 | 04 | 3 | TRIP-02 | — | popup 摘要展示"已去过 N 次 + 最近日期" | unit | `pnpm --filter @trip-map/web test` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/server/src/modules/records/records.service.spec.ts` — multi-visit create/import 桩（27-02-SUMMARY: 9 tests ✅）
- [x] `apps/server/src/modules/auth/auth.service.spec.ts` — bootstrap 日期字段桩（27-02-SUMMARY: 5 tests ✅）
- [x] `apps/web/src/stores/map-points.spec.ts` — placeId 聚合 / multi-record store 桩（27-03-SUMMARY: 35/35 ✅）
- [x] `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — 日期表单 + 摘要桩（27-04-SUMMARY: 49 tests ✅）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 跨设备同步后多条记录均可见 | TRIP-03 | 需真实多设备环境 | 设备 A 添加两条同地点记录，设备 B 刷新，验证均恢复 |
| "再记一次旅行"表单在 popup 内完成不跳页 | TRIP-01 | UI 行为，需视觉确认 | 点击已点亮地点 → 点击"再记" → 确认表单在 popup 内展开 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-28
