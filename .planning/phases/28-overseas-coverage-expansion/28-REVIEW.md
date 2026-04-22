---
phase: 28-overseas-coverage-expansion
reviewed: 2026-04-22T03:21:32Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - apps/web/scripts/geo/build-geometry-manifest.mjs
  - apps/web/public/geo/2026-04-21-geo-v3/manifest.json
  - apps/web/public/geo/2026-04-21-geo-v3/overseas/layer.json
  - packages/contracts/src/generated/geometry-manifest.generated.ts
  - apps/server/src/modules/canonical-places/place-metadata-catalog.ts
  - apps/server/scripts/backfill-record-metadata.ts
  - apps/server/test/phase28-overseas-cases.ts
  - apps/server/test/canonical-resolve.e2e-spec.ts
  - apps/server/test/records-travel.e2e-spec.ts
  - apps/server/test/record-metadata-backfill.e2e-spec.ts
  - apps/server/test/auth-bootstrap.e2e-spec.ts
  - apps/server/test/records-sync.e2e-spec.ts
findings:
  critical: 0
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 28: Code Review Report

**Reviewed:** 2026-04-22T03:21:32Z
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

本次按指定范围复审了 Phase 28 最终变更，并额外做了两类验证：

- 运行 server 侧 5 个相关测试文件：`record-metadata-backfill`、`auth-bootstrap`、`records-sync`、`records-travel`、`canonical-resolve`，结果为 `53 passed (53)`。
- 对 `manifest.json` 与 `overseas/layer.json` 做全量一致性检查，确认当前产物不存在重复 `placeId` / `boundaryId` / `renderableId`，且每条 manifest entry 都能在 shard 中找到带完整 canonical metadata 的 feature。

结论：当前没有发现新的功能性 crash 或数据错误，但仍有 1 条测试可靠性 Warning 和 1 条覆盖缺口 Info，需要在 Phase 28 收尾前补齐，否则后续 CI/回归保护仍然偏弱。

## Warnings

### WR-01: `auth-bootstrap` 的慢迁移回归仍使用默认超时，组合执行时仍有 flaky 风险

**File:** `apps/server/test/auth-bootstrap.e2e-spec.ts:376`
**Issue:** 这次 Phase 28 新增的 legacy overseas backfill 回归是本文件里最慢的用例。我用 `--reporter=verbose` 单独复跑时，这条测试本地耗时约 `9.1s`，已经明显高于普通接口级 e2e；但它没有像 `apps/server/test/records-sync.e2e-spec.ts:372` 那样附带显式 `30000` 超时。当前文件里唯一带 `30000` 的是另一条多 session 登出用例（结尾处的 `it(..., 30000)`），并没有覆盖这条真正的慢路径。默认 `testTimeout` 只有 15 秒时，这条用例在更慢的 CI 机器或组合执行下仍然有超时抖动空间。
**Fix:**
```ts
it('GET /auth/bootstrap replays upgraded Phase 28 metadata after backfilling legacy overseas userTravelRecord rows', async () => {
  // existing assertions
}, 30000)
```

把显式超时挂到真正的 legacy migration 用例上，或者直接给这一组 backfill replay 用例设置统一超时，避免只把超时放在无关测试上。

## Info

### IN-01: `updateMany(count=0)` 的 skipped 分支只验证了 `userTravelRecord`，另外两张表仍缺直接回归

**File:** `apps/server/test/record-metadata-backfill.e2e-spec.ts:116`
**Issue:** `apps/server/scripts/backfill-record-metadata.ts` 这次把 `travelRecord`、`smokeRecord`、`userTravelRecord` 三张表都切到了 `updateMany()` + `count` 分支，并分别维护 `matched*` / `unmatched*` / `skipped*` 汇总。但当前新增测试只覆盖了 `userTravelRecord` 的 zero-count skipped 路径，没有直接断言 `skippedTravelRows` 和 `skippedSmokeRows`。当前实现看起来是对称的，但如果后续有人在复制这三段循环时改坏某一张表的 summary 归类，现有测试不会拦住。
**Fix:**
```ts
it.each([
  ['travelRecord', 'matchedTravelRows', 'unmatchedTravelRows', 'skippedTravelRows'],
  ['smokeRecord', 'matchedSmokeRows', 'unmatchedSmokeRows', 'skippedSmokeRows'],
  ['userTravelRecord', 'matchedUserTravelRows', 'unmatchedUserTravelRows', 'skippedUserTravelRows'],
])('records zero-count rows as skipped for %s', async (table, matchedKey, unmatchedKey, skippedKey) => {
  // build prisma stub for the target table
  // assert summary[matchedKey] / summary[unmatchedKey] / summary[skippedKey]
})
```

把 zero-count 回归参数化到三张表，可以把这次 race hardening 的核心承诺一次性锁住。

---

_Reviewed: 2026-04-22T03:21:32Z_
_Reviewer: Codex (gsd-code-reviewer)_
_Depth: standard_
