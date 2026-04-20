---
phase: 27-multi-visit-record-foundation
plan: 06
subsystem: api
tags: [backend, nestjs, prisma, contracts, gap-closure]
requires:
  - phase: 27-multi-visit-record-foundation
    provides: 多次旅行记录 schema、日期字段 contract 与 records/auth 基础链路
provides:
  - CreateTravelRecordDto 直接 implements shared CreateTravelRecordRequest
  - importTravel 与 createTravel 共享 endDate >= startDate 校验
  - UserTravelRecord 获得 (userId, placeId, startDate, endDate) 数据库唯一约束兜底
affects: [27-verification, records-import, auth-bootstrap, multi-visit-dedupe]
tech-stack:
  added: []
  patterns:
    - DTO 用 implements 直接绑定 shared contract，同时保留 @IsOptional 维持运行时兼容
    - RecordsService 通过 private assertValidDateRange 在 create/import 间复用日期区间校验
    - PostgreSQL 维持 Prisma 默认 NULLS DISTINCT 语义，legacy null/null 去重继续由应用层预查询补强
key-files:
  created:
    - .planning/phases/27-multi-visit-record-foundation/27-06-DB-PROBE.md
    - .planning/phases/27-multi-visit-record-foundation/27-06-SUMMARY.md
  modified:
    - apps/server/prisma/schema.prisma
    - apps/server/src/modules/records/dto/create-travel-record.dto.ts
    - apps/server/src/modules/records/records.service.ts
    - apps/server/src/modules/records/records.service.spec.ts
key-decisions:
  - "当前数据库为 PostgreSQL 17.0.6，但 27-06 继续保持 Prisma 默认 NULLS DISTINCT，不引入 raw migration 或 NULLS NOT DISTINCT。"
  - "DTO 日期字段改为 `!:` 对齐 required-nullable contract，同时保留 `@IsOptional()`，维持旧客户端缺失字段时的运行时兼容。"
  - "Task 3 与 Task 6 用空提交记录外部状态变更和全量回归结果，避免把现有脏改误带入提交。"
patterns-established:
  - "执行 `pnpm --filter @trip-map/server exec prisma ...` 时，应使用包内 schema 路径 `prisma/schema.prisma`。"
  - "编译期 contract 绑定用 DTO `implements`，测试层再用 `satisfies` 补一层防回退断言。"
requirements-completed: [TRIP-01, TRIP-02, TRIP-03]
duration: 11m 50s
completed: 2026-04-20
---

# Phase 27 Plan 06: Multi-Visit Record Foundation Summary

**后端 gap closure 已补齐 DTO 直接契约绑定、批量导入日期区间复用校验，以及 UserTravelRecord 的四元组数据库唯一约束兜底**

## Performance

- **Duration:** 11m 50s
- **Started:** 2026-04-20T09:59:27Z
- **Completed:** 2026-04-20T10:11:17Z
- **Tasks:** 6
- **Files modified:** 6

## Accomplishments

- 产出 [27-06-DB-PROBE.md](./27-06-DB-PROBE.md)，记录当前数据库 `server_version_num=170006`，并明确本计划继续采用 Prisma 默认 `NULLS DISTINCT` 语义。
- 为 `UserTravelRecord` 新增 `@@unique([userId, placeId, startDate, endDate])`，完成 Prisma Client 重新生成和两次 `db push` 验证，数据库层开始真正兜底 `createMany({ skipDuplicates: true })`。
- 让 `CreateTravelRecordDto` 直接 `implements CreateTravelRecordRequest`，并把 `importTravel` 和 `createTravel` 收敛到同一个 `assertValidDateRange` helper；全量 server 88 个测试与 web 目标回归 39 个测试通过。

## DTO / Service / Schema 摘要

- DTO diff
  - `CreateTravelRecordDto` 从纯手写字段改为 `implements CreateTravelRecordRequest`
  - `startDate` / `endDate` 从 `?: string | null` 收紧为 `!: string | null`
  - 所有 `@ApiProperty`、`@IsOptional()`、`@Matches(...)` 装饰器保持不变，运行时兼容旧请求体缺失日期字段的行为
- Service diff
  - `createTravel()` 原本内联的 `endDate < startDate` 判断改为 `this.assertValidDateRange(input)`
  - `importTravel()` 在遍历 `input.records` 时，先做 authoritative overseas 校验，再做 `this.assertValidDateRange(record)`，任一非法即拒绝整批并且 repository 不会被调用
- Schema / Prisma diff
  - `apps/server/prisma/schema.prisma` 在 `UserTravelRecord` model 尾部新增 `@@unique([userId, placeId, startDate, endDate])`
  - `prisma generate` 退出码 0，生成的 Prisma Client 出现 `userId_placeId_startDate_endDate` compound unique input
  - 第一次 `prisma db push --accept-data-loss` 成功，输出 `Your database is now in sync with your Prisma schema`
  - 第二次 `prisma db push` 成功，输出 `The database is already in sync with the Prisma schema`

## Verification Results

- DB probe
  - 记录文件：[27-06-DB-PROBE.md](./27-06-DB-PROBE.md)
  - 版本：`server_version_num: 170006`
  - 决策：保持 Prisma 默认 `NULLS DISTINCT`，不引入 `NULLS NOT DISTINCT` 或 raw migration
- Prisma / schema
  - `pnpm --filter @trip-map/server exec prisma generate --schema=prisma/schema.prisma`：退出码 0
  - `pnpm --filter @trip-map/server exec prisma db push --schema=prisma/schema.prisma --accept-data-loss`：退出码 0
  - `pnpm --filter @trip-map/server exec prisma db push --schema=prisma/schema.prisma`：退出码 0
  - `grep -n '@@unique([userId, placeId, startDate, endDate])' apps/server/prisma/schema.prisma`：`87:  @@unique([userId, placeId, startDate, endDate])`
- Tests / typecheck
  - `pnpm --filter @trip-map/contracts build`：退出码 0
  - `pnpm --filter @trip-map/contracts typecheck`：退出码 0
  - `pnpm --filter @trip-map/server typecheck`：退出码 0
  - `pnpm --filter @trip-map/server test`：15 个 test files / 88 个 tests 通过
  - `pnpm --filter @trip-map/web typecheck`：退出码 0
  - `pnpm --filter @trip-map/web test --run src/services/legacy-point-storage.spec.ts src/stores/map-points.spec.ts`：2 个 test files / 39 个 tests 通过

## Task Commits

Each task was committed atomically:

1. **Task 1: 探测 PostgreSQL 版本并记录 NULL 语义决策** - `89f6438` (docs)
2. **Task 2: 在 UserTravelRecord 新增四元组 @@unique** - `9c3c420` (feat)
3. **Task 3: 重新生成 Prisma Client 并 push schema 到数据库** - `c4d77ce` (chore)
4. **Task 4: CreateTravelRecordDto implements CreateTravelRecordRequest** - `bcb641c` (feat)
5. **Task 5 RED: 增加 importTravel 日期区间与 contract 绑定回归测试** - `78bc125` (test)
6. **Task 5 GREEN: 抽取 assertValidDateRange 并复用到 importTravel** - `401ea78` (feat)
7. **Task 6: contracts / server / web 跨包回归验证** - `f222209` (test)

## Files Created/Modified

- `.planning/phases/27-multi-visit-record-foundation/27-06-DB-PROBE.md` - 记录 PostgreSQL 版本探测结果与 `NULLS DISTINCT` 决策依据
- `apps/server/prisma/schema.prisma` - 在 `UserTravelRecord` 增加四元组唯一约束
- `apps/server/src/modules/records/dto/create-travel-record.dto.ts` - 直接绑定 shared contract，并收紧日期字段类型
- `apps/server/src/modules/records/records.service.ts` - 抽取并复用 `assertValidDateRange`
- `apps/server/src/modules/records/records.service.spec.ts` - 新增 importTravel 非法日期区间回归和 DTO contract 编译期断言
- `.planning/phases/27-multi-visit-record-foundation/27-06-SUMMARY.md` - 记录 27-06 执行结果与验证证据

## Decisions Made

- 保持 `NULLS DISTINCT` 是一个显式技术决策，不是遗漏。当前数据库已是 PostgreSQL 17，但 Prisma 6.19 对 `NULLS NOT DISTINCT` 没有稳定的 schema API，本计划坚持不引入 raw migration。
- 类型层收紧与运行时兼容同时成立。`startDate` / `endDate` 在 TS 层变成 required-nullable，而 `@IsOptional()` 继续允许 body 缺失时跳过 `@Matches`，由后续归一逻辑处理。
- 共享 contract 绑定采用双保险：实现层 `implements`，测试层 `satisfies CreateTravelRecordRequest`。将来 contract 漂移时，DTO 和 spec 会一起在编译期报警。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 1 的 Prisma probe 命令路径与 `pnpm --filter` 工作目录不一致**
- **Found during:** Task 1
- **Issue:** 计划里的 `--schema=apps/server/prisma/schema.prisma` 在 `pnpm --filter @trip-map/server exec` 下会被解析成 `apps/server/apps/server/prisma/schema.prisma`，导致 probe 直接失败。
- **Fix:** 改为使用包内相对路径 `--schema=prisma/schema.prisma`；随后用 Prisma Client 只读查询补齐 `server_version_num`。
- **Files modified:** `.planning/phases/27-multi-visit-record-foundation/27-06-DB-PROBE.md`
- **Verification:** 成功读到 `server_version_num: 170006`
- **Committed in:** `89f6438`

**2. [Rule 3 - Blocking] Task 2 用 `npx prisma validate` 命中 Prisma 7，和仓库锁定版本不兼容**
- **Found during:** Task 2
- **Issue:** 全局 `npx` 拉起 Prisma 7.7.0，会把现有 `datasource url/directUrl` 误判为非法，产生假失败。
- **Fix:** 改用仓库内 Prisma 6.19：`pnpm --filter @trip-map/server exec prisma format/validate --schema=prisma/schema.prisma`。
- **Files modified:** None
- **Verification:** `The schema at prisma/schema.prisma is valid`
- **Committed in:** `9c3c420`

**3. [Rule 3 - Blocking] Task 2 的一条 acceptance grep 与仓库现状冲突**
- **Found during:** Task 2
- **Issue:** 计划要求全文件 `grep '@@index([userId])' == 1`，但仓库既有 `AuthSession` 也包含 `@@index([userId])`，该条件天然不成立。
- **Fix:** 按 `UserTravelRecord` model block 做精确计数验证，而不是改动无关 model 去迎合错误 grep。
- **Files modified:** None
- **Verification:** 对 `UserTravelRecord` block 的 `@@unique / @@index / startDate / endDate` 逐项计数均为预期值
- **Committed in:** `9c3c420`

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** 三处偏差都属于执行器与工具链层面的阻塞修正，没有扩大 27-06 代码范围，也没有改变计划目标。

## Issues Encountered

- 没有出现存量重复数据阻塞 `db push`；四元组唯一约束一次推送成功，二次推送幂等。
- `psql` 不在当前环境中，因此 PostgreSQL 版本探测最终通过 Prisma Client 的只读查询完成。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 27-06 覆盖的三个后端 / schema gaps 已全部关闭，后续可直接进入第二次 verification。
- 对 `27-VERIFICATION.md` 的建议更新：
  - 将 key-link `CreateTravelRecordRequest -> CreateTravelRecordDto` 从 `⚠️ PARTIAL` 升级为 `✓ WIRED`
  - 将 Anti-Pattern `importTravel() 未复用 endDate >= startDate 校验` 标记为 `RESOLVED`
  - 将 Anti-Pattern `createMany({ skipDuplicates: true }) 缺少 DB 层唯一约束兜底` 标记为 `RESOLVED`
- 与 27-05 合并后，Phase 27 已具备重新跑整体验证并冲刺 11/11 truths verified 的条件。

---
*Phase: 27-multi-visit-record-foundation*
*Completed: 2026-04-20*

## Self-Check: PASSED

- Found: `.planning/phases/27-multi-visit-record-foundation/27-06-SUMMARY.md`
- Found commits: `89f6438`, `9c3c420`, `c4d77ce`, `bcb641c`, `78bc125`, `401ea78`, `f222209`
