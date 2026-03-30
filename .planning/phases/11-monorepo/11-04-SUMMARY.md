---
phase: 11-monorepo
plan: 04
subsystem: api
tags: [vite, vue, nestjs, prisma, postgres, proxy, vitest]
requires:
  - phase: 11-06
    provides: Prisma/PostgreSQL-backed smoke record persistence for apps/server
  - phase: 11-10
    provides: package-local apps/web app shell and regression surface
provides:
  - Contract-backed backend baseline panel in apps/web
  - Shared web API adapter for health and smoke record requests
  - Vite dev proxy for /api to local server
  - Stable root workspace verification across web/server/contracts
affects: [phase-11, phase-12, web, server, contracts, testing]
tech-stack:
  added: []
  patterns:
    - Thin web API adapter over shared contracts fixtures
    - Dev proxy keeps localhost wiring out of Vue components
    - Server e2e suites use isolated smoke fixture variants for deterministic root verification
key-files:
  created:
    - apps/web/src/components/BackendBaselinePanel.vue
    - apps/web/src/services/api/client.ts
    - apps/web/src/services/api/phase11-smoke.ts
  modified:
    - apps/web/src/App.vue
    - apps/web/src/App.spec.ts
    - apps/web/src/components/BackendBaselinePanel.spec.ts
    - apps/web/src/services/api/phase11-smoke.spec.ts
    - apps/web/vite.config.ts
    - apps/server/test/records-contract.e2e-spec.ts
    - apps/server/test/records-smoke.e2e-spec.ts
    - .gitignore
key-decisions:
  - "BackendBaselinePanel stays additive in App.vue above WorldMapStage so Phase 11 proves the backend boundary without disturbing the existing map shell."
  - "apps/web uses a single createApiUrl helper with /api default and Vite proxy rewrite, keeping backend host details out of components."
  - "Server e2e smoke suites isolate datasetVersion values per spec file so root pnpm test remains deterministic against the shared PostgreSQL instance."
patterns-established:
  - "API adapter pattern: UI calls typed helper functions that own URL construction and shared fixture payloads."
  - "Cross-app smoke regression pattern: web specs assert shared field names while server e2e uses unique fixture variants for DB-backed verification."
requirements-completed: [ARC-01, ARC-04]
duration: 28min
completed: 2026-03-30
---

# Phase 11 Plan 04: Cross-App Smoke Path Summary

**apps/web 现在通过统一 API adapter 和 dev proxy 暴露 backend baseline panel，可直接读取 server health 并触发 shared-contract smoke record 写链路**

## Performance

- **Duration:** 28 min
- **Started:** 2026-03-30T06:39:00Z
- **Completed:** 2026-03-30T07:07:43Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- 在 `apps/web` 新增 `BackendBaselinePanel`，挂到 `App.vue` 且不替换现有 `WorldMapStage`、popup 或 drawer 主链路。
- 新增 `createApiUrl` 和 `phase11-smoke` adapter，health/smoke 请求统一走 shared contracts 与 `PHASE11_SMOKE_RECORD_REQUEST`。
- 为 `apps/web` 增加 `/api` dev proxy，并补齐 web/server/contracts 的 root 验证所需回归测试与测试隔离。

## Task Commits

Each task was committed atomically:

1. **Task 1: Add a contract-backed backend baseline panel and API adapter inside `apps/web`** - `655a871` (test), `257d334` (feat)
2. **Task 2: Wire dev proxy and regression tests for the Phase 11 cross-app smoke path** - `62b75af` (test), `c280dac` (fix)

## Files Created/Modified
- `apps/web/src/components/BackendBaselinePanel.vue` - Phase 11 backend baseline health/smoke UI
- `apps/web/src/services/api/client.ts` - shared API base URL helper using `VITE_API_BASE_URL ?? '/api'`
- `apps/web/src/services/api/phase11-smoke.ts` - typed health and smoke record adapter backed by contracts fixture
- `apps/web/src/App.vue` - mounts backend baseline panel above the existing map stage
- `apps/web/src/App.spec.ts` - verifies panel and current app shell coexist
- `apps/web/src/components/BackendBaselinePanel.spec.ts` - verifies health render and smoke record render
- `apps/web/src/services/api/phase11-smoke.spec.ts` - verifies adapter calls and Vite proxy config
- `apps/web/vite.config.ts` - proxies `/api` to `http://127.0.0.1:4000` with rewrite
- `apps/server/test/records-contract.e2e-spec.ts` - isolates contract smoke payload persistence cleanup
- `apps/server/test/records-smoke.e2e-spec.ts` - isolates PostgreSQL smoke suite fixture datasetVersion
- `.gitignore` - ignores generated `.turbo/` workspace output

## Decisions Made
- `App.vue` 保持 composition surface，只新增 `BackendBaselinePanel`，避免把 backend smoke 逻辑混进地图组件。
- 面板不直接写死绝对地址，统一经 `createApiUrl()` 生成 `/api/...` 请求，开发态再由 Vite proxy 转给 server。
- root `pnpm test` 的 server e2e 改为使用独立 `datasetVersion` 变体，避免共享 Supabase 库时并发测试互相污染。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stabilized server smoke e2e isolation for root workspace verification**
- **Found during:** Task 2
- **Issue:** `pnpm test` 在真实 PostgreSQL 环境下运行时，`records-contract.e2e-spec.ts` 和 `records-smoke.e2e-spec.ts` 共享同一份 smoke fixture，导致并发写入后 `storedRows` 数量不稳定。
- **Fix:** 为两个 server e2e suite 使用独立的 `datasetVersion` 变体，并在 contract suite 中补充前后清理。
- **Files modified:** `apps/server/test/records-contract.e2e-spec.ts`, `apps/server/test/records-smoke.e2e-spec.ts`
- **Verification:** `pnpm test`（在放开网络后）通过
- **Committed in:** `c280dac`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 该修复只影响测试隔离，不扩张 records API 范围，且是 root workspace 验证通过所必需。

## Issues Encountered
- 默认沙箱网络下无法连接 Supabase PostgreSQL，root `pnpm test` 需要放开网络后重跑才能完成真实 DB 验证。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `apps/web` 已具备最小 `web -> server -> DB/contracts` smoke surface，可作为后续 Phase 12 的 cross-app 基线。
- backend smoke 仍然只覆盖 Phase 11 baseline proof，没有扩展到完整 records CRUD、canonical resolve 或 localStorage 迁移。

## Self-Check: PASSED
- Found summary file: `.planning/phases/11-monorepo/11-04-SUMMARY.md`
- Found commits: `655a871`, `257d334`, `62b75af`, `c280dac`

---
*Phase: 11-monorepo*
*Completed: 2026-03-30*
