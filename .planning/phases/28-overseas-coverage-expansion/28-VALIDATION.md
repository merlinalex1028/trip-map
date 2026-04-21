---
phase: 28
slug: overseas-coverage-expansion
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-21
---

# Phase 28 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest（web / server / contracts 全包统一） |
| **Config file** | `apps/web/vitest.config.ts` / `apps/server/vitest.config.ts` / `packages/contracts/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @trip-map/contracts build && pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After every task commit:** 运行与当前切片直接相关的最小 smoke / targeted 命令；优先使用下方 Per-Task Verification Map 中的单任务命令，而不是一口气跑整波回归
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds（wave 级完整矩阵回归允许超过 30 秒，但不计入 task-level Nyquist 反馈窗口）

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 28-01-01 | 01 | 1 | GEOX-01 | T-28-01-01 | support matrix 只在 build-time authoring 层扩容，且新增国家全部是 admin1-only | unit | `node --input-type=module -e "import('./apps/web/scripts/geo/overseas-admin1-support.mjs').then((m) => { const required = ['JP','KR','TH','SG','MY','IN','ID','AE','SA','AU','PG','US','CA','BR','AR','DE','PL','CZ','EG','MA','ZA']; for (const code of required) { if (!m.priorityCountries.includes(code)) throw new Error(code) } if (m.priorityCountries.length !== required.length) throw new Error('priorityCountries length mismatch') })"` | ✅ | ⬜ pending |
| 28-01-02 | 01 | 1 | GEOX-01, GEOX-02 | T-28-01-02 | build script 生成 v3 dataset 和标准英文 label policy，而不是继续写 `一级行政区` | integration | `pnpm --filter @trip-map/web geo:build:check && pnpm --filter @trip-map/contracts build` | ✅ | ⬜ pending |
| 28-01-03 | 01 | 1 | GEOX-01 | T-28-01-03 | geometry-manifest regression 锁住 v3、`overseas/layer.json` 和新增国家 coverage | unit | `pnpm --filter @trip-map/web test src/services/geometry-manifest.spec.ts` | ✅ | ⬜ pending |
| 28-02-01 | 02 | 2 | GEOX-02 | T-28-02-01 | server exact-match guard 与 backfill 使用 Phase 28 canonical metadata，不保留旧 `一级行政区` persisted text | e2e | `cd apps/server && pnpm test test/record-metadata-backfill.e2e-spec.ts && pnpm test test/records-travel.e2e-spec.ts` | ✅ | ⬜ pending |
| 28-02-02 | 02 | 2 | GEOX-01, GEOX-02 | T-28-02-02 | 全新增国家矩阵的 resolve + metadata correctness 被表驱动验证，且 bootstrap/sync 不会回放旧标签 | e2e | `cd apps/server && pnpm test test/canonical-resolve.e2e-spec.ts && pnpm test test/records-import.e2e-spec.ts && pnpm test test/auth-bootstrap.e2e-spec.ts && pnpm test test/records-sync.e2e-spec.ts` | ✅ | ⬜ pending |
| 28-03-01 | 03 | 2 | GEOX-02 | T-28-03-01 | unsupported-country copy 直接消费 generated supported-country summary，不再双写静态 8 国名单 | unit | `pnpm --filter @trip-map/contracts build && pnpm --filter @trip-map/web test src/components/LeafletMapStage.spec.ts && pnpm --filter @trip-map/web test src/components/map-popup/PointSummaryCard.spec.ts` | ✅ | ⬜ pending |
| 28-03-02 | 03 | 2 | GEOX-02 | T-28-03-02 | contracts/web fixtures 和 consumer regression 升级到 v3 geometryRef 与标准英文标签，消费者继续只读 persisted metadata | unit | `pnpm --filter @trip-map/contracts test && pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 选择一个新增国家的 admin1 点位，在地图上实际点击后能出现正确标题与类型标签 | GEOX-01, GEOX-02 | 需要真实浏览器地图交互与视觉确认 | 本地运行 web + server，选择新增国家中的一个行政区，确认 resolve/save 后 popup 展示标准英文 `typeLabel`，再次刷新后仍一致 |
| unsupported-country notice 文案对用户可读、且不会误导为国家级 fallback 可用 | GEOX-01 | 需要人工评估文案理解成本 | 点击一个不在 21 国矩阵内的海外位置，确认提示包含当前检测地区名和支持国家摘要，且文案继续强调“一级行政区级别边界” |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s（task-level smoke）；wave-level full matrix 回归作为接受的例外
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-21
