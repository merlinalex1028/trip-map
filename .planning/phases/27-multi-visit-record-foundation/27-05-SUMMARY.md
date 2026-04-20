---
phase: 27-multi-visit-record-foundation
plan: 05
subsystem: ui
tags: [frontend, vue, vitest, gap-closure, popup, trip-summary]
requires:
  - phase: 27-multi-visit-record-foundation
    provides: 27-04 已把 popup 摘要 `tripCount/latestTripLabel` 和 illuminate-actions 测试基座接到 LeafletMapStage
provides:
  - `activePointLatestTripLabel` 按 `endDate ?? startDate` 选择真正最近一次旅行
  - `LeafletMapStage.spec.ts` 回归覆盖“后录入但旅行时间更早”的补录场景
affects: [verification, popup-ux, trip-summary]
tech-stack:
  added: []
  patterns:
    - LeafletMapStage 的最近一次摘要只从 `startDate !== null` 的 trip 记录中派生，排序键为 `endDate ?? startDate`
    - Vitest 回归测试通过真实挂载组件和 Pinia store 注入，断言用户可见摘要而不是内部实现细节
key-files:
  created:
    - .planning/phases/27-multi-visit-record-foundation/27-05-SUMMARY.md
  modified:
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
key-decisions:
  - "修复严格收敛在 `LeafletMapStage.vue` 的 `activePointLatestTripLabel` computed 内部，不改 store、popup props 或服务端"
  - "继续使用 `YYYY-MM-DD` 字符串字典序比较 `endDate ?? startDate`，避免引入 Date 对象和时区副作用"
patterns-established:
  - "最近一次旅行摘要以旅行日期为准，而不是录入时间；未知日期记录不参与排序，只在全为空时回退为 null"
  - "关于摘要语义的回归测试放在 `describe('illuminate actions')` 中，直接覆盖 popup 上的用户可见文案"
requirements-completed: [TRIP-01, TRIP-03]
duration: 6m
completed: 2026-04-20
---

# Phase 27 Plan 05: Multi-Visit Record Foundation Summary

**LeafletMapStage 的“最近一次”摘要已从 `createdAt` 切换为 `endDate ?? startDate` 选取，并有回归测试兜住补录旧旅行的错误排序**

## Performance

- **Duration:** 6m
- **Started:** 2026-04-20T09:56:51Z
- **Completed:** 2026-04-20T10:02:21Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- 在 `apps/web/src/components/LeafletMapStage.spec.ts` 增加 `selects the latest trip by travel date, not by createdAt (VERIFICATION gap close)` 回归用例，先证明旧 selector 会错误显示 `2025-05-01 - 2025-05-05`。
- 在 `apps/web/src/components/LeafletMapStage.vue` 把 `activePointLatestTripLabel` 的选择逻辑从按 `createdAt` 改为按 `endDate ?? startDate` 的字典序降序，并忽略 `startDate === null` 的未知日期记录。
- 跑通 `@trip-map/web` 的类型检查、定向 spec 和全量 Vitest，确认本次 gap closure 没有伤到既有 popup、多次去访和 store 相关行为。

## Selector Diff 要点

- 修复前: `activePointLatestTripLabel` 从真实记录中按 `record.createdAt` 降序取首条，因此“后录入但更早的旅行”会被错误显示成“最近一次”。
- 修复后: selector 先保留 `pending-` 过滤，再只从 `startDate !== null` 的记录里计算 `getLatestTripSortKey(record) = record.endDate ?? record.startDate`，按该 key 降序取首条。
- 回退语义: 如果当前地点所有真实记录都是未知日期，则 computed 返回 `null`，继续让 UI 层显示“日期未知”。

## Regression Coverage

- 新增用例: `selects the latest trip by travel date, not by createdAt (VERIFICATION gap close)`
- 验证行为:
  - 同一地点有两条真实记录时，摘要总次数仍显示 `已去过 2 次`
  - 即使 `2025-05-01 - 2025-05-05` 是后录入记录，只要另一条旅行日期 `2025-10-01` 更晚，popup 摘要仍必须展示 `2025-10-01`
  - 该用例在修复前 RED，修复后 GREEN，直接对应 `27-VERIFICATION.md` 中 truth #10 的 blocker gap

## Testing And Verification

- `pnpm --filter @trip-map/web test --run src/components/LeafletMapStage.spec.ts -t "selects the latest trip by travel date"`
  - RED 阶段退出码 1，失败断言显示当前摘要错误命中了 `最近一次: 2025-05-01 - 2025-05-05`
- `pnpm --filter @trip-map/web typecheck`
  - 退出码 0
- `pnpm --filter @trip-map/web test --run src/components/LeafletMapStage.spec.ts`
  - 退出码 0，`1` 个文件 / `23` 个测试通过
- `pnpm --filter @trip-map/web test`
  - 退出码 0，`29` 个文件 / `255` 个测试通过
- 手动 acceptance checks
  - `record.createdAt.localeCompare` 在 `apps/web/src/components/LeafletMapStage.vue` 中计数为 `0`
  - `getLatestTripSortKey` 计数为 `2`
  - 新回归测试标题与两个固定 record id 在 spec 中均计数为 `1`

## Task Commits

Each task was committed atomically:

1. **Task 1: 在 LeafletMapStage.spec.ts 新增旅行日期选择最近一次的 RED 回归用例** - `0f8334f` (test)
2. **Task 2: 修正 activePointLatestTripLabel 按旅行日期排序的 selector** - `29fef46` (fix)

## Files Created/Modified

- `apps/web/src/components/LeafletMapStage.spec.ts` - 新增回归测试，覆盖“后录入但旅行时间更早”的补录场景。
- `apps/web/src/components/LeafletMapStage.vue` - 让 popup 的最近一次摘要按旅行日期而不是录入时间选取。
- `.planning/phases/27-multi-visit-record-foundation/27-05-SUMMARY.md` - 记录本次 gap closure 的实现、验证结果和范围收敛说明。

## 未触碰的 Artifacts

- `apps/web/src/stores/map-points.ts`
- `apps/web/src/components/map-popup/MapContextPopup.vue`
- `apps/web/src/components/map-popup/PointSummaryCard.vue`
- `apps/web/src/components/map-popup/TripDateForm.vue`
- `apps/server/src/**`
- `packages/contracts/src/**`

## Decisions Made

- 保持修复在 view 层派生 computed 内闭环，不把“最近一次”的排序语义下沉到 store，避免扩大 27-05 的影响面。
- 继续使用 `YYYY-MM-DD` 字符串排序满足 D-02，不引入 `new Date()` / `Date.parse()` 造成时区敏感比较。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 仓库存在与本计划无关的脏改：`.planning/STATE.md`、`apps/server/prisma/schema.prisma`。本次执行未修改、未暂存这些文件。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `27-VERIFICATION.md` 的 truth #10 blocker gap 已有代码与自动化测试证据，可更新为 `VERIFIED`。
- 27-05 范围已严格收敛在 `LeafletMapStage.vue`、`LeafletMapStage.spec.ts` 和本 summary，后续 27-06 可以继续处理剩余 DTO/contract gap，而不必回看这次 UI 修复。

## Self-Check: PASSED

- Found: `.planning/phases/27-multi-visit-record-foundation/27-05-SUMMARY.md`
- Found task commits: `0f8334f`, `29fef46`
- Verified `pnpm --filter @trip-map/web typecheck` exit code `0`
- Verified `pnpm --filter @trip-map/web test --run src/components/LeafletMapStage.spec.ts` exit code `0`
- Verified `pnpm --filter @trip-map/web test` exit code `0` with `29` files / `255` tests passing

---
*Phase: 27-multi-visit-record-foundation*
*Completed: 2026-04-20*
