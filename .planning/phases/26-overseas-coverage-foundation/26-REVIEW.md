---
phase: 26-overseas-coverage-foundation
reviewed: 2026-04-16T09:11:52Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - apps/web/scripts/geo/overseas-admin1-support.mjs
  - apps/web/scripts/geo/build-geometry-manifest.mjs
  - packages/contracts/src/generated/geometry-manifest.generated.ts
  - apps/server/test/canonical-resolve.e2e-spec.ts
  - apps/server/src/modules/canonical-places/place-metadata-catalog.ts
  - apps/server/src/modules/canonical-places/canonical-places.service.ts
  - apps/server/src/modules/records/records.service.ts
  - apps/server/scripts/backfill-record-metadata.ts
  - apps/server/test/auth-bootstrap.e2e-spec.ts
  - apps/server/test/records-travel.e2e-spec.ts
  - apps/server/test/records-sync.e2e-spec.ts
  - apps/web/src/stores/map-points.spec.ts
  - apps/web/src/constants/overseas-support.ts
  - apps/web/src/components/LeafletMapStage.vue
  - apps/web/src/components/LeafletMapStage.spec.ts
  - apps/web/src/components/map-popup/PointSummaryCard.vue
  - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
findings:
  critical: 0
  warning: 3
  info: 0
  total: 3
status: issues_found
---

# Phase 26: Code Review Report

**Reviewed:** 2026-04-16T09:11:52Z
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

本次审查覆盖了 Phase 26 的 geometry 构建、server authoritative metadata 校验、records/backfill，以及前端 popup/点亮交互回归。整体方向是对的：海外支持面已收口到 manifest，server 和 web 也基本围绕同一份 metadata 真源在工作。

发现 3 个需要处理的 warning，主要集中在 authoritative 约束没有完全闭环，以及 UI 按钮可用态与真实可执行条件不一致。此次为静态审查；未在本轮实际跑 server e2e / web test。

## Warnings

### WR-01: `/records` 仍允许客户端伪造 overseas `datasetVersion`

**File:** `/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts:117-123`
**Issue:** `assertAuthoritativeOverseasRecord()` 现在校验了 `displayName / regionSystem / adminType / typeLabel / parentLabel / subtitle`，但没有校验 `datasetVersion`。这意味着只要 `placeId` 和 `boundaryId` 命中 authoritative catalog，客户端仍可以提交任意 `datasetVersion` 并落库。随后 `/auth/bootstrap` 和 `/records` 会把这个伪造值原样回放，破坏“overseas payload 全量 authoritative”的约束，也给后续依赖 `datasetVersion` 的客户端逻辑留下不一致状态。
**Fix:**
```ts
const mismatchedFields = [
  ['datasetVersion', input.datasetVersion, placeSummary.datasetVersion],
  ['displayName', input.displayName, placeSummary.displayName],
  ['regionSystem', input.regionSystem, placeSummary.regionSystem],
  ['adminType', input.adminType, placeSummary.adminType],
  ['typeLabel', input.typeLabel, placeSummary.typeLabel],
  ['parentLabel', input.parentLabel, placeSummary.parentLabel],
  ['subtitle', input.subtitle, placeSummary.subtitle],
]
```

### WR-02: backfill 不会修正已有但错误的 overseas `subtitle`

**File:** `/Users/huangjingping/i/trip-map/apps/server/scripts/backfill-record-metadata.ts:122-130`
**Issue:** `backfillRecordMetadata()` 只在 `row.subtitle` 为空字符串时才回填 authoritative `subtitle`。如果数据库里已有旧值但内容错误，例如早期 fixture 产物、历史脏数据或手工修复残留，脚本会保留错误文案，导致 Phase 26 想要建立的“持久化文本字段稳定一致”并没有真正闭环。当前测试只覆盖了空字符串场景，没有覆盖“非空但错误”的旧数据。
**Fix:**
```ts
await prisma.travelRecord.update({
  where: { id: row.id },
  data: {
    regionSystem: metadata.regionSystem,
    adminType: metadata.adminType,
    typeLabel: metadata.typeLabel,
    parentLabel: metadata.parentLabel,
    subtitle: metadata.subtitle,
  },
})
```

### WR-03: popup CTA 可能显示可点亮，但点击后直接静默返回

**File:** `/Users/huangjingping/i/trip-map/apps/web/src/components/LeafletMapStage.vue:474-505`
**Issue:** `isActivePointIlluminatable` 只检查 `placeId / placeKind / datasetVersion / boundaryId`，因此按钮会被当作可点亮；但 `handleIlluminate()` 实际还要求 `regionSystem / adminType / typeLabel / parentLabel` 全部存在，否则直接 `return`。对缺少文本元数据的持久化记录（例如 backfill 前的旧 overseas 记录）来说，UI 会展示可点击主 CTA，但用户点击后没有任何反馈，和 Phase 26 新增的“disabled CTA 作为唯一解释路径”契约冲突。
**Fix:**
```ts
const isActivePointIlluminatable = computed(() => {
  if (!surface || surface.mode === 'candidate-select') {
    return false
  }

  const point = surface.point
  return Boolean(
    point.placeId &&
    point.placeKind &&
    point.datasetVersion &&
    point.boundaryId &&
    point.regionSystem &&
    point.adminType &&
    point.typeLabel &&
    point.parentLabel,
  )
})
```

---

_Reviewed: 2026-04-16T09:11:52Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
