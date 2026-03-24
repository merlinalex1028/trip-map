---
phase: 04
slug: 可用性打磨与增强能力
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

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

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test && pnpm build`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PNT-04, UX-01 | component | `pnpm test -- src/components/SeedMarkerLayer.spec.ts` | ✅ `src/components/SeedMarkerLayer.spec.ts` | ✅ green |
| 04-01-02 | 01 | 1 | DRW-04, UX-02 | component | `pnpm test -- src/components/PointPreviewDrawer.spec.ts src/App.spec.ts` | ✅ `src/components/PointPreviewDrawer.spec.ts`, `src/App.spec.ts` | ✅ green |
| 04-02-01 | 02 | 2 | DAT-04 | integration | `pnpm test -- src/services/point-storage.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` | ✅ `src/services/point-storage.spec.ts`, `src/stores/map-points.spec.ts`, `src/App.spec.ts` | ✅ green |
| 04-02-02 | 02 | 2 | GEO-04, UX-03 | component | `pnpm test -- src/components/WorldMapStage.spec.ts src/services/geo-lookup.spec.ts` | ✅ `src/components/WorldMapStage.spec.ts`, `src/services/geo-lookup.spec.ts` | ✅ green |

*Status: ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/components/SeedMarkerLayer.spec.ts` — 覆盖点位 focus、selected、label 显隐和键盘触发语义
- [x] `src/components/PointPreviewDrawer.spec.ts` 扩展 — 覆盖 `Esc`、focus trap、长文本滚动区和更明显关闭按钮
- [x] `src/stores/map-points.spec.ts` / `src/services/point-storage.spec.ts` 扩展 — 覆盖城市级高置信结果持久化与国家级回退兼容

*现有自动化覆盖已经足以支撑 Phase 4 的 Nyquist 汇总，不再保留 Wave 0 占位。*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 普通点位、选中点位和草稿点位的层级差异足够清晰但不破坏地图主视觉 | PNT-04, UX-01 | 视觉层级与海报氛围很难仅靠 DOM 断言判断 | 在桌面与移动端分别创建草稿、保存并重新选中，确认三种状态可辨认且不过度刺眼 |
| 移动端查看态/编辑态高度稳定，长简介与固定操作区配合自然 | DRW-04, UX-02 | 软键盘与真实视口高度行为需要人工观察 | 在移动端窄视口打开长简介点位、进入编辑态，确认内容区滚动正常且操作区可达 |
| 城市级未命中时的回退说明足够清楚且不打断国家级保存流程 | GEO-04 | 文案语气与用户理解成本需要人工判断 | 触发一个仅国家级成功的场景，确认抽屉说明能解释回退且用户仍能正常保存 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-24
