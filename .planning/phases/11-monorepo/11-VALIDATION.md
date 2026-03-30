---
phase: 11
slug: monorepo
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-30
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `apps/web/vitest.config.ts`、`apps/server/vitest.config.ts`、`packages/contracts` typecheck/test scripts |
| **Quick run command** | `pnpm exec turbo run test --filter=@trip-map/contracts --filter=@trip-map/web --filter=@trip-map/server` |
| **Full suite command** | `pnpm build && pnpm test && pnpm typecheck` |
| **Estimated runtime** | ~25 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task's exact `<automated>` command from its plan
- **After every plan wave:** Run `pnpm build && pnpm test && pnpm typecheck`
- **Before `$gsd-verify-work`:** 配好 `DATABASE_URL` 后跑完整 `web -> server -> DB` smoke path
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | ARC-01 | orchestration graph dry-run | `pnpm exec turbo run build typecheck --dry=json` | ✅ existing | ⬜ pending |
| 11-01-02 | 01 | 1 | ARC-01, ARC-04 | contracts unit + typecheck | `pnpm --filter @trip-map/contracts test && pnpm --filter @trip-map/contracts typecheck` | ❌ planned | ⬜ pending |
| 11-02-01 | 02 | 2 | ARC-01 | web package bootstrap | `pnpm -C apps/web build && pnpm -C apps/web typecheck` | ❌ planned | ⬜ pending |
| 11-03-01 | 03 | 2 | ARC-01, ARC-04 | server contract boundary | `pnpm -C apps/server test -- test/health.e2e-spec.ts test/records-contract.e2e-spec.ts && pnpm -C apps/server typecheck` | ❌ planned | ⬜ pending |
| 11-05-01 | 05 | 3 | ARC-01 | source relocation | `pnpm -C apps/web build && pnpm -C apps/web typecheck` | ❌ planned | ⬜ pending |
| 11-05-02 | 05 | 3 | ARC-01 | regression stabilization | `pnpm -C apps/web test && pnpm -C apps/web build && pnpm -C apps/web typecheck` | ❌ planned | ⬜ pending |
| 11-06-01 | 06 | 3 | ARC-03, API-04 | Prisma smoke persistence | `pnpm -C apps/server test -- test/records-smoke.e2e-spec.ts && pnpm -C apps/server exec prisma validate` | ❌ planned | ⬜ pending |
| 11-04-01 | 04 | 4 | ARC-01, ARC-04 | web smoke adapter | `pnpm -C apps/web test -- src/components/BackendBaselinePanel.spec.ts src/services/api/phase11-smoke.spec.ts` | ❌ planned | ⬜ pending |
| 11-04-02 | 04 | 4 | ARC-01, ARC-04 | cross-workspace regression | `pnpm -C apps/web test && pnpm build && pnpm test && pnpm typecheck` | ❌ planned | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/server/vitest.config.ts` — 服务端 health / contract / smoke 测试配置
- [ ] `apps/server/test/records-contract.e2e-spec.ts` — 固化 records route 的 shared-contract + validation 边界
- [ ] `apps/server/test/records-smoke.e2e-spec.ts` — 覆盖最小 `web -> server -> DB` 真实链路
- [ ] `packages/contracts` 的 typecheck / contract smoke 脚本 — 约束 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 字段不漂移
- [ ] `apps/web` API adapter 测试，例如 `src/services/api/*.spec.ts` — 确认 web 使用 contracts DTO
- [ ] `apps/web/src/legacy-entry.ts` 与后续 removal — 支撑 `apps/web` package shell 先落地、再在 11-05 移除过渡桥
- [ ] `turbo.json` 与各 package 的 `build/test/typecheck/dev` 脚本
- [ ] `.env.example` 或等效环境说明，至少包含 `DATABASE_URL`、`DIRECT_URL`、`VITE_API_BASE_URL` 或 proxy 约定

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `apps/web` 能在独立启动时正确连到 `apps/server` 的最小 smoke path | ARC-01 | 需要人工确认多进程联调与运行指引是否真实可用 | 启动 `web` 与 `server`，在浏览器中触发 smoke flow，确认请求走到 server 而不是本地存储 |
| 切换到 Supabase 托管 PostgreSQL 时，不需要额外启用 Supabase 平台能力 | ARC-03, API-04 | 是否依赖平台专有能力需要结合配置和运行方式人工复核 | 检查环境变量、README/注释和运行步骤，确认只需要标准 PostgreSQL 连接串 |
| 共享字段语义在前端请求、服务端校验、数据库读写之间一致 | ARC-04 | 字段“同名同义”涉及代码路径联读与真实请求观察 | 触发 smoke path，检查请求体、服务端 DTO/response 和数据库记录中的字段名称与枚举值 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** revised and approved 2026-03-30
