---
phase: 03
slug: 点位闭环与本地持久化
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-24
---

# Phase 03 — Validation Strategy

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
| 03-01-01 | 01 | 1 | PNT-01 | store | `pnpm test -- src/stores/map-points.spec.ts` | ✅ `src/stores/map-points.spec.ts` | ✅ green |
| 03-01-02 | 01 | 1 | MAP-03,PNT-05 | regression | `pnpm test -- src/stores/map-points.spec.ts src/App.spec.ts` | ✅ `src/stores/map-points.spec.ts`, `src/App.spec.ts` | ✅ moved to Phase 05 closure |
| 03-02-01 | 02 | 2 | DRW-03,PNT-02 | component | `pnpm test -- src/components/PointPreviewDrawer.spec.ts` | ✅ `src/components/PointPreviewDrawer.spec.ts` | ✅ green |
| 03-02-02 | 02 | 2 | PNT-03 | component | `pnpm test -- src/components/PointPreviewDrawer.spec.ts src/App.spec.ts` | ✅ `src/components/PointPreviewDrawer.spec.ts`, `src/App.spec.ts` | ✅ green |
| 03-03-01 | 03 | 3 | DAT-03 | unit | `pnpm test -- src/services/point-storage.spec.ts` | ✅ `src/services/point-storage.spec.ts` | ✅ green |
| 03-03-02 | 03 | 3 | DAT-02 | integration | `pnpm test -- src/services/point-storage.spec.ts src/App.spec.ts` | ✅ `src/services/point-storage.spec.ts`, `src/App.spec.ts` | ✅ green |

*Status: ✅ green · ⚠️ delegated to Phase 05 gap closure*

---

## Wave 0 Requirements

- [x] `src/stores/map-points.spec.ts` — 覆盖草稿创建、保存、删除和 seed 隐藏
- [x] `src/components/PointPreviewDrawer.spec.ts` — 覆盖识别预览 / 查看 / 编辑三种模式与确认逻辑
- [x] `src/services/point-storage.spec.ts` — 覆盖版本化快照、合并规则和损坏存档提示

*`MAP-03` 与 `PNT-05` 的真实断口已在 Phase 05 通过正式 verification 关闭，因此不再作为本 phase 的未完成 Wave 0 项。*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 草稿点、已保存点、选中点的视觉差异足够清晰 | PNT-01,PNT-02 | 视觉层级和氛围感难以可靠自动断言 | 点击地图创建草稿、保存后再次选中，确认三种状态都可辨认 |
| 抽屉新增按钮和表单后仍不压垮地图主舞台 | DRW-03 | 布局密度和地图主导感需要人工判断 | 在桌面和移动视口分别打开抽屉，确认地图仍是主角 |
| 本地存档异常提示既明显又不过度打断地图 | DAT-02,DAT-03 | 语气、位置和压迫感需要人工评估 | 手动写入损坏快照后刷新页面，确认提示清晰且可执行 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
