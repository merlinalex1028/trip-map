---
phase: 16
slug: uat-gap-fallback-smoke-record-schema-typelabel-california
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-02
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/web/vitest.config.ts`, `apps/server/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-00-01 | 00 | 1 | REQ-16-03, REQ-16-04 | DB preflight | `pnpm --filter @trip-map/server exec prisma validate --schema prisma/schema.prisma && pnpm --filter @trip-map/server exec prisma migrate status --schema prisma/schema.prisma && pnpm --filter @trip-map/server exec vitest run test/records-contract.e2e-spec.ts` | ✅ create | ⬜ pending |
| 16-01-01 | 01 | 2 | REQ-16-03 | migration + backfill | `pnpm --filter @trip-map/contracts build && pnpm --filter @trip-map/server exec prisma migrate dev --name phase16_record_metadata_contracts && pnpm --filter @trip-map/server exec tsx scripts/backfill-record-metadata.ts && pnpm --filter @trip-map/server exec prisma generate` | ✅ extend | ⬜ pending |
| 16-01-02 | 01 | 2 | REQ-16-04 | server e2e + legacy reopen | `pnpm --filter @trip-map/server exec vitest run test/records-smoke.e2e-spec.ts test/records-travel.e2e-spec.ts test/records-contract.e2e-spec.ts` | ✅ extend | ⬜ pending |
| 16-02-01 | 02 | 3 | REQ-16-04 | store rehydrate | `pnpm --filter @trip-map/web exec vitest run src/stores/map-points.spec.ts` | ✅ extend | ⬜ pending |
| 16-02-02 | 02 | 3 | REQ-16-01, REQ-16-02 | component/integration | `pnpm --filter @trip-map/web exec vitest run src/components/map-popup/PointSummaryCard.spec.ts src/components/LeafletMapStage.spec.ts src/stores/map-points.spec.ts` | ✅ extend | ⬜ pending |
| 16-03-01 | 03 | 4 | REQ-16-05 | contracts + web fixture consumers | `pnpm --filter @trip-map/contracts build && pnpm --filter @trip-map/contracts test && pnpm --filter @trip-map/web exec vitest run src/stores/map-points.spec.ts src/components/LeafletMapStage.spec.ts` | ✅ extend | ⬜ pending |
| 16-03-02 | 03 | 4 | REQ-16-05 | server e2e | `pnpm --filter @trip-map/server exec vitest run test/canonical-resolve.e2e-spec.ts` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.planning/phases/16-uat-gap-fallback-smoke-record-schema-typelabel-california/16-00-DB-PREFLIGHT.md` — 记录 PostgreSQL preflight 结果，并在 DB 不可达时阻塞后续 server wave
- [ ] `apps/web/src/components/LeafletMapStage.spec.ts` — 补 fallback illuminate notice / disabled coverage，以及 illuminate 后 shard load coverage
- [ ] `apps/web/src/stores/map-points.spec.ts` — 补 `TravelRecord` canonical metadata rehydrate 覆盖
- [ ] `apps/server/test/records-travel.e2e-spec.ts` — 补 `regionSystem` / `adminType` / `typeLabel` / `parentLabel` 断言
- [ ] `apps/server/scripts/backfill-record-metadata.ts` — 按 `placeId` 从 authoritative fixture catalog 回填旧 `TravelRecord` / `SmokeRecord`
- [ ] 旧记录升级后 reopen 验证 — 需要证明 legacy `TravelRecord` 在 backfill 后重新拿回 canonical labels
- [ ] `apps/server/test/canonical-resolve.e2e-spec.ts` — 补 California 非精确代表点点击覆盖，并锁定 authoritative label/ID 口径
- [ ] DB connectivity restored — 当前 server migration/e2e 受 PostgreSQL 连通性约束，必须在 16-00 先解锁

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| fallback 点位的点亮入口文案和交互反馈是否清晰 | REQ-16-01 | 需要确认按钮隐藏/禁用/notice 的实际观感是否消除“假可点击”误导 | 打开一个 `OUTSIDE_SUPPORTED_DATA` fallback 点位，确认不会再出现无反馈点击；若保留入口，必须出现明确禁用态或 notice |
| 点亮后蓝色 saved overlay 的真实可见性 | REQ-16-02 | 自动化可以断言 shard load 与 store 状态，但不能完全替代地图视觉确认 | 点击可识别地点后点亮，确认地图出现 saved 边界高亮，并在 reopen/refresh 后无残留或缺失 |
| California 在真实地图点击中的识别体验 | REQ-16-05 | 需要验证非 fixture 精确点点击时的实际 popup 文案和 canonical 结果 | 在 California 区域多个位置点击，确认均走 server-authoritative resolved branch，并显示一致的 type label / subtitle |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-02
