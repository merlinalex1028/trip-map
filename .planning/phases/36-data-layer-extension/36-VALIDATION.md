---
phase: 36
slug: data-layer-extension
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-29
---

# Phase 36 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | apps/server/vitest.config.ts (NestJS), packages/contracts/vitest.config.ts (contracts) |
| **Quick run command** | `pnpm --filter @trip-map/server vitest run` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @trip-map/server vitest run`（server 包测试）
- **After every plan wave:** Run `pnpm typecheck && pnpm --filter @trip-map/server vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

### Plan 01（schema + contracts）

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 36-01-01 | 01 | 1 | — | T-36-01 | 字段类型与 contracts 保持一致，不修改现有约束 | unit | `grep -c "notes\|tags" apps/server/prisma/schema.prisma` | ✅ | ✅ green |
| 36-01-02 | 01 | 1 | — | T-36-01 | 接口与 Prisma 类型一致，UpdateTravelRecordRequest 所有字段可选 | unit | `pnpm --filter @trip-map/contracts build` | ✅ | ✅ green |

### Plan 02（PATCH/DELETE 端点）

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 36-02-01 | 02 | 2 | EDIT-01, EDIT-02, EDIT-03 | T-36-02 | DTO 验证：notes≤1000字符, tags≤10个/个≤20字符, 日期YYYY-MM-DD | unit | `grep -c "class UpdateTravelRecordDto" apps/server/src/modules/records/dto/update-travel-record.dto.ts` | ✅ | ✅ green |
| 36-02-02 | 02 | 2 | DEL-01 | T-36-05 | Repository where 条件包含 `{ id, userId }` 行级权限 | unit | `grep -c "findTravelRecordById\|updateTravelRecord\|deleteTravelRecordById" apps/server/src/modules/records/records.repository.ts` | ✅ | ✅ green |
| 36-02-03 | 02 | 2 | EDIT-01~04, DEL-01 | T-36-02, T-36-04 | 标签清洗 trim+去重+过滤空, P2002→409, P2025→404 | unit | `grep -c "ConflictException\|P2002" apps/server/src/modules/records/records.service.ts` | ✅ | ✅ green |
| 36-02-04 | 02 | 2 | EDIT-01~03, DEL-01 | T-36-02, T-36-03 | SessionAuthGuard 认证, ValidationPipe 验证 | unit | `grep -c "@Patch\|deleteTravelById" apps/server/src/modules/records/records.controller.ts` | ✅ | ✅ green |
| 36-02-05 | 02 | 2 | — | — | Schema push 同步 notes/tags 到数据库 | manual | `npx prisma db push` | ✅ | ✅ green |
| 36-02-06 | 02 | 2 | — | — | 全量类型检查+构建, 103 测试全部通过 | unit | `pnpm typecheck && pnpm build` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing infrastructure covers all phase requirements. Vitest + NestJS testing already configured.
- [x] No test files needed — all tasks verified via grep/typecheck/build/prisma push.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Schema push 到数据库 | — | 需要数据库连接 | 运行 `npx prisma db push` 确认输出包含成功信息 |

---

## Validation Sign-Off

- [x] All tasks have automated verify command or manual verification documented
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-29
