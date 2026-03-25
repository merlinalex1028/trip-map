---
phase: 07
slug: 城市选择与兼容基线
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 07 — Validation Strategy

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
| 07-01-01 | 01 | 1 | DEST-01, DEST-04 | unit | `pnpm test -- src/services/geo-lookup.spec.ts` | ✅ `src/services/geo-lookup.spec.ts` | ⬜ pending |
| 07-01-02 | 01 | 1 | DEST-05, DAT-05 | integration | `pnpm test -- src/services/point-storage.spec.ts src/stores/map-points.spec.ts` | ✅ `src/services/point-storage.spec.ts`, `src/stores/map-points.spec.ts` | ⬜ pending |
| 07-02-01 | 02 | 2 | DEST-01, DEST-02, DEST-04 | component | `pnpm test -- src/components/WorldMapStage.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ `src/components/WorldMapStage.spec.ts`, `src/components/PointPreviewDrawer.spec.ts` | ⬜ pending |
| 07-02-02 | 02 | 2 | DEST-03, DEST-05, DAT-05 | component | `pnpm test -- src/components/WorldMapStage.spec.ts src/components/PointPreviewDrawer.spec.ts src/App.spec.ts` | ✅ `src/components/WorldMapStage.spec.ts`, `src/components/PointPreviewDrawer.spec.ts`, `src/App.spec.ts` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/geo-lookup.spec.ts` — 扩展候选排序、低置信候选和稳定 `cityId` 断言
- [ ] `src/services/point-storage.spec.ts` / `src/stores/map-points.spec.ts` — 扩展旧快照兼容与城市复用索引断言
- [ ] `src/components/PointPreviewDrawer.spec.ts` — 新增候选先行面板、轻量搜索框、回退主动作和复用提示断言
- [ ] `src/components/WorldMapStage.spec.ts` / `src/App.spec.ts` — 扩展点击 -> 候选 -> 复用 / 回退的交互回归

*现有测试基础可复用，但需要补齐候选流和兼容语义的断言后才能把本阶段标为 Nyquist compliant。*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 候选先行面板在桌面和移动端都保持“轻确认”而不是挤成结果页 | DEST-02, DEST-04 | 信息密度和阅读节奏难以仅靠 DOM 断言判断 | 在桌面与移动端分别触发高置信、低置信和同名候选场景，确认默认最多 3 个候选且搜索框存在 |
| 无可靠城市时，“按国家/地区继续记录”足够显眼且解释清楚 | DEST-03 | 主动作显著性与文案理解成本需要人工判断 | 触发仅国家/地区成功的点击，确认主动作是回退继续记录，文案说明明确 |
| 复用已有城市记录时的轻提示既说明原因又不打断操作 | DEST-05 | 提示强度是否“轻”需要人工体验 | 从地图点击和搜索两条入口分别命中同一已记录城市，确认都直接打开旧记录并给轻提示 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
