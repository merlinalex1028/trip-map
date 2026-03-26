---
phase: 09-popup
plan: 05
subsystem: ui
tags: [vue, popup, peek, scroll, gap-closure]
requires:
  - phase: 09-popup
    plan: 04
    provides: popup / peek shell scroll body、长内容可达性回归
provides:
  - Summary card middle scroll partition
  - Stable popup / peek footer actions
  - Validation coverage for middle-only scrolling
affects: [point-summary-card, popup-shell, mobile-peek, long-content-scroll, validation]
tech-stack:
  added: []
  patterns: [stable header-footer, middle scroll region, shell height constraint]
key-files:
  created:
    - .planning/phases/09-popup/09-popup-05-SUMMARY.md
  modified:
    - .planning/phases/09-popup/09-VALIDATION.md
    - src/components/map-popup/PointSummaryCard.vue
    - src/components/map-popup/PointSummaryCard.spec.ts
    - src/components/map-popup/MapContextPopup.vue
    - src/components/map-popup/MapContextPopup.spec.ts
    - src/components/map-popup/MobilePeekSheet.vue
    - src/components/map-popup/MobilePeekSheet.spec.ts
    - src/components/WorldMapStage.spec.ts
requirements-completed: [POP-01, POP-03]
completed: 2026-03-26
---

# Phase 09 Plan 05: Popup Middle Scroll Summary

## Accomplishments

- 把 `PointSummaryCard.vue` 从单层流式卡片重构成稳定的 `header + content + footer` 分区，其中新增 `point-summary-card__scroll-region` 承接候选列表、说明文本和 notice，滚动边界从 popup / peek 壳层收回到摘要卡中部内容区。
- 保留 `PointSummaryCard` 既有的三态动作和 inline destructive confirm，但将动作区与 confirm row 一并收束到稳定的 `point-summary-card__footer`，让 `查看详情`、`按国家/地区继续记录`、`删除地点` 等动作在长内容滚动时保持可见。
- 将 `MapContextPopup.vue` 与 `MobilePeekSheet.vue` 的 body 调整为纯高度约束容器，不再承担整卡 `overflow-y: auto`，从而保持 anchored popup / mobile peek 的壳层职责不变。
- 扩展 `PointSummaryCard.spec.ts`、`MapContextPopup.spec.ts`、`MobilePeekSheet.spec.ts`、`WorldMapStage.spec.ts`，锁住“中部 scroll-region 承载长内容、footer 独立存在”的新契约，并把 `09-VALIDATION.md` 中的 `9-05-01` 标记为 green。

## Verification

- `pnpm test -- src/components/map-popup/PointSummaryCard.spec.ts src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/MobilePeekSheet.spec.ts src/components/WorldMapStage.spec.ts`
- `pnpm build`

## Notes

- 本次没有改动 Phase 09 已锁定的 `popup / peek summary` 与 `drawer deep detail/edit` 分工，只修正滚动边界，避免再次引入“整张 popup 一起滚”的体验。
- 构建仍然提示主 bundle 体积较大，这是项目已有告警，本次 gap closure 未处理分包策略。

## Outcome

- 长内容场景下，popup / peek 只在 `PointSummaryCard` 中部内容区滚动，头部身份信息与底部动作保持稳定。
- Wave 5 的最后一个 Phase 09 gap closure 已具备自动化验证证据，可以继续进入 phase-level verify / completion 流程。
