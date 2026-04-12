---
phase: 23-auth-ownership-foundation
plan: 08
subsystem: auth
tags: [nest, prisma, auth, transaction, validation, vitest]
requires:
  - phase: 23-02
    provides: base register/login/session flow
provides:
  - transactional user plus current-device session registration path
  - trim-first server-side username validation contract
  - register regression specs for transaction failure and username boundaries
affects: [AUTH-01, AUTH-02, register failure paths, server auth verification]
tech-stack:
  added: []
  patterns:
    - Prisma repository transaction for multi-write auth flows
    - class-transformer trim-first DTO normalization
    - service plus e2e regression coverage for register edge cases
key-files:
  created:
    - apps/server/src/modules/auth/auth.service.spec.ts
  modified:
    - apps/server/src/modules/auth/auth.repository.ts
    - apps/server/src/modules/auth/auth.service.ts
    - apps/server/src/modules/auth/dto/register.dto.ts
    - apps/server/test/auth-session.e2e-spec.ts
key-decisions:
  - "register() 只通过 AuthRepository.createUserWithSession() 写入 user 与当前设备 session，不再在 service 层拆成两次独立落库。"
  - "用户名在 RegisterDto 中先 trim 再执行 2..32 校验，service 直接消费规范化后的值。"
  - "对 duplicate email 的 ConflictException 映射保持不变，避免 gap 修复破坏原有语义。"
requirements-completed: [AUTH-01, AUTH-02]
completed: 2026-04-12
---

# Phase 23 Plan 08: Register Hardening Summary

**注册链路已收口为单事务 user+session 创建，服务端用户名规则也固定为 trim-first 的 `2..32` 合同。**

## Accomplishments

- 新增 `AuthRepository.createUserWithSession()`，让注册流程在 Prisma transaction 内原子创建 `User` 与 `AuthSession`。
- `AuthService.register()` 现在只走事务入口，保留 email normalize、密码 hash 与 duplicate email 的冲突映射。
- `RegisterDto` 增加 trim-first 变换，阻止纯空白用户名和 trim 后超长用户名进入 service。
- 补齐 `auth.service.spec.ts` 与 `auth-session.e2e-spec.ts`，覆盖事务失败、唯一约束、空白用户名、trim 持久化、32 字符上限等回归点。

## Verification

- `pnpm --filter @trip-map/server test -- src/modules/auth/auth.service.spec.ts` ✅
- `pnpm --filter @trip-map/server typecheck` ✅
- `pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` ⚠️ 当前环境仍无法连接 `aws-1-ap-southeast-1.pooler.supabase.com:5432`，因此 e2e 未能在本机复绿；失败原因与本次代码逻辑无关。

## Decisions Made

- 事务边界放在 repository，而不是让 service 自己编排两段写库，以保证 register 的失败语义可复用且更容易测试。
- DTO 负责用户名规范化，service 不再二次 `trim()`，避免“校验通过但写库后变空字符串”的合同漂移。
- gap 修复只扩展与 register 问题直接相关的 tests，没有改动 login/logout/bootstrap 的既有链路。

## Issues Encountered

- server e2e 依赖的外部 PostgreSQL 在当前环境不可达，导致 `auth-session.e2e-spec.ts` 只能保留为已更新但未在本机复绿的环境受限项。

## Self-Check

PASSED

---
*Phase: 23-auth-ownership-foundation*
*Completed: 2026-04-12*
