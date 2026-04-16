---
phase: 26
slug: overseas-coverage-foundation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-16
source_state: B
---

# Phase 26 — Security

> 基于 `26-01/02/03-PLAN.md` 的 `<threat_model>`、`26-01/02/03-SUMMARY.md`、实现代码与当前测试结果的追溯审计。
> 输入未提供 `<config>`；`asvs_level: 1` 为模板默认值，仅作审计记录，不参与本次结论推导。

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Natural Earth raw admin1 source -> product support surface | 原始源数据包含噪声条目与超出 Phase 26 范围的全球区域，不能直接产品化 | overseas admin1 原始边界与 sourceFeatureId |
| generated manifest -> canonical resolve service | 如果 manifest 不先过滤，server 会把超出承诺范围的海外 admin1 当成 authoritative 支持面 | generated manifest, geometry shard metadata |
| authoritative canonical metadata -> persisted UserTravelRecord | 如果 metadata 只存在于一次 resolve 响应里，刷新和跨设备就会漂移 | displayName, typeLabel, parentLabel, subtitle |
| legacy fixture lookup -> backfill script | 若继续依赖 4 个 fixture，Phase 26 新增国家的旧记录无法被修复 | legacy travel/smoke rows metadata |
| server resolve failure -> popup interaction | 如果 unsupported 反馈跑到全局 notice，用户会误解为点击失效或通用错误 | OUTSIDE_SUPPORTED_DATA, fallback notice |
| candidate-select flow -> normal overseas resolve flow | 若单一 resolved 命中也被强制确认，会把每次海外点亮都变成额外负担 | resolved / ambiguous interaction flow |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status | Evidence | Test Coverage |
|-----------|----------|-----------|-------------|------------|--------|----------|---------------|
| T-26-01 | Tampering | overseas support catalog / manifest generation | mitigate | 用显式 priority-country allowlist + AE/AU 特例过滤生成 authoritative overseas manifest | closed | `apps/web/scripts/geo/overseas-admin1-support.mjs:1-34` 定义 8 国 allowlist 与 AE/AU denylist；`apps/web/scripts/geo/build-geometry-manifest.mjs:369-389` 只写入 `isSupportedOverseasAdmin1Feature()` 通过的 feature；`packages/contracts/src/generated/geometry-manifest.generated.ts:3717,3767,4277,4837,5244-5284` 保留 `kr-gangwon` / `ae-emirate-of-dubai` / `us-california` / `jp-tokyo` / `SG-01~05` | `pnpm --filter @trip-map/web run geo:build:check` 通过，输出 `overseas entries: 228` |
| T-26-04 | Repudiation | canonical resolve support scope | mitigate | 用 Tokyo / Gangwon / Dubai / out-of-scope 点击回归，明确支持与拒绝范围 | closed | `apps/server/src/modules/canonical-places/canonical-places.service.ts:77-108,255-289` 从 `GEOMETRY_MANIFEST` 加载 authoritative 几何并对支持面外返回 `OUTSIDE_SUPPORTED_DATA`；`apps/server/test/canonical-resolve.e2e-spec.ts:209-295,450-467` 覆盖 Tokyo/Gangwon/Dubai/Vancouver | `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts` 通过，23 tests passed |
| T-26-02 | Tampering | persisted overseas record metadata | mitigate | 通过 shared manifest-backed metadata catalog 固定 displayName/typeLabel/parentLabel/subtitle 真源 | closed | `apps/server/src/modules/canonical-places/place-metadata-catalog.ts:59-140` 从 geometry shard + manifest 构建 shared catalog；`apps/server/scripts/backfill-record-metadata.ts:55-156` 使用 shared lookup 回填旧记录；`apps/web/src/stores/map-points.ts:51-68` 直接回放持久化字段 | `apps/server/test/records-travel.e2e-spec.ts:407-452` 验证 Tokyo backfill；`apps/server/test/auth-bootstrap.e2e-spec.ts:235-279` 验证 bootstrap 原样回放；`apps/web/src/stores/map-points.spec.ts:270-284` 验证前端不按 `placeId` 重算文本 |
| T-26-07 | Tampering | /records overseas create/import payload | mitigate | /records 对 OVERSEAS_ADMIN1 走 authoritative metadata/support validation，拒绝 out-of-scope 或文本被伪造的 payload | closed | `apps/server/src/modules/records/records.service.ts` 现在对 `datasetVersion/displayName/regionSystem/adminType/typeLabel/parentLabel/subtitle` 全量执行 authoritative 比对；`createTravel()` 与 `importTravel()` 共用同一校验入口 | `apps/server/test/records-travel.e2e-spec.ts` 已覆盖 forged metadata rejection；`apps/server/test/records-import.e2e-spec.ts` 已覆盖 `/records/import` forged metadata rejection；`pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts test/records-import.e2e-spec.ts` 提权后通过，16 tests passed |
| T-26-05 | Repudiation | bootstrap / multi-session replay semantics | mitigate | 用 auth-bootstrap + records-sync + map-points regressions 锁住 server replay 与 frontend rendering 一致性 | closed | `apps/server/src/modules/auth/auth.service.ts:35-49,167-196` 直接回放持久化记录字段；`apps/web/src/stores/map-points.ts:51-68` 直接消费 record 文本 | `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts test/auth-bootstrap.e2e-spec.ts test/records-sync.e2e-spec.ts` 通过，19 tests passed；`apps/web/src/stores/map-points.spec.ts:270-284` 同步验证前端回放 |
| T-26-03 | Repudiation | unsupported overseas feedback | mitigate | 把 unsupported 解释收敛到 popup fallbackNotice + disabled CTA，不再以全局 notice 为主 | closed | `apps/web/src/constants/overseas-support.ts:1-16` 提供 unsupported notice builder；`apps/web/src/components/LeafletMapStage.vue:725-743` 在 `OUTSIDE_SUPPORTED_DATA` 分支写入 popup `fallbackNotice` 并清空全局 notice；`apps/web/src/components/map-popup/PointSummaryCard.vue:111-143` 渲染 fallback notice 与 disabled CTA hint | `apps/web/src/components/LeafletMapStage.spec.ts:889-911` 验证 unsupported 留在 popup 且无全局 notice；`apps/web/src/components/map-popup/PointSummaryCard.spec.ts:163-177,266-284` 验证 disabled CTA 与 notice 顺序 |
| T-26-06 | Denial of Service | candidate-select overuse | mitigate | 只在 ambiguous 时显示候选确认，单一 resolved 命中继续直接进入正常点亮路径 | closed | `apps/web/src/components/LeafletMapStage.vue:465-480,484-518,712-723` 单一 resolved 直接进入普通详情，只有 `ambiguous` 才进入 `candidate-select` | `apps/web/src/components/LeafletMapStage.spec.ts:555-617` 验证 `ambiguous -> candidate-select` 与 `single resolved overseas hit -> detected-preview`；`pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/stores/map-points.spec.ts` 通过，66 tests passed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Open Threat Notes

No open threats.

---

## Accepted Risks Log

No accepted risks.

---

## Unregistered Flags

未发现未登记 threat flag。`26-01-SUMMARY.md`、`26-02-SUMMARY.md`、`26-03-SUMMARY.md` 中均未包含 `## Threat Flags` 段落。

---

## Verification Commands

| Command | Result |
|---------|--------|
| `pnpm --filter @trip-map/web run geo:build:check` | passed |
| `pnpm --filter @trip-map/server test -- test/canonical-resolve.e2e-spec.ts` | passed (`23 tests`) |
| `pnpm --filter @trip-map/web test -- src/components/LeafletMapStage.spec.ts src/components/map-popup/PointSummaryCard.spec.ts src/stores/map-points.spec.ts` | passed (`66 tests`) |
| `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts test/auth-bootstrap.e2e-spec.ts test/records-sync.e2e-spec.ts` | passed after sandbox escalation for DB access (`19 tests`) |
| `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts test/records-import.e2e-spec.ts` | passed after sandbox escalation (`16 tests`) |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-16 | 7 | 6 | 1 | Codex / gsd-security-auditor |
| 2026-04-16 | 7 | 7 | 0 | Codex |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-16
