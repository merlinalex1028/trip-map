---
phase: 10
slug: cute-readability-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (`happy-dom`) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts`
- **After every plan wave:** Run `npm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | VIS-01 | component | `npm test -- src/App.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/PointPreviewDrawer.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/WorldMapStage.spec.ts` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | VIS-02 | component | `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts` | ✅ | ⬜ pending |
| 10-02-01 | 02 | 2 | VIS-03 | component | `npm test -- src/components/WorldMapStage.spec.ts src/components/SeedMarkerLayer.spec.ts src/components/map-popup/MapContextPopup.spec.ts` | ✅ | ⬜ pending |
| 10-02-02 | 02 | 2 | VIS-01, VIS-02, VIS-03 | full suite | `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/SeedMarkerLayer.spec.ts` — 补四状态语义钩子与动效预算断言
- [ ] `src/components/map-popup/PointSummaryCard.spec.ts` — 补 fallback notice、saved hint、selected CTA 样式钩子一致性断言
- [ ] `src/components/WorldMapStage.spec.ts` — 补 overlay 惰性层、boundary 装饰不干扰点击的断言
- [ ] `docs/manual/phase-10-visual-qa.md` 或等效检查清单 — 补人工视觉/可读性 QA 步骤

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 暖粉/淡蓝主视觉在真实界面中仍保持清晰层级，不因纹理、贴纸感和圆角收口而显得过花或过糊 | VIS-01 | 当前无像素级视觉回归，也无自动化设计对比 | 1. 启动应用并依次查看标题区、地图舞台、marker、popup、drawer。 2. 确认这些表面共享同一套暖粉/淡蓝 + 圆角语言。 3. 确认没有组件仍停留在旧复古土棕主色。 |
| 未记录、已记录、当前选中、低置信回退四态在地图与摘要表面中都能一眼区分 | VIS-02 | 自动化可断言语义钩子，但不能完全替代真实视觉辨识度检查 | 1. 触发未记录、已记录、当前选中、低置信回退四种状态。 2. 检查 marker、boundary、notice、CTA 与 badge 是否至少用两种 cue 区分。 3. 确认 selected 与 saved 不共享同一 halo 或边框语义。 |
| 装饰层、动效和圆角视觉件不会破坏地图点击、marker 点击和 popup 操作 | VIS-03 | 命中层和视觉覆盖问题在真实交互中最容易暴露 | 1. 连续点击地图空白区、marker、popup CTA 和 drawer 操作按钮。 2. 确认不会出现误点、点穿、装饰遮挡或 hover 区域异常。 3. 在 `prefers-reduced-motion` 环境下复查一次，确认核心状态仍可辨。 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
