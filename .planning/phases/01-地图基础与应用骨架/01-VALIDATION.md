---
phase: 01
slug: 地图基础与应用骨架
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 01 — Validation Strategy

> Retrofitted per-phase validation contract for milestone-grade audit evidence.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Vue Test Utils |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test && pnpm build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run focused specs for the affected shell / drawer / marker surface
- **After every plan wave:** Run `pnpm test`
- **Before milestone audit consumption:** Ensure all mapped spec files still exist and pass
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | MAP-01 | component | `pnpm test -- src/App.spec.ts` | ✅ | ✅ green |
| 01-01-02 | 01 | 1 | DRW-01, DRW-02 | component | `pnpm test -- src/App.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ | ✅ green |
| 01-02-01 | 02 | 1 | MAP-01, MAP-02 | component | `pnpm test -- src/components/SeedMarkerLayer.spec.ts` | ✅ | ✅ green |
| 01-02-02 | 02 | 1 | DAT-01 | integration | `pnpm test -- src/App.spec.ts` | ✅ | ✅ green |
| 01-03-01 | 03 | 2 | DRW-01, DRW-02 | component | `pnpm test -- src/components/PointPreviewDrawer.spec.ts` | ✅ | ✅ green |
| 01-03-02 | 03 | 2 | MAP-01, MAP-02 | component | `pnpm test -- src/App.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/App.spec.ts` — 覆盖应用壳层、地图区域存在性与基础 seed/存储读取入口
- [x] `src/components/SeedMarkerLayer.spec.ts` — 覆盖点位渲染、标签显隐与选中层级语义
- [x] `src/components/PointPreviewDrawer.spec.ts` — 覆盖抽屉 dialog 语义、关闭行为与桌面/移动共用容器交互

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 海报式地图首页在桌面和移动端都保持地图主视觉 | MAP-01 | 视觉氛围与版式比例难以完全自动断言 | 打开页面，确认标题、地图舞台与抽屉容器排布自然 |
| 常驻标签数量保持低噪声，不会把地图铺满 | MAP-02 | 视觉密度依赖主观判断 | 检查首页默认点位标签数量和分布是否克制 |
| 抽屉关闭后地图重新成为视觉主角 | DRW-01, DRW-02 | 关闭后的空间感需人工感知 | 打开并关闭任意点位，确认不会残留异常空白或遮挡 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or concrete mapped spec coverage
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all mapped references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-24
