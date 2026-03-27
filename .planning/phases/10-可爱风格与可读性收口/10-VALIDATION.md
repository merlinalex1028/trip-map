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
| 10-01-01 | 01 | 1 | VIS-02 | docs + component contract | `rg -n '当前桌面 anchored popup \+ deep drawer 主链路|docs/manual/phase-10-visual-qa.md|10-03-02' .planning/phases/10-可爱风格与可读性收口/10-VALIDATION.md` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | VIS-01, VIS-02, VIS-03 | manual QA checklist | `rg -n '统一风格|四态辨识|交互命中|减少动态效果|未记录|已记录|当前选中|低置信回退|pointer-events: none|prefers-reduced-motion' docs/manual/phase-10-visual-qa.md` | ✅ | ⬜ pending |
| 10-02-01 | 02 | 2 | VIS-01, VIS-02 | component | `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts` | ✅ | ⬜ pending |
| 10-02-02 | 02 | 2 | VIS-02, VIS-03 | component | `npm test -- src/components/SeedMarkerLayer.spec.ts src/components/WorldMapStage.spec.ts src/App.spec.ts` | ✅ | ⬜ pending |
| 10-03-01 | 03 | 3 | VIS-01, VIS-02 | component | `npm test -- src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/PointPreviewDrawer.spec.ts` | ✅ | ⬜ pending |
| 10-03-02 | 03 | 3 | VIS-01, VIS-02, VIS-03 | full suite | `npm test` | ✅ | ⬜ pending |

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
| 当前桌面 anchored popup + deep drawer 主链路在标题区、地图舞台、popup 和 drawer 上共享统一暖粉/淡蓝/圆角风格 | VIS-01 | 当前无像素级视觉回归，也无自动化设计对比 | 1. 按 `docs/manual/phase-10-visual-qa.md` 的 `统一风格` 小节执行。 2. 仅检查当前桌面 anchored popup + deep drawer 主链路，不引入 `MobilePeekSheet`、safe-area 或其他移动端壳层预期。 3. 确认主要表面均已消费共享 token，而不是各自漂移。 |
| 未记录、已记录、当前选中、低置信回退四态在当前桌面 anchored popup + deep drawer 主链路中仍可一眼区分 | VIS-02 | 自动化可断言语义钩子，但不能完全替代真实视觉辨识度检查 | 1. 按 `docs/manual/phase-10-visual-qa.md` 的 `四态辨识` 小节逐项核对。 2. 检查 marker、boundary、notice、CTA 与 badge 是否至少用两种 cue 区分。 3. 确认 selected / saved / fallback / neutral 的语义在 popup 与 drawer 上一致。 |
| 装饰层、动效和圆角视觉件不会破坏地图点击、marker 点击和 popup 操作，且 reduced-motion 仍保持清晰辨识 | VIS-03 | 命中层和视觉覆盖问题在真实交互中最容易暴露 | 1. 按 `docs/manual/phase-10-visual-qa.md` 的 `交互命中` 与 `减少动态效果` 小节执行。 2. 重点确认所有装饰层保持 `pointer-events: none`。 3. 在 `prefers-reduced-motion` 环境下复查一次当前桌面 anchored popup + deep drawer 主链路。 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
