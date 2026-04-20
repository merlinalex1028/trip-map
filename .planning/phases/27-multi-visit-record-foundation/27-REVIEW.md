---
phase: 27-multi-visit-record-foundation
reviewed: 2026-04-20T10:27:17Z
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
  critical: 1
  warning: 2
  info: 0
  total: 3
status: issues_found
---

# Phase 27: Code Review Report

**Reviewed:** 2026-04-20T10:27:17Z
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues_found

## Summary

已按 Phase 27 当前最终代码状态重新审查指定的 25 个文件，并额外交叉核对了 `apps/server/src/modules/records/records.controller.ts`、`apps/web/src/services/api/records.ts`、`apps/web/src/stores/auth-session.ts` 以确认实际运行语义。

27-05 / 27-06 这轮 gap closure 里最关键的几处修口目前没有看到明显回归：导入去重键已经扩展到 `placeId + startDate + endDate`，前端“最近一次”摘要已经按旅行日期而不是 `createdAt` 计算，同账号 foreground refresh 与 optimistic 写入/删除重叠时也没有再把临时状态错误地冲掉。

但当前实现仍保留一个明确的数据丢失风险，以及两处会在旧数据或非 UI 调用场景下暴露出来的行为问题。相关单测已补跑：`@trip-map/server` 3 个文件 / 17 个测试通过，`@trip-map/web` 7 个文件 / 126 个测试通过；因此下面的问题属于“测试可过，但逻辑风险仍然存在”的类型。

## Critical Issues

### CR-01: 多次去访仍按 `placeId` 整体删除，单次取消会清空同地点全部历史

**File:** `apps/web/src/stores/map-points.ts:462-481`

**Issue:** Phase 27 已经允许同一 `placeId` 下存在多条旅行记录，不同去访由 `startDate/endDate` 区分；但取消点亮链路仍然只传 `placeId`。前端 `unilluminate()` 调 `DELETE /records/:placeId`，后端最终落到 `deleteMany({ where: { userId, placeId } })`。这意味着用户在 popup 里看到“已去过 N 次 / 再记一次去访”后，只要点一次“已点亮”，该地点的全部历史记录都会被一起删掉。当前行为与多次去访模型不一致，而且是直接的数据丢失风险。受影响实现贯穿：

- `apps/web/src/stores/map-points.ts:462-481`
- `apps/web/src/services/api/records.ts:19-28`
- `apps/server/src/modules/records/records.controller.ts:98-107`
- `apps/server/src/modules/records/records.service.ts:97-99`
- `apps/server/src/modules/records/records.repository.ts:133-139`

**Fix:**

```ts
// 前端删除具体 trip record，而不是 placeId
export async function deleteTravelRecord(recordId: string): Promise<void> {
  return apiFetchJson<void>(
    `/records/by-id/${encodeURIComponent(recordId)}`,
    { method: 'DELETE' },
    { responseType: 'none' },
  )
}

// 后端按 recordId + userId 删除单条记录
await this.prisma.userTravelRecord.deleteMany({
  where: {
    id: recordId,
    userId,
  },
})
```

如果当前产品暂时只支持“整地点取消点亮”，也应该把它拆成一个显式的 bulk-delete 接口和确认文案，例如“删除该地点全部去访记录”，而不是复用现在这条看起来像单次 toggle 的路径。

## Warnings

### WR-01: `TravelRecord` 契约仍把可空数据库字段直接 cast 成必填字段，旧数据会穿透到前端

**File:** `apps/server/src/modules/records/records.service.ts:39-55`

**Issue:** 共享契约把 `regionSystem`、`adminType`、`typeLabel`、`parentLabel` 都定义成必填，但 `UserTravelRecord` schema 仍允许这些列为 `NULL`（`apps/server/prisma/schema.prisma:75-80`）。`RecordsService.toContractTravelRecord()` 直接把可空字段断言成契约类型；`AuthService.toContractTravelRecord()` 只兜底了 `typeLabel/parentLabel`，`regionSystem/adminType` 仍然是裸 cast（`apps/server/src/modules/auth/auth.service.ts:35-49`）。一旦数据库里还有旧阶段留下的空元数据记录，`GET /records`、`POST /records/import` 返回的 `records` 数组就可能不满足契约。前端 `recordToDisplayPoint()` 又会直接执行 `record.parentLabel.split(' · ')`（`apps/web/src/stores/map-points.ts:50-67`），收到 `null` 时会直接抛运行时异常。

**Fix:**

```ts
function toContractTravelRecord(record: UserTravelRecord): ContractTravelRecord {
  if (!record.regionSystem || !record.adminType || !record.typeLabel || !record.parentLabel) {
    throw new InternalServerErrorException(
      `Travel record ${record.id} has incomplete canonical metadata`,
    )
  }

  return {
    id: record.id,
    placeId: record.placeId,
    boundaryId: record.boundaryId,
    placeKind: record.placeKind as PlaceKind,
    datasetVersion: record.datasetVersion,
    displayName: record.displayName,
    regionSystem: record.regionSystem,
    adminType: record.adminType as ContractTravelRecord['adminType'],
    typeLabel: record.typeLabel,
    parentLabel: record.parentLabel,
    subtitle: record.subtitle,
    startDate: record.startDate ?? null,
    endDate: record.endDate ?? null,
    createdAt: record.createdAt.toISOString(),
  }
}
```

更完整的修法是先做数据回填，再把 schema 改成非空列；否则后续任何新的返回路径都可能再次把 `NULL` 漏出来。

### WR-02: 日期只校验了格式，没有校验“是否是真实存在的日历日期”

**File:** `apps/server/src/modules/records/dto/create-travel-record.dto.ts:63-70`

**Issue:** 当前后端只用正则校验 `YYYY-MM-DD` 形状，然后在 service 里用字符串比较 `endDate >= startDate`（`apps/server/src/modules/records/records.service.ts:101-106`）。这会放过 `2025-02-31`、`2025-13-01` 之类根本不存在的日期，并把它们持久化到数据库。浏览器 `<input type="date">` 不会生成这种值，但 API、旧客户端和导入 payload 仍可以。

**Fix:**

```ts
import { IsISO8601, IsOptional } from 'class-validator'

@IsOptional()
@IsISO8601(
  { strict: true, strictSeparator: true },
  { message: 'startDate must be a real YYYY-MM-DD date' },
)
startDate!: string | null

@IsOptional()
@IsISO8601(
  { strict: true, strictSeparator: true },
  { message: 'endDate must be a real YYYY-MM-DD date' },
)
endDate!: string | null
```

如果项目更倾向显式控制，也可以在 service 层补一个 `isValidDateOnly()` helper，先做真实日期校验，再继续现在的区间比较逻辑。

---

_Reviewed: 2026-04-20T10:27:17Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
