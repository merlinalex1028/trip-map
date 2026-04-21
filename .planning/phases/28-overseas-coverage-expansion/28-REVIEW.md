---
phase: 28-overseas-coverage-expansion
reviewed: 2026-04-21T07:32:40Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - apps/server/scripts/backfill-record-metadata.ts
  - apps/server/src/modules/records/records.service.ts
  - apps/server/test/auth-bootstrap.e2e-spec.ts
  - apps/server/test/canonical-resolve.e2e-spec.ts
  - apps/server/test/phase28-overseas-cases.ts
  - apps/server/test/record-metadata-backfill.e2e-spec.ts
  - apps/server/test/records-import.e2e-spec.ts
  - apps/server/test/records-sync.e2e-spec.ts
  - apps/server/test/records-travel.e2e-spec.ts
  - apps/web/scripts/geo/build-geometry-manifest.mjs
  - apps/web/scripts/geo/overseas-admin1-support.mjs
  - apps/web/scripts/geo/overseas-support/africa.mjs
  - apps/web/scripts/geo/overseas-support/americas.mjs
  - apps/web/scripts/geo/overseas-support/asia.mjs
  - apps/web/scripts/geo/overseas-support/europe.mjs
  - apps/web/scripts/geo/overseas-support/index.mjs
  - apps/web/scripts/geo/overseas-support/middle-east.mjs
  - apps/web/scripts/geo/overseas-support/oceania.mjs
  - apps/web/src/constants/overseas-support.ts
  - apps/web/src/components/LeafletMapStage.spec.ts
  - apps/web/src/components/map-popup/PointSummaryCard.spec.ts
  - apps/web/src/stores/map-points.spec.ts
  - apps/web/src/services/geometry-manifest.spec.ts
  - packages/contracts/src/contracts.spec.ts
  - packages/contracts/src/fixtures.ts
  - packages/contracts/src/generated/geometry-manifest.generated.ts
findings:
  critical: 0
  warning: 3
  info: 0
  total: 3
status: issues_found
---

# Phase 28: Code Review Report

**Reviewed:** 2026-04-21T07:32:40Z
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

本次审查覆盖了 Phase 28 的 geo build、server authoritative 校验/backfill、web consumer regression，以及 contracts fixtures/generated manifest。

发现 3 条 Warning，主要集中在三类问题：

- authoritative `datasetVersion` 与 geometry dataset version 被混用，导致 server/web/contracts 三端 contract 已经分裂
- backfill 只更新旧 `travelRecord` / `smokeRecord`，没有触达 `/auth/bootstrap` 真正回放的 `userTravelRecord`
- 本应保留为历史快照的 `PHASE11_*` / `PHASE12_*` fixtures 被直接改写为 Phase 28 语义

未重新执行测试命令；结论基于静态审查、phase 计划/总结交叉核对，以及变更链路追踪。

## Warnings

### WR-01: Canonical `datasetVersion` 被 geometry version 覆盖，authoritative contract 已经 split-brain

**File:** `apps/web/scripts/geo/build-geometry-manifest.mjs:244-290`

**Issue:** `createCnFeatureMetadata()` / `createOverseasFeatureMetadata()` 明确把 `datasetVersion` 设成 `CANONICAL_DATASET_VERSION`，但 `enrichFeature()` 又无条件把写入 shard 的 `properties.datasetVersion` 覆盖成 `GEOMETRY_DATASET_VERSION`。Phase 28 后 server authoritative lookup、回填和写入路径都会读取这个字段，因此最终持久化/回放的是 `2026-04-21-geo-v3`，而不是计划里要求的 `canonical-authoritative-2026-04-21`。这已经被 Phase 28 server 测试进一步固化为“正确行为”，例如 `apps/server/test/phase28-overseas-cases.ts:157-178`、`apps/server/test/canonical-resolve.e2e-spec.ts:280-315`、`apps/server/test/record-metadata-backfill.e2e-spec.ts:10-41` 都在断言 geo version；但 contracts Phase 28 fixtures 仍然把 authoritative `datasetVersion` 写成 canonical version（`packages/contracts/src/fixtures.ts:101-153`、`packages/contracts/src/contracts.spec.ts:217-275`）。结果是同一个 authoritative 概念在 server 与 contracts 里出现两套版本号，后续 exact-match、防伪校验、回填和下游 consumer 很容易继续漂移。

**Fix:**

```js
function enrichFeature(feature, metadata) {
  return {
    ...feature,
    properties: {
      ...feature.properties,
      ...metadata,
      boundaryId: metadata.boundaryId,
      renderableId: metadata.boundaryId,
      // 不要在这里覆盖 canonical datasetVersion
    },
  }
}
```

然后重新生成 geo shard / generated contracts，并把 Phase 28 server 回归统一改成断言 `canonical-authoritative-2026-04-21`；geometry 版本只应通过 `geometryRef.geometryDatasetVersion` 或 manifest entry 暴露。

### WR-02: Backfill 没有更新 `UserTravelRecord`，老用户 bootstrap/sync 仍会回放旧海外 metadata

**File:** `apps/server/scripts/backfill-record-metadata.ts:99-165`

**Issue:** 这个脚本只扫描并更新 `travelRecord` 与 `smokeRecord`，完全没有处理 `userTravelRecord`。但当前 authenticated 读写链路走的是 `UserTravelRecord`：`/records` create/import 写 `userTravelRecord`，`/auth/bootstrap` 也直接回放 `userTravelRecord`。这意味着已有登录用户的旧海外记录即使运行了 Phase 28 backfill，也不会被升级成新的 `typeLabel` / `parentLabel` / `subtitle` / `datasetVersion`，仍然会在 bootstrap 和跨 session sync 中继续带着旧值返回。Phase 28 的相关测试也没有覆盖这条真实风险：`apps/server/test/auth-bootstrap.e2e-spec.ts:265-301` 和 `apps/server/test/records-sync.e2e-spec.ts:245-283` 都是直接插入已经“正确”的 authoritative `userTravelRecord`，并未先种入旧标签再跑 backfill。

**Fix:**

```ts
const userTravelRows = await prisma.userTravelRecord.findMany({
  select: { id: true, placeId: true },
})

for (const row of userTravelRows) {
  const metadata = lookup.get(row.placeId)
  if (!metadata) continue

  await prisma.userTravelRecord.update({
    where: { id: row.id },
    data: {
      datasetVersion: metadata.datasetVersion,
      displayName: metadata.displayName,
      regionSystem: metadata.regionSystem,
      adminType: metadata.adminType,
      typeLabel: metadata.typeLabel,
      parentLabel: metadata.parentLabel,
      subtitle: metadata.subtitle,
    },
  })
}
```

同时补一条 e2e：先插入带旧 `一级行政区` 文案的 `userTravelRecord`，运行 backfill，再断言 `/auth/bootstrap` 返回已经升级后的 Phase 28 metadata。

### WR-03: 历史 `PHASE11_*` / `PHASE12_*` fixtures 被直接改写，破坏了版本化基线

**File:** `packages/contracts/src/fixtures.ts:8-18,61-78`

**Issue:** Phase 28 计划明确要求保留 `PHASE11_*` / `PHASE12_*` 历史 fixtures，仅新增 `PHASE28_*` authoritative fixtures 供新回归使用。但当前实现直接把 `PHASE11_SMOKE_RECORD_REQUEST` 和 `PHASE12_RESOLVED_CALIFORNIA` 的 admin label/subtitle 从旧历史值改成了 Phase 28 的英文标签，并且 `packages/contracts/src/contracts.spec.ts:172-202` 也跟着把这些历史 fixtures 重新定义成新语义。这样会让“历史 fixture”失去历史意义，并把 Phase 28 语义泄漏给仍然复用这些老 fixture 的其它测试/调用方，例如 `apps/server/test/records-smoke.e2e-spec.ts:6-45`、`apps/web/src/stores/auth-session.spec.ts:101-117`。即使这些测试今天未必立刻失败，也会让后续排查 phase regression 时失去可靠基线。

**Fix:**

```ts
export const PHASE11_SMOKE_RECORD_REQUEST = {
  // 还原为 Phase 11 原始历史快照
  typeLabel: '一级行政区',
  subtitle: 'Phase 11 Demo Country · 一级行政区',
}

export const PHASE12_RESOLVED_CALIFORNIA = {
  // 保持 Phase 12 历史语义不变
  typeLabel: '一级行政区',
  subtitle: 'United States · 一级行政区',
}
```

把当前 authoritative 英文标签全部留在 `PHASE28_*` fixtures 里，并让 Phase 28 的 web/contracts tests 只消费这些新 fixtures。

## Residual Risks / Testing Gaps

- 当前没有一条自动化测试显式校验 canonical `datasetVersion` 与 geometry dataset version 必须是两个不同概念。
- 当前没有覆盖“旧 `UserTravelRecord` 先回填，再经 `/auth/bootstrap` / same-user sync 回放”的真实迁移路径。

---

_Reviewed: 2026-04-21T07:32:40Z_  
_Reviewer: Codex (gsd-code-reviewer)_  
_Depth: standard_
