---
phase: 27-multi-visit-record-foundation
reviewed: 2026-04-20T08:02:30Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - packages/contracts/src/records.ts
  - apps/server/prisma/schema.prisma
  - apps/server/src/modules/records/records.repository.spec.ts
  - apps/server/src/modules/records/records.service.spec.ts
  - apps/server/src/modules/records/dto/create-travel-record.dto.ts
  - apps/server/src/modules/records/dto/import-travel-records.dto.ts
  - apps/server/src/modules/records/records.repository.ts
  - apps/server/src/modules/records/records.service.ts
  - apps/server/src/modules/auth/auth.service.ts
  - apps/server/src/modules/auth/auth.service.spec.ts
  - apps/server/test/auth-bootstrap.e2e-spec.ts
  - apps/server/test/health.e2e-spec.ts
  - apps/web/src/services/legacy-point-storage.spec.ts
  - apps/web/src/stores/map-points.ts
  - apps/web/src/stores/map-points.spec.ts
  - apps/web/src/services/legacy-point-storage.ts
  - apps/web/src/components/LeafletMapStage.vue
  - apps/web/src/components/LeafletMapStage.spec.ts
  - apps/web/src/App.spec.ts
  - apps/web/src/stores/auth-session.spec.ts
  - apps/web/src/components/map-popup/TripDateForm.vue
  - apps/web/src/components/map-popup/TripDateForm.spec.ts
  - apps/web/src/components/map-popup/PointSummaryCard.vue
  - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
  - apps/web/src/components/map-popup/MapContextPopup.vue
findings:
  critical: 0
  warning: 5
  info: 1
  total: 6
status: issues_found
---

# Phase 27: Code Review Report

**Reviewed:** 2026-04-20T08:02:30Z
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues_found

## Summary

本次审查覆盖了 Phase 27 的 contracts、Prisma schema、NestJS records/auth 相关实现，以及前端多次去访记录的 store / popup / map stage 变更。

整体上，这一阶段已经把“多次去访”主链路打通，但我仍然看到了 5 个需要尽快处理的行为问题：后端日期校验在批量导入路径上不一致、日期字段仍可写入不可能存在的日历值、导入去重没有数据库级约束兜底、地图连续点击时旧识别结果会覆盖新点击结果，以及“最近一次”文案当前实际上按记录写入时间而不是出行时间计算。另有 1 个测试可靠性问题，会让相关回归更难被自动发现。

## Warnings

### WR-01: 批量导入路径绕过了日期先后校验

**文件:** `apps/server/src/modules/records/records.service.ts:84-86`

**问题:** `createTravel()` 在 `apps/server/src/modules/records/records.service.ts:75-80` 中会拒绝 `endDate < startDate`，但 `importTravel()` 只做了 authoritative overseas 校验，随后直接把记录交给 repository。结果是同一组日期，单条创建会报错，批量导入却会成功落库，后端行为不一致，也会把非法区间带到前端“最近一次”与列表展示逻辑里。

**修复建议:**

```ts
private assertValidTripDates(input: Pick<CreateTravelRecordDto, 'startDate' | 'endDate'>) {
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    throw new BadRequestException('endDate must be >= startDate')
  }
}

async createTravel(userId: string, input: CreateTravelRecordDto) {
  this.assertAuthoritativeOverseasRecord(input)
  this.assertValidTripDates(input)
  ...
}

async importTravel(userId: string, input: ImportTravelRecordsDto) {
  input.records.forEach((record) => {
    this.assertAuthoritativeOverseasRecord(record)
    this.assertValidTripDates(record)
  })
  ...
}
```

### WR-02: 日期字段只校验格式，没有校验真实日历日期

**文件:** `apps/server/src/modules/records/dto/create-travel-record.dto.ts:62-69`

**问题:** 现在的 `@Matches(/^\d{4}-\d{2}-\d{2}$/)` 只保证形状像 `YYYY-MM-DD`，但 `2025-02-31`、`2025-13-40` 这类不可能存在的日期仍然会通过。由于 Phase 27 把日期当成持久化业务字段使用，这些无效值一旦入库，会继续参与字符串比较、排序与前端展示。

**修复建议:**

```ts
function isValidDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

// DTO 中保留 YYYY-MM-DD 形状校验，再叠加一个真实日期校验约束
```

也可以改成自定义 `class-validator` constraint，统一校验 `startDate` / `endDate`。

### WR-03: 导入去重逻辑缺少数据库唯一约束，`skipDuplicates` 当前并不能兜底

**文件:** `apps/server/prisma/schema.prisma:67-89`

**问题:** 这里是一个基于代码意图的推断问题：`apps/server/src/modules/records/records.repository.ts:97-118` 已经把 `(userId, placeId, startDate, endDate)` 当作重复键处理，并调用了 `createMany({ skipDuplicates: true })`。但 Prisma schema 只建了普通索引，没有对应的 `@@unique(...)`。这意味着并发导入、重复重试或两次几乎同时的同内容请求，仍然可能各自通过预查询并写入两条完全相同的去访记录，`skipDuplicates` 也不会发挥预期作用。

**修复建议:**

```prisma
model UserTravelRecord {
  ...
  @@unique([userId, placeId, startDate, endDate])
  @@index([userId])
}
```

随后让 `createTravelRecord()` / `importTravelRecords()` 显式处理该唯一键冲突，保证单条创建与批量导入的重复语义一致。

### WR-04: 连续点击地图时，旧请求返回会覆盖新点击结果

**文件:** `apps/web/src/components/LeafletMapStage.vue:708-786`

**问题:** `recognizeMapLocation()` 只在发起网络请求前检查过一次 `activeSequence !== recognitionSequence`。一旦 `resolveCanonicalPlace()` 或后续 `lookupCountryRegionByCoordinates()` 比较慢，先点的请求就可能在后点的请求之后才返回，并直接覆盖当前 popup、selection 与 notice。这个问题在真实网络下非常容易出现，属于明确的行为回归风险。

**修复建议:**

```ts
const response = await resolveCanonicalPlace({ lat, lng })
if (activeSequence !== recognitionSequence) {
  return
}

...

const geoResult = await lookupCountryRegionByCoordinates({ lat, lng })
if (activeSequence !== recognitionSequence) {
  return
}
```

建议把所有会回写 UI / store 的异步分支都放在 sequence guard 后面，避免旧请求污染当前状态。

### WR-05: “最近一次”按记录创建时间排序，会把补录的旧旅行显示成最近一次

**文件:** `apps/web/src/components/LeafletMapStage.vue:472-483`

**问题:** 这里根据 `createdAt` 选“最新”记录，再显示 `startDate` / `endDate`。基于文案“最近一次”的语义，这会把“今天补录的一次去年旅行”错误地展示成最近一次去访。用户看到的时间线会被录入时间而不是出行时间主导。

**修复建议:**

```ts
const latest = [...realRecords].sort((a, b) =>
  (b.endDate ?? b.startDate ?? '').localeCompare(a.endDate ?? a.startDate ?? '')
)[0]
```

如果要兼容无日期旧记录，建议先按 `endDate ?? startDate` 选最近一次已知旅行，再对全空日期记录回退成“日期未知”。

## Info

### IN-01: 两个新增测试用例没有断言目标行为，回归时也会继续通过

**文件:** `apps/web/src/components/LeafletMapStage.spec.ts:317-343`

**问题:** `calls addFeatures with CN layer when a CN boundary shard is loaded` 这个测试目前只完成了 mount / flush，没有对 `loadGeometryShard()`、`addFeatures()` 或识别链路做任何断言；`apps/web/src/components/LeafletMapStage.spec.ts:719-726` 的 `does not fetch /records again during anonymous map startup` 也同样没有断言。它们会在目标行为回归后继续通过，降低测试对这次 Phase 的保护价值。

**修复建议:** 给第一个用例补上 `geometryLoaderMock.loadGeometryShard` / `addFeaturesMock` 的断言，给第二个用例明确 spy 并断言“没有调用”的对象，否则建议删除这些空断言用例。

---

_Reviewed: 2026-04-20T08:02:30Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
