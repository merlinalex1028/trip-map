---
phase: 09-popup
plan: 04
subsystem: ui
tags: [vue, popup, peek, scroll, gap-closure]
requires:
  - phase: 09-popup
    plan: 03
    provides: mobile peek fallback、deep-drawer-only layout、summary/deep handoff contract
provides:
  - Popup / peek dedicated scroll body containers
  - Long-content reachability regression coverage
  - Gap-only execution record aligned with Phase 09 context
affects: [popup-shell, mobile-peek, long-content-scroll, verification]
tech-stack:
  added: []
  patterns: [scroll-body partition, fixed shell plus scroll content, gap-only closure]
key-files:
  created:
    - .planning/phases/09-popup/09-popup-04-SUMMARY.md
  modified:
    - .planning/phases/09-popup/09-04-PLAN.md
    - .planning/phases/09-popup/09-VALIDATION.md
    - src/components/map-popup/MapContextPopup.vue
    - src/components/map-popup/MapContextPopup.spec.ts
    - src/components/map-popup/MobilePeekSheet.vue
    - src/components/map-popup/MobilePeekSheet.spec.ts
    - src/components/WorldMapStage.spec.ts
requirements-completed: [POP-01, POP-03]
completed: 2026-03-26
---

# Phase 09 Plan 04: Popup And Peek Scroll Fix Summary

## Accomplishments

- 将 `.planning/phases/09-popup/09-04-PLAN.md` 收缩为真正可执行的 gap closure，只保留 popup / peek 长内容滚动修复，并显式保留 “summary in popup/peek, deep detail/edit in drawer” 的既有契约。
- 在 `MapContextPopup.vue` 中新增 `map-context-popup__body`，把外层 shell 调整为“定位/语义负责，body 负责滚动”的结构，使 `usePopupAnchoring` 注入的 `maxHeight` 能真正转化为内部可滚动区域。
- 在 `MobilePeekSheet.vue` 中新增 `mobile-peek-sheet__body`，保留顶部 `关闭` 控件，并把 safe-area 底部留白收进可滚动区域，避免长内容把底部动作裁切成不可达状态。
- 补充 `MapContextPopup.spec.ts`、`MobilePeekSheet.spec.ts`、`WorldMapStage.spec.ts` 的长内容回归，锁住 popup / peek shell 结构与地图语境内的动作可达性。

## Verification

- `pnpm test -- src/components/map-popup/MapContextPopup.spec.ts src/components/map-popup/MobilePeekSheet.spec.ts src/components/WorldMapStage.spec.ts`
- `pnpm build`

## Notes

- 本次只执行真实可落地的滚动缺陷修复；UAT 中“所有 drawer 都改成 popup”的反馈没有作为执行项实现，因为它会推翻 Phase 09 已锁定的 summary/deep split，需要重新回到 discuss/context 层做产品决策。
- 构建仍提示主 bundle 体积较大，这是项目既有告警，本次未处理 code splitting。

## Outcome

- Popup 与 peek 在长内容场景下都具备独立 scroll body，底部动作恢复可达。
- Phase 09 的 popup-summary + drawer-deep 分工保持不变，可以继续进入后续 verify / UAT 收口，而不会因为 gap closure 反向破坏既有上下文边界。
