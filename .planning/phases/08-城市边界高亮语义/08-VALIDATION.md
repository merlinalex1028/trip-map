---
phase: 08
slug: 城市边界高亮语义
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-25
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Vue Test Utils |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- src/stores/map-points.spec.ts src/components/WorldMapStage.spec.ts` |
| **Full suite command** | `pnpm test && pnpm build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- src/stores/map-points.spec.ts src/components/WorldMapStage.spec.ts`
- **After every plan wave:** Run `pnpm test && pnpm build`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | BND-02, DAT-06 | service | `pnpm test -- src/services/city-boundaries.spec.ts` | ✅ `src/services/city-boundaries.spec.ts` | ✅ green |
| 08-01-02 | 01 | 1 | DAT-06 | service | `pnpm test -- src/services/point-storage.spec.ts` | ✅ `src/services/point-storage.spec.ts` | ✅ green |
| 08-02-01 | 02 | 2 | BND-03, DAT-06 | store | `pnpm test -- src/stores/map-points.spec.ts` | ✅ `src/stores/map-points.spec.ts` | ✅ green |
| 08-02-02 | 02 | 2 | BND-01, BND-03 | component | `pnpm test -- src/components/WorldMapStage.spec.ts src/components/SeedMarkerLayer.spec.ts` | ✅ `src/components/WorldMapStage.spec.ts`, ✅ `src/components/SeedMarkerLayer.spec.ts` | ✅ green |
| 08-03-01 | 03 | 3 | BND-02, DAT-06 | integration | `pnpm test -- src/services/point-storage.spec.ts src/stores/map-points.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ `src/services/point-storage.spec.ts`, ✅ `src/stores/map-points.spec.ts`, ✅ `src/components/PointPreviewDrawer.spec.ts` | ✅ green |
| 08-03-02 | 03 | 3 | BND-03 | integration | `pnpm test -- src/components/WorldMapStage.spec.ts src/stores/map-points.spec.ts src/App.spec.ts && pnpm build` | ✅ `src/components/WorldMapStage.spec.ts`, ✅ `src/stores/map-points.spec.ts`, ✅ `src/App.spec.ts` | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Status

- [x] `src/services/city-boundaries.spec.ts` — 已覆盖边界数据查询、多面域规范化和 `boundaryId` / `cityId` 回退测试
- [x] `src/data/geo/city-boundaries.geo.json` — 已落地最小真实城市边界样本数据，包含 `boundaryId`、`cityId`、`datasetVersion`
- [x] `src/components/WorldMapStage.spec.ts` 扩展 — 已覆盖保存弱高亮、当前强化态、fallback 不亮边界、多面域回归

*Wave 0 依赖已全部完成，后续三个计划都在其上完成实现与回归。*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 已保存弱高亮与当前选中强化态在桌面和移动端都清晰但不过载 | BND-01, BND-03 | 视觉层级强弱难仅靠 DOM 断言评估 | 分别打开一个已保存城市和一个当前选中城市，观察边界填充/描边差异是否稳定易辨认 |
| 多面域城市整体点亮像同一城市而不是几块零散补丁 | BND-01 | 多面域视觉连贯性需要人工观察 | 准备一个岛屿或飞地城市样本，确认所有面域一起亮且层级一致 |
| 关闭面板、切换城市、fallback 继续记录时无边界残留 | BND-03 | 真实交互节奏与视觉残影需要人工确认 | 连续执行“打开城市 A -> 切到城市 B -> 关闭 -> fallback 继续记录”，确认地图上没有错误强高亮残留 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** passed

## Final Verification Snapshot

- `08-01`: 离线边界资产、查询服务与持久化兼容层已完成，并有 summary 记录
- `08-02`: store 边界派生态与地图 SVG 边界图层已完成，并有 summary 记录
- `08-03`: restore / reopen / switch / close / fallback / multi-area 回归已完成，并通过 `pnpm build`
- See also:
  - `08-01-SUMMARY.md`
  - `08-02-SUMMARY.md`
  - `08-03-SUMMARY.md`
  - `08-VERIFICATION.md`
