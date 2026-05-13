---
phase: "44-world-footprints-map-footprint-date-dialog"
plan: "04"
subsystem: "web-map-popup"
tags:
  - "phase-44"
  - "footprint-date-dialog"
  - "calendar"
requires:
  - "44-01"
  - "44-02"
provides:
  - "DATE-01"
  - "DATE-02"
  - "DATE-03"
  - "DATE-04"
  - "DATE-06"
affects:
  - "apps/web/src/types/map-point.ts"
  - "apps/web/src/components/map-popup/FootprintDateDialog.vue"
  - "apps/web/src/components/map-popup/FootprintDateDialog.spec.ts"
tech_stack:
  - "Vue 3"
  - "TypeScript"
  - "shadcn-vue Dialog"
  - "shadcn-vue Calendar"
key_files:
  created:
    - "apps/web/src/components/map-popup/FootprintDateDialog.vue"
  modified:
    - "apps/web/src/types/map-point.ts"
    - "apps/web/src/components/map-popup/FootprintDateDialog.spec.ts"
decisions:
  - "Dialog 使用本地 shadcn-vue Dialog/Calendar primitive，并由父层通过 open/update:open 受控。"
  - "日期提交统一使用 CalendarDate.toString() 输出 YYYY-MM-DD，避免 locale/timezone 漂移。"
  - "单日日期作为默认模型，结束日期保留为次级可选输入，并在早于开始日期时禁止提交。"
metrics:
  completed_at: "2026-05-13T08:56:22Z"
---

# Phase 44 Plan 04: Footprint Date Dialog Summary

独立足迹日期弹窗已落地，包含地点快照展示、4 个快捷日期、完整 Calendar、取消/提交/提交中/失败状态，以及 `YYYY-MM-DD` payload 序列化。

## Completed Work

- 在 `apps/web/src/types/map-point.ts` 新增 `FootprintPlaceSnapshot`，为弹窗提供冻结后的地点展示契约。
- 新建 `apps/web/src/components/map-popup/FootprintDateDialog.vue`，接入本地 `Dialog` / `Calendar` primitive、插画区、快捷日期、可选结束日期、失败提示和提交中关闭保护。
- 更新 `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts`，使 focused 用例覆盖快照渲染、快捷日期、单日 payload、失败保持状态、范围校验、取消和提交中状态。

## Verification

- `rg -n "export interface FootprintPlaceSnapshot|placeId: string|displayName: string|regionSystem: 'CN' \\| 'OVERSEAS'" apps/web/src/types/map-point.ts`
  - 通过
- `rg -n "@/components/ui/dialog|@/components/ui/calendar|footprint-dialog-girl.webp|data-region=\\\"footprint-date-dialog\\\"|data-footprint-place-name|DialogTitle|DialogDescription|留下足迹" apps/web/src/components/map-popup/FootprintDateDialog.vue`
  - 通过
- `rg -n "data-footprint-shortcut=\\\"today\\\"|data-footprint-shortcut=\\\"tomorrow\\\"|data-footprint-shortcut=\\\"weekend\\\"|data-footprint-shortcut=\\\"custom\\\"|今天|明天|本周末|其他日期" apps/web/src/components/map-popup/FootprintDateDialog.vue`
  - 通过
- `rg -n "today\\(|getLocalTimeZone|toString\\(\\)|data-footprint-calendar=\\\"true\\\"|data-footprint-submit=\\\"true\\\"|结束日期不能早于开始日期。" apps/web/src/components/map-popup/FootprintDateDialog.vue`
  - 通过
- `rg -n "data-footprint-cancel=\\\"true\\\"|保存足迹|正在保存\\.\\.\\.|data-footprint-error=\\\"true\\\"|role=\\\"alert\\\"|足迹暂时没有保存成功，请检查网络后重试。" apps/web/src/components/map-popup/FootprintDateDialog.vue`
  - 通过
- `pnpm --filter @trip-map/web test -- src/components/map-popup/FootprintDateDialog.spec.ts`
  - 通过，7/7 tests passed
- `pnpm --filter @trip-map/web build`
  - 未通过。阻塞来自既有文件 `apps/web/src/components/map-popup/MapContextPopup.spec.ts` 与 `apps/web/src/components/SeedMarkerLayer.spec.ts` 的 `.exists()` 类型错误；本计划新增组件已无 `vue-tsc` 错误

## Deviations from Plan

None - 计划要求的 Dialog/Calendar、快捷日期、状态反馈和 focused spec 均已完成。

## Known Stubs

None.

## Threat Flags

None.

## Deferred Issues

- `pnpm --filter @trip-map/web build` 仍被与本计划无关的旧测试文件类型错误阻塞：
  - `apps/web/src/components/map-popup/MapContextPopup.spec.ts`
  - `apps/web/src/components/SeedMarkerLayer.spec.ts`

## Self-Check: PASSED

- `apps/web/src/components/map-popup/FootprintDateDialog.vue` exists
- `apps/web/src/components/map-popup/FootprintDateDialog.spec.ts` exists
- `apps/web/src/types/map-point.ts` contains `FootprintPlaceSnapshot`
- `.planning/phases/44-world-footprints-map-footprint-date-dialog/44-04-SUMMARY.md` created
