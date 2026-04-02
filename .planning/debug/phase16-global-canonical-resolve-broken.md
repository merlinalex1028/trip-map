---
status: resolved
trigger: "Investigate issue: phase16-global-canonical-resolve-broken"
created: 2026-04-02T09:53:13Z
updated: 2026-04-02T10:05:00Z
---

## Current Focus

hypothesis: 已确认。当前剩余问题不在“是否还是 fixture click”这一层，而在“authoritative data snapshot 本身仍是裁剪样本”，所以即便 resolver 已提升到 geometry 命中，产品仍不可能满足“任意地点都 canonical resolve”。
test: 用现有 e2e / component spec 验证北京/天津/California 的非代表点点击已走 geometry 命中；同时确认 unsupported 区域不再暴露 Phase 12 临时文案，且海洋点击不会再弹全局 notice。
expecting: 已支持样本区域的真实点击会变成 resolved；未接入区域仍返回 OUTSIDE_SUPPORTED_DATA，但 message 变成产品文案，前端对海洋/无 fallback 命中的点击静默降级并清空旧选中态。
next_action: 基于当前事实重开后续 phase，补齐正式 source snapshot、manifest 与 catalog 生成链路，才有可能兑现“任意地点都 canonical resolve”。

## Symptoms

expected: 地图上任意地点点击后，按中国境内市级行政区、境外一级行政区进行 canonical 识别；海洋等无效区域应给出合适的产品级反馈，而不是暴露 Phase 12 临时实现文案。
actual: 当前大多数地点无法识别，California 只是特判；海洋区域出现 `当前点击位置不在 Phase 12 临时 authoritative catalog 覆盖范围内。`；整体基本不可用。
errors: 无崩溃日志，但存在明显错误的用户可见 toast 文案和大面积识别失败。
reproduction: 打开地图，点击中国/海外任意多个地点，尤其非 fixture 代表点；再点击海洋区域。
started: 在刚完成 `$gsd-execute-phase 16` 之后人工验收全部失败；从代码看 Phase 12 canonical resolve 仍可能停留在 fixture/catalog 实现。

## Eliminated

- hypothesis: 问题只来自 Phase 16 的前端 fallback/点亮按钮接线
  evidence: `server` resolver、Phase 13 build pipeline 和 source snapshot 都仍是样板数据链，前端只是把 server 的 sample-only 结果继续暴露出来。
  timestamp: 2026-04-02T10:08:30Z

## Evidence

- timestamp: 2026-04-02T09:53:13Z
  checked: apps/server/src/modules/canonical-places/canonical-places.service.ts
  found: `resolve()`/`confirm()` 仍通过 `findFixture()` 查 `CANONICAL_RESOLVE_FIXTURES`；找不到时直接返回带有 “Phase 12 临时 authoritative catalog” 文案的 failed 响应。
  implication: server 运行时权威解析器并未升级为真实行政区解析，而是继续暴露了 Phase 12 临时 fixture 实现。

- timestamp: 2026-04-02T09:53:13Z
  checked: apps/server/src/modules/canonical-places/fixtures/canonical-place-fixtures.ts
  found: fixture catalog 只覆盖 Beijing/Hong Kong/Aba/California/Tianjin/Langfang 以及一个 ambiguous 点和一个 failed 点；California 是唯一带 bbox 的特判。
  implication: 除极少数样本外，真实点击几乎都会 miss fixture，解释了“大多数地点无法识别”。

- timestamp: 2026-04-02T09:53:13Z
  checked: .planning/phases/16-uat-gap-fallback-smoke-record-schema-typelabel-california/16-VERIFICATION.md
  found: Phase 16 验证只把 California bbox 识别列为真值之一，并把真实地图体验留给人工抽样；未验证“中国/海外任意地点 canonical resolve”。
  implication: Phase 16 验证通过并不等于产品具备全量 canonical resolve，只证明了 California 特判与若干 wiring 正常。

- timestamp: 2026-04-02T10:02:00Z
  checked: apps/web/scripts/geo/build-geometry-manifest.mjs, packages/contracts/src/generated/geometry-manifest.generated.ts, apps/web/public/geo/2026-03-31-geo-v1/manifest.json
  found: Phase 13 build 脚本从注释到映射常量都只生成 6 个 authoritative 边界；生成 manifest 也确实只有 6 条 entry。
  implication: 几何交付层本身不是全量行政区数据，runtime 不可能支持“任意地点都可 canonical resolve”。

- timestamp: 2026-04-02T10:02:00Z
  checked: apps/web/src/data/geo/sources/datav-cn-2026-03-31.geo.json, apps/web/src/data/geo/sources/natural-earth-admin1-5.1.1.geo.json
  found: 当前 repo 内 authoritative source snapshot 仅含 5 个中国 feature 和 3 个海外 admin1 feature。
  implication: 即使 resolver 改为 polygon 命中，现有仓库数据也只能覆盖极少样本区域；真正的全量修复需要先补齐正式 source snapshot 与 manifest 生成策略。

- timestamp: 2026-04-02T10:02:00Z
  checked: apps/web/src/components/LeafletMapStage.vue
  found: map click 在 server 返回 OUTSIDE_SUPPORTED_DATA 后会回退到 `lookupCountryRegionByCoordinates()` 的前端旧 fallback；若 fallback 也 miss，则直接把 server message 作为 toast 暴露给用户。
  implication: 真实产品体验被“临时 server authoritative + 旧前端 fallback”混合链路掩盖，进一步让验证误以为主链路可用。

- timestamp: 2026-04-02T10:08:30Z
  checked: apps/server/src/modules/canonical-places/canonical-places.service.ts
  found: resolved 分支已改为基于当前 geometry shard 做 point-in-polygon 命中；ambiguous/failed fixture 仅保留为特例；OUTSIDE_SUPPORTED_DATA 改为产品级 message。
  implication: “真实点击必须精确踩中 fixture 点”的运行时缺陷已被移除，当前支持区域的体验与数据层更一致。

- timestamp: 2026-04-02T10:08:30Z
  checked: apps/server/test/canonical-resolve.e2e-spec.ts
  found: 定向 e2e 通过 17/17，覆盖北京/天津/California 的非代表点点击和新的 unsupported message。
  implication: 当前修复对已接入样本区域有效，且不会再把 Phase 12 临时文案暴露给用户。

- timestamp: 2026-04-02T10:05:00Z
  checked: apps/web/src/components/LeafletMapStage.vue, apps/web/src/components/LeafletMapStage.spec.ts
  found: 当前端收到 `OUTSIDE_SUPPORTED_DATA` 且 `lookupCountryRegionByCoordinates()` 也 miss 时，已改为清空旧选中态并静默结束识别，不再把 unsupported message 作为全局 notice 弹出；对应 component spec 通过 15/15。
  implication: 海洋/未覆盖区域不再出现“Phase 12 临时 authoritative catalog”或其替代错误 toast，也不会把旧 popup 锚到新点击位置上继续误导用户。

- timestamp: 2026-04-02T10:08:30Z
  checked: `pnpm --filter @trip-map/server exec tsc --noEmit`
  found: typecheck 失败来自仓库既有问题：`backfill-record-metadata.ts`/部分 test 的 `.ts` import，以及 `CreateTravelRecordDto` 与 contracts 类型不匹配；与本次 canonical resolve 修改无关。
  implication: 本次修复已通过定向 e2e，但无法用当前仓库的全量 server typecheck 作为干净验证信号。

## Resolution

root_cause: Phase 12 的 canonical resolve 一直停留在 representative fixture/catalog 匹配；Phase 13 的 authoritative source snapshot 与 geometry manifest 又只包含 6 个裁剪样本边界；Phase 16 只围绕 California 特判和若干 wiring 做验证，没有验证全量覆盖，导致“验证通过”与“真实产品仍是样板链”并存。
fix: 把 `apps/server/src/modules/canonical-places/canonical-places.service.ts` 的 resolved 分支改为基于现有 geometry shard 的 point-in-polygon 命中，保留 ambiguous/failed fixture 作为特例，并将 OUTSIDE_SUPPORTED_DATA 改为产品级 message；同时调整 `apps/web/src/components/LeafletMapStage.vue`，让 unsupported 且无 fallback 命中的点击静默降级并清空旧选中态，不再弹全局 notice；补充 server e2e 和 web component spec 锁定这些行为。
verification: `pnpm --filter @trip-map/server exec vitest run test/canonical-resolve.e2e-spec.ts` 17/17 通过；`pnpm --filter @trip-map/web exec vitest run src/components/LeafletMapStage.spec.ts` 15/15 通过。`pnpm --filter @trip-map/server exec tsc --noEmit` 仍因仓库既有 DTO / `.ts` import 问题失败，非本次改动引入。原始“任意地点都 canonical resolve”目标仍无法在当前裁剪 source snapshot 下完成。
files_changed:
  - apps/server/src/modules/canonical-places/canonical-places.service.ts
  - apps/server/test/canonical-resolve.e2e-spec.ts
  - apps/web/src/components/LeafletMapStage.vue
  - apps/web/src/components/LeafletMapStage.spec.ts
