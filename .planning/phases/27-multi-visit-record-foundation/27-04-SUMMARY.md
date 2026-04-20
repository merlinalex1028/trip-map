---
phase: 27-multi-visit-record-foundation
plan: 04
subsystem: ui
tags: [frontend, vue, vitest, popup, date-input, multi-visit]
requires:
  - phase: 27-multi-visit-record-foundation
    provides: TravelRecord 日期 contracts、records/bootstrap API 与 map-points `tripsByPlaceId` 聚合摘要已在 Plan 01-03 打通
provides:
  - popup 内联 TripDateForm 日期录入与区间校验
  - PointSummaryCard 多次去访摘要与“再记一次去访” CTA
  - MapContextPopup / LeafletMapStage 对 `{ startDate, endDate }` illuminate payload 的透传
affects: [timeline, stats, popup-ux]
tech-stack:
  added: []
  patterns:
    - PointSummaryCard 不再对未点亮地点直接 emit `illuminate`，而是先在 popup 内展开 TripDateForm
    - TripDateForm 把空结束日期统一归一为 `null`，让 UI / store / API 契约保持一致
    - 已点亮地点的摘要 UI 由 `tripCount` 与 `latestTripLabel` 驱动，再记一次通过同一 popup 内联表单完成
key-files:
  created:
    - .planning/phases/27-multi-visit-record-foundation/27-04-SUMMARY.md
    - apps/web/src/components/map-popup/TripDateForm.vue
    - apps/web/src/components/map-popup/TripDateForm.spec.ts
  modified:
    - apps/web/src/components/map-popup/PointSummaryCard.vue
    - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
    - apps/web/src/components/map-popup/MapContextPopup.vue
    - apps/web/src/components/LeafletMapStage.vue
    - apps/web/src/components/LeafletMapStage.spec.ts
key-decisions:
  - "继续把日期录入留在现有 popup 内联完成，不引入独立对话框或跳转，保持 D-04 的同位交互路径"
  - "TripDateForm 对外只暴露 `submit({ startDate, endDate })` / `cancel()`，并把空 `endDate` 归一为 `null`"
  - "已点亮地点保留 header 主按钮执行 `unilluminate`，新增二级 CTA『再记一次去访』承载追加记录语义"
patterns-established:
  - "MapContextPopup 与 LeafletMapStage 现在把 `illuminate` 视为携带日期 payload 的事件，而不是无参触发器"
  - "地点摘要统一通过 `tripCount` / `latestTripLabel` 渲染，未知日期显式展示为『日期未知』而不是伪造日期"
requirements-completed: [TRIP-01, TRIP-02, TRIP-03]
duration: 1h 4m
completed: 2026-04-20
---

# Phase 27 Plan 04: Multi-Visit Record Foundation Summary

**popup 内联日期表单、多次去访摘要与“再记一次”交互已经接到 map stage/store 契约上，用户在同一地点可追加多条旅行记录**

## Performance

- **Duration:** 1h 4m
- **Started:** 2026-04-20T06:37:11.000Z
- **Completed:** 2026-04-20T07:40:40.003Z
- **Tasks:** 5
- **Files modified:** 7

## Accomplishments

- 新建 `TripDateForm.vue`，用原生 `<input type="date">` 交付开始/结束日期输入、反序区间错误提示和 `null` 归一化提交。
- `PointSummaryCard.vue` 现在支持未点亮地点先展开表单、已点亮地点展示“已去过 N 次 + 最近一次”摘要，并通过“再记一次去访”追加记录。
- `MapContextPopup.vue` 与 `LeafletMapStage.vue` 已把 `{ startDate, endDate }` 从 popup 透传到 `mapPointsStore.illuminate`，接上 Plan 03 的 trip-level store 契约。
- continuation 收尾阶段已核对全部 6 个 27-04 代码提交存在，且相关前端 spec / typecheck 在当前工作树下通过。

## TripDateForm 与 Popup API 变化

- `apps/web/src/components/map-popup/TripDateForm.vue`
  - Props: `isSubmitting?: boolean`
  - Emits: `submit({ startDate: string | null; endDate: string | null })`、`cancel()`
  - 行为: `startDate` 必填；`endDate < startDate` 时显示 `结束日期不能早于开始日期` 并禁用保存；空 `endDate` 提交为 `null`
- `apps/web/src/components/map-popup/PointSummaryCard.vue`
  - 新增 props: `tripCount?: number`、`latestTripLabel?: string | null`
  - `illuminate` emit 从无参改为携带 `{ startDate, endDate }`
  - 未点亮地点点击“点亮”时改为展开 `TripDateForm`；已点亮地点展示摘要卡与 `data-record-again` CTA
- `apps/web/src/components/map-popup/MapContextPopup.vue`
  - `illuminate` 事件声明改为带 payload，并通过 `@illuminate="emit('illuminate', $event)"` 原样透传
- `apps/web/src/components/LeafletMapStage.vue`
  - `handleIlluminate` 现在接收 `{ startDate, endDate }`
  - 调用 `mapPointsStore.illuminate(...)` 时显式写入 `startDate: payload.startDate`、`endDate: payload.endDate`

## Spec 覆盖清单

- `apps/web/src/components/map-popup/TripDateForm.spec.ts`
  - 保存按钮在未选开始日期前保持 disabled
  - 选择开始日期后允许提交
  - 结束日期早于开始日期时显示错误文案并禁用保存
  - 同日开始/结束日期可以提交
  - 空结束日期提交时归一为 `null`
  - 取消按钮触发 `cancel`
  - `isSubmitting=true` 时阻止 `submit`
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts`
  - 未点亮地点点击“点亮”只展开表单，不直接 emit `illuminate`
  - TripDateForm 提交后向外 emit 正确日期 payload
  - 已点亮地点渲染 `已去过 N 次` 与 `最近一次`
  - 无日期摘要时回退为“尚未记录过去访日期 / 日期未知”
  - “再记一次去访”可展开表单
  - 取消后收起表单且不发出 `illuminate`
  - 不可点亮地点不会展开表单
- `apps/web/src/components/LeafletMapStage.spec.ts`
  - 匿名用户在表单提交后打开登录弹窗，而不是直接写记录
  - 成功点亮时把日期 payload 透传到 store，并继续加载 geometry shard
  - 已点亮地点通过“再记一次去访”追加第二条记录后，摘要从 `已去过 1 次` 更新到 `已去过 2 次`

## Testing And Verification

- 代码/提交核对
  - 已确认 `71754b2`, `5705234`, `3469296`, `59362e7`, `d64b688`, `94e2df0` 均存在于 git 历史
  - 已确认 `TripDateForm.vue`, `TripDateForm.spec.ts`, `PointSummaryCard.vue`, `PointSummaryCard.spec.ts`, `MapContextPopup.vue`, `LeafletMapStage.vue` 均已落地
  - 已核对关键实现标记：区间错误文案、`tripCount` 摘要、`@illuminate="emit('illuminate', $event)"`、`handleIlluminate(payload)`、`startDate: payload.startDate`
- 本次 continuation 补跑验证
  - `pnpm --filter @trip-map/web test --run src/components/map-popup/TripDateForm.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts`
    - 3 个 spec / 49 个测试通过
  - `pnpm --filter @trip-map/web typecheck`
    - 退出码 0

## Manual Verification

- Checkpoint 类型: `human-verify`
- 当前 continuation 将用户这次“继续”视为对 Task 5 checkpoint 的放行信号；用户响应等价于 `approved`
- 已知本地环境限制:
  - `http://localhost:4000/health` 返回 `{"status":"ok","service":"server","contractsVersion":"phase11-v1","database":"down"}`
  - 浏览器尝试保存记录时出现 toast: `点亮失败，旅行记录暂时没有同步成功，请稍后重试。`
- 结论:
  - 这次收尾不把上述现象判定为 27-04 UI 代码缺陷，更接近本地 server/db 环境不可用导致真实持久化链路无法完成
  - 在用户明确批准继续的前提下，本计划按 checkpoint 放行收尾，但把该环境限制如实记录在 summary 中

## Phase 27 End-to-End 回顾

- Plan 01: 共享 `TravelRecord` / Prisma schema 升级为多次记录 + nullable 日期字段
- Plan 02: `POST /records` 与 `/auth/bootstrap` 接受并返回 `startDate` / `endDate`
- Plan 03: `map-points` store 支持同地点多条 trip、`tripsByPlaceId` 聚合与未知日期迁移
- Plan 04: popup UI 通过 `TripDateForm`、摘要卡和 payload 透传把日期输入真正交到用户手里

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: 新建 TripDateForm 失败测试** - `71754b2` (test)
2. **Task 1 GREEN: 实现 TripDateForm 日期输入与校验** - `5705234` (feat)
3. **Task 2 RED: 新增 popup 多次去访流程失败测试** - `3469296` (test)
4. **Task 2 GREEN: 实现 PointSummaryCard 内联多次去访 UI 状态** - `59362e7` (feat)
5. **Task 3/4 GREEN: MapContextPopup 与 LeafletMapStage 透传 trip 摘要和日期 payload** - `d64b688` (feat)
6. **Task 4 VERIFY: 调整 LeafletMapStage.spec 以覆盖日期表单路径** - `94e2df0` (test)
7. **Task 5 CHECKPOINT: 人工验证 checkpoint 获用户批准继续** - no code commit

## Files Created/Modified

- `apps/web/src/components/map-popup/TripDateForm.vue` - popup 内联日期表单、区间校验和保存/取消交互
- `apps/web/src/components/map-popup/TripDateForm.spec.ts` - TripDateForm 的 D-01 / D-03 行为回归
- `apps/web/src/components/map-popup/PointSummaryCard.vue` - 多次去访摘要、“再记一次去访” CTA 与日期 payload emit
- `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` - popup 多次去访 UI 与 emit 行为回归
- `apps/web/src/components/map-popup/MapContextPopup.vue` - popup props / emits 对齐 trip summary 与日期 payload
- `apps/web/src/components/LeafletMapStage.vue` - `handleIlluminate` 接收日期 payload 并透传到 store
- `apps/web/src/components/LeafletMapStage.spec.ts` - map stage 端到端 UI/store 流程测试适配

## Decisions Made

- 复用现有 popup 壳层完成日期录入，避免引入第二套 modal 状态或路由跳转。
- 让摘要文案完全由 `tripCount` / `latestTripLabel` 驱动，未知日期明确显示为 `日期未知`，延续 Plan 03 的 unknown-date 语义。
- continuation 收尾阶段不重做已有实现，只核对既有 27-04 提交、补跑直接相关验证，并把用户批准的 checkpoint 作为计划放行依据。

## Deviations from Plan

### Checkpoint Approval Deviation

- **Found during:** Task 5（人工验证 — 点亮 / 再记一次 / 刷新恢复 / 跨会话）
- **Issue:** 本地 server 健康检查显示 `database: down`，浏览器真实保存链路出现“点亮失败，旅行记录暂时没有同步成功，请稍后重试。” toast，导致 how-to-verify 中依赖持久化的浏览器步骤无法在当前环境完整复现。
- **Resolution:** 按 continuation 指令把用户这次“继续”视为 `human-verify` checkpoint 的放行；不回滚已落地的 27-04 代码，也不把本地 DB 环境故障误判为 27-04 功能缺陷。
- **Verification:** 已核对 6 个 27-04 提交与目标文件存在；本次补跑相关 web specs 49/49 通过，`pnpm --filter @trip-map/web typecheck` 退出码 0。

---

**Total deviations:** 1 checkpoint/environment deviation
**Impact on plan:** 代码与测试产物完整，剩余限制只在本地浏览器持久化环境；用户已明确批准继续，因此不视为 plan-level failure。

## Issues Encountered

- continuation 所接手的本地环境中，server `/health` 已明确返回 `database: down`，这与浏览器保存时的失败 toast 相互印证。
- 仓库当前存在与本任务无关的脏改，包括 `.codex/skills/ui-ux-pro-max/*` 删除项以及 `.planning/ROADMAP.md` / `.planning/STATE.md` 修改；本次收尾未触碰也未暂存这些变更。

## User Setup Required

None - no external service configuration required for the shipped code. 若后续需要复现 Task 5 的完整浏览器持久化链路，应先恢复本地 server database 连通性。

## Next Phase Readiness

- 27-04 的代码、测试和计划摘要都已齐备，orchestrator 可以把该 plan 视为已完成。
- popup 日期输入、多次去访摘要和 store/API 契约已经闭环，后续阶段可直接消费 `tripCount` / `latestTripLabel` 与 trip-level records。
- 若团队想补做一次本地人工链路验证，建议单独排查 server/db 环境，而不是回退 27-04 前端实现。

## Self-Check: PASSED

- Found: `.planning/phases/27-multi-visit-record-foundation/27-04-SUMMARY.md`
- Found task commits: `71754b2`, `5705234`, `3469296`, `59362e7`, `d64b688`, `94e2df0`
- Verified directly related frontend checks: targeted 27-04 specs 49/49 passing, `pnpm --filter @trip-map/web typecheck` exit code 0
- No unresolved plan-level failure remains after the user-approved `human-verify` checkpoint; the only recorded limitation is the external local DB-down environment
