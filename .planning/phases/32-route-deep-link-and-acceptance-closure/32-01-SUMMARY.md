---
phase: 32-route-deep-link-and-acceptance-closure
plan: 01
subsystem: web-router
tags:
  - auth
  - router
  - test
  - guard
requires: []
provides:
  - router-auth-guard
  - router-spec
affects:
  - apps/web/src/router/index.ts
  - apps/web/src/App.spec.ts
tech-stack:
  added: []
  patterns:
    - vue-router beforeEach navigation guard
    - pinia store integration in router guard
    - vitest + pinia store mocking for router tests
key-files:
  created:
    - apps/web/src/router/index.spec.ts
  modified:
    - apps/web/src/router/index.ts
    - apps/web/src/App.spec.ts
decisions:
  - "Router 级 auth guard 在 beforeEach 中读取 authSessionStore，D-04/D-05 fail-closed 策略已锁定"
  - "App.spec.ts 的独立 memory router 与真实 router guard 分离，auth 行为由 router/index.spec.ts 覆盖"
metrics:
  duration: ""
  completed: "2026-04-28T05:01:00Z"
---

# Phase 32 Plan 01: Router Auth Guard + 测试覆盖 摘要

为 `/timeline` 与 `/statistics` 路由添加 Vue Router 级 auth guard，实现 D-04/D-05 的 fail-closed 策略（未登录重定向到 `/`），创建 6 个场景的真实 router 回归测试，更新 App.spec.ts 补全 `/statistics` 路由覆盖。

## 完成的任务

| Task | 名称 | 类型 | 提交 |
|------|------|------|------|
| 1 | 创建 router/index.spec.ts + 添加 auth guard | TDD (RED/GREEN) | b504fc2, 25e2f0a |
| 2 | 更新 App.spec.ts | auto | 2f068d9 |

## 实现细节

### Router Auth Guard (`apps/web/src/router/index.ts`)
- `/timeline` 和 `/statistics` 路由添加 `meta: { requiresAuth: true }`
- `beforeEach` 守卫：restoring 状态时 await `restoreSession()`，非 authenticated 状态重定向到 `/`
- `useAuthSessionStore()` 在 beforeEach 内调用确保每次导航获取最新实例

### 路由测试 (`apps/web/src/router/index.spec.ts`)
- 6 个测试用例覆盖：匿名重定向（/timeline、/statistics）、已认证通过、restoring→anonymous、restoring→authenticated
- 使用 `setActivePinia(createPinia())` + `vi.spyOn` mock auth store

### App.spec.ts 更新
- 测试路由表新增 `/statistics` 路由
- 添加注释说明 App.spec.ts 使用独立 memory router（不含 auth guard），真实 guard 行为由 `router/index.spec.ts` 覆盖
- `renders map stage only on the map route` 测试追加 `/statistics` 路由切换验证

## 验证结果

- `router/index.spec.ts`：6/6 测试通过
- `App.spec.ts`：19/19 测试通过
- 全量 web 测试：36 文件 / 308 测试通过
- TypeScript typecheck：零错误

## 偏离计划

无 — 计划完全按预期执行。

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | b504fc2: `test(32-01): add failing router auth guard tests` | ✓ |
| GREEN | 25e2f0a: `feat(32-01): add router-level auth guard...` | ✓ |
| REFACTOR | N/A | — |

## Self-Check: PASSED

- [x] `apps/web/src/router/index.spec.ts` 文件存在
- [x] `apps/web/src/router/index.ts` 包含 `meta: { requiresAuth: true }` 和 `beforeEach`
- [x] 提交 b504fc2、25e2f0a、2f068d9 存在
- [x] 全量测试 308/308 通过
- [x] typecheck 零错误
