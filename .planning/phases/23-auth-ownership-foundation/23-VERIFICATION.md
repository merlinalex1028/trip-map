---
phase: 23-auth-ownership-foundation
verified: 2026-04-12T16:01:36Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: passed
  previous_score: 7/7
  gaps_closed:
    - "匿名或刷新恢复阶段不会再由地图层额外请求 /records"
    - "current-user records 写入失败不再静默回滚，用户会收到明确 warning 反馈"
    - "登录失败显示错误提示后，认证弹层的居中布局合同已收口到应用自控 dialog surface"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "真实浏览器下验证登录失败后的认证弹层仍保持居中"
    expected: "输入错误密码后，弹层保持打开，错误提示出现但面板仍位于视口中央，不出现偏左或原生 dialog 位移"
    why_human: "当前自动化只验证 `data-auth-dialog-backdrop`/`data-auth-dialog` 的 DOM 与 class 合同，无法像浏览器渲染那样确认最终视觉定位"
---

# Phase 23: Auth & Ownership Foundation Verification Report

**Phase Goal:** 用户可以拥有独立账号身份，且账号成为旅行记录的唯一归属真源  
**Verified:** 2026-04-12T16:01:36Z  
**Status:** human_needed  
**Re-verification:** Yes — after gap closure plans 23-10 and 23-11

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 用户可以使用邮箱和密码注册、登录、退出，并在刷新页面或重新打开应用后恢复到同一账号会话。 | ✓ VERIFIED | `apps/server/src/modules/auth/auth.controller.ts` 提供 `register/login/logout/bootstrap`；`apps/server/src/modules/auth/auth.service.ts` 实现 `register/login/logout/restoreSession/bootstrap`；`apps/web/src/App.vue` 首挂调用 `restoreSession()`；`pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` 9 tests passed，`pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts` 4 tests passed。 |
| 2 | 已登录用户可以在界面中明确看到当前账号身份，并能从稳定入口执行退出操作。 | ✓ VERIFIED | `apps/web/src/components/auth/AuthTopbarControl.vue` 渲染用户名、邮箱与 `退出登录`；`apps/web/src/stores/auth-session.ts` 的 `logout()` 会清空会话边界并回到 anonymous；`pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/components/auth/AuthDialog.spec.ts src/components/LeafletMapStage.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` 65 tests passed。 |
| 3 | 登录后用户只能看到当前账号自己的旅行记录，不会读到其他账号或匿名上下文的数据。 | ✓ VERIFIED | `apps/server/src/modules/records/records.controller.ts` 的 `GET/POST/DELETE /records` 全部受 `@UseGuards(SessionAuthGuard)` 与 `@CurrentUser()` 保护；`apps/server/src/modules/records/records.repository.ts` 只对 `prisma.userTravelRecord` 做 `userId` 过滤与 `userId_placeId` 复合键读写；`pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts` 8 tests passed。 |
| 4 | 登录后新点亮的地点会绑定到当前账号，并在重新进入应用后仍可从云端重新加载出来。 | ✓ VERIFIED | `apps/server/src/modules/records/records.service.ts`/`records.repository.ts` 把写入绑定到当前 `userId`；`apps/server/src/modules/auth/auth.service.ts` 的 `bootstrap()` 从 `findUserTravelRecordsByUserId()` 返回当前账号 records；`apps/web/src/stores/auth-session.ts` 用 bootstrap snapshot 驱动 `replaceTravelRecords()`；`auth-bootstrap.e2e-spec.ts` 与 `records-travel.e2e-spec.ts` 均通过。 |
| 5 | 错误凭据登录不会被误判为会话失效，认证弹层与地图数据边界保持稳定。 | ✓ VERIFIED | `apps/web/src/services/api/client.ts` 将 401 拆成 `session-unauthorized` / `auth-submit-unauthorized`；`apps/web/src/services/api/auth.ts` 为 `login/register` 传入专属 unauthorized code；`apps/web/src/stores/auth-session.ts` 的 `runAuthRequest()` 仅在 session unauthorized 时调用 `handleUnauthorized()`；`apps/web/src/components/auth/AuthDialog.spec.ts` 覆盖失败登录不关弹层。 |
| 6 | 匿名或刷新恢复阶段不会再额外误打 `/records`，records 失败会给出明确反馈而不是静默回滚。 | ✓ VERIFIED | `apps/web/src/components/LeafletMapStage.vue` 已不再直接调用 `bootstrapFromApi()`/`fetchTravelRecords()`；`apps/web/src/App.spec.ts` 与 `apps/web/src/components/LeafletMapStage.spec.ts` 断言 authenticated snapshot 直接驱动地图层且不会额外请求 `/records`；`apps/web/src/stores/map-points.ts` 对非 401 写入失败设置 warning notice，`map-points.spec.ts` 覆盖该回归。 |
| 7 | 注册流程具备原子性，且用户名规则在前后端一致，trim 后空用户名不会写入。 | ✓ VERIFIED | `apps/server/src/modules/auth/auth.repository.ts` 的 `createUserWithSession()` 使用 Prisma `$transaction()`；`apps/server/src/modules/auth/dto/register.dto.ts` 先 trim 再做 `2..32` 校验；`apps/web/src/components/auth/AuthDialog.vue` 使用 `minlength="2"`、`maxlength="32"` 并在提交前 trim；`pnpm --filter @trip-map/server test -- src/modules/auth/auth.service.spec.ts src/modules/auth/guards/session-auth.guard.spec.ts` 8 tests passed。 |

**Score:** 7/7 truths verified

### Gap Closure Verification

| # | Closed Issue | Closed By | Evidence |
| --- | --- | --- | --- |
| 1 | 匿名冷启动/刷新恢复时地图层仍额外请求 `/records`，把 records 错误暴露到 restore 路径。 | Plan 23-10 | `LeafletMapStage.vue` 已无 `bootstrapFromApi()` 自动调用；`App.spec.ts` 与 `LeafletMapStage.spec.ts` 明确断言不会额外 `fetchTravelRecords()`。 |
| 2 | 已登录点亮失败只做 optimistic rollback，用户看不到明确原因。 | Plan 23-10 | `map-points.ts` 在非 401 写入失败时设置 `interactionNotice` warning；`map-points.spec.ts` 断言文案为“点亮失败，旅行记录暂时没有同步成功，请稍后重试。” |
| 3 | 登录失败错误提示出现后，认证弹层视觉上偏左。 | Plan 23-11 | `AuthDialog.vue` 已改为应用自控 `role="dialog"` surface，保留 `data-auth-dialog-backdrop` + `mx-auto` + `shrink-0` 合同；`AuthDialog.spec.ts` 新增错误态布局回归断言。 |

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `packages/contracts/src/auth.ts` | 共享 auth DTO 与用户摘要类型 | ✓ VERIFIED | 提供 `AuthUser`、`RegisterRequest`、`LoginRequest`、`RegisterResponse`、`LoginResponse`。 |
| `packages/contracts/src/bootstrap.ts` | bootstrap 会话恢复联合类型 | ✓ VERIFIED | 提供 `authenticated: false` / `authenticated: true + user + records` 联合。 |
| `apps/server/prisma/schema.prisma` | ownership 数据基座 | ✓ VERIFIED | 存在 `User`、`AuthSession`、`UserTravelRecord`，且 `@@unique([userId, placeId])` 已落地。 |
| `apps/server/src/main.ts` | cookie runtime 接线 | ✓ VERIFIED | 注册 `fastifyCookie`，为 sid cookie 提供运行时支持。 |
| `apps/server/src/modules/auth/auth.controller.ts` | `/auth/register|login|logout|bootstrap` | ✓ VERIFIED | 四个 handler 均存在，且 register/login/logout/bootstrap 都会处理 sid cookie。 |
| `apps/server/src/modules/auth/auth.service.ts` | 注册、登录、恢复、bootstrap 核心逻辑 | ✓ VERIFIED | 包含 `argon2.hash`/`argon2.verify`、`restoreSession()`、`bootstrap()`。 |
| `apps/server/src/modules/auth/auth.repository.ts` | user/session 持久化与事务入口 | ✓ VERIFIED | `createUserWithSession()` 使用 `$transaction()`；会话与 records 查询均存在。 |
| `apps/server/src/modules/records/records.controller.ts` | current-user `/records` 受保护路由 | ✓ VERIFIED | `GET/POST/DELETE /records` 全部使用 `SessionAuthGuard` 与 `CurrentUser`。 |
| `apps/server/src/modules/records/records.repository.ts` | user-scoped records 真源 | ✓ VERIFIED | 全部走 `prisma.userTravelRecord` 和 `userId_placeId` 复合键。 |
| `apps/web/src/stores/auth-session.ts` | Web 端会话恢复与边界切换真源 | ✓ VERIFIED | `restoreSession/login/register/logout/handleUnauthorized` 全部收口到同一状态机。 |
| `apps/web/src/stores/map-points.ts` | records snapshot 与点亮写入状态机 | ✓ VERIFIED | 支持 `replaceTravelRecords()`、`resetTravelRecordsForSessionBoundary()`、warning notice。 |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | 身份入口与退出菜单 | ✓ VERIFIED | anonymous 与 authenticated 分支明确，菜单显示用户名/邮箱/退出。 |
| `apps/web/src/components/auth/AuthDialog.vue` | 登录/注册弹层与错误态反馈 | ✓ VERIFIED | 登录/注册表单、trim 后用户名校验、错误态 alert、显式 `role="dialog"` 均存在。 |
| `apps/web/src/App.vue` | 首屏 restore 入口 | ✓ VERIFIED | `onMounted(() => void restoreSession())`，并在 map shell 内渲染 restoring overlay。 |
| `apps/web/src/components/LeafletMapStage.vue` | 地图层消费 bootstrap snapshot | ✓ VERIFIED | 组件保留地图/几何加载逻辑，但不再主动打 `/records`。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `apps/server/src/main.ts` | `apps/server/src/modules/auth/auth.controller.ts` | `fastifyCookie` + sid cookie runtime | ✓ WIRED | `main.ts` 注册 `fastifyCookie`，`auth.controller.ts` 使用 `reply.setCookie()` / `clearSessionCookie()`。 |
| `apps/server/src/app.module.ts` | `apps/server/src/modules/auth/auth.module.ts` | AppModule imports | ✓ WIRED | `AppModule` 显式导入 `AuthModule`。 |
| `apps/server/src/modules/auth/auth.controller.ts` | `apps/server/src/modules/auth/auth.service.ts` | register/login/logout/bootstrap handlers | ✓ WIRED | 四个 handler 均委托给 `authService`。 |
| `apps/server/src/modules/auth/auth.service.ts` | `apps/server/src/modules/auth/auth.repository.ts` | repository persistence/query calls | ✓ WIRED | register/login/restore/bootstrap 全部通过 repository 访问 Prisma。 |
| `apps/server/src/modules/records/records.module.ts` | `apps/server/src/modules/auth/auth.module.ts` | imports AuthModule | ✓ WIRED | `RecordsModule` 显式导入 `AuthModule` 解析 guard。 |
| `apps/server/src/modules/records/records.controller.ts` | `apps/server/src/modules/auth/guards/session-auth.guard.ts` | `@UseGuards(SessionAuthGuard)` | ✓ WIRED | `/records` 三个 current-user 路由都受 guard 保护。 |
| `apps/server/src/modules/records/records.controller.ts` | `apps/server/src/modules/auth/decorators/current-user.decorator.ts` | `@CurrentUser()` | ✓ WIRED | `/records` 读写删除都显式接收当前用户。 |
| `apps/server/src/modules/records/records.repository.ts` | `apps/server/prisma/schema.prisma` | `prisma.userTravelRecord` + `userId_placeId` | ✓ WIRED | repository 与 schema 的复合键命名一致。 |
| `apps/web/src/services/api/auth.ts` | `apps/web/src/services/api/client.ts` | endpoint-aware unauthorized mapping | ✓ WIRED | login/register 传 `auth-submit-unauthorized`，bootstrap/logout 保留 session unauthorized。 |
| `apps/web/src/stores/auth-session.ts` | `apps/web/src/stores/map-points.ts` | `replaceTravelRecords()` / `resetTravelRecordsForSessionBoundary()` | ✓ WIRED | authenticated snapshot 与 anonymous/unauthorized 清场都通过 map-points helper 实现。 |
| `apps/web/src/App.vue` | `apps/web/src/stores/auth-session.ts` | `restoreSession()` on mount | ✓ WIRED | 首屏 restore 只从 `auth-session` 进入。 |
| `apps/web/src/components/auth/AuthDialog.vue` | `apps/web/src/stores/auth-session.ts` | `login()` / `register()` submit flow | ✓ WIRED | 提交成功走 store action，失败保留弹层并显示表单级错误。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `apps/web/src/stores/auth-session.ts` | `currentUser`, `response.records` | `fetchAuthBootstrap()` -> `apps/server/src/modules/auth/auth.service.ts::bootstrap()` -> `AuthRepository.findUserTravelRecordsByUserId()` | Yes | ✓ FLOWING |
| `apps/web/src/components/auth/AuthTopbarControl.vue` | `currentUser.username`, `currentUser.email` | `useAuthSessionStore()` hydrated by `/auth/bootstrap` | Yes | ✓ FLOWING |
| `apps/web/src/stores/map-points.ts` | `travelRecords` | `replaceTravelRecords()` from auth bootstrap snapshot; `createTravelRecord()` / `deleteTravelRecord()` from current-user `/records` | Yes | ✓ FLOWING |
| `apps/web/src/components/LeafletMapStage.vue` | `savedBoundaryIds`, `displayPoints` | `useMapPointsStore()` current snapshot | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| contracts build | `pnpm --filter @trip-map/contracts build` | exit 0 | ✓ PASS |
| server auth unit regressions | `pnpm --filter @trip-map/server test -- src/modules/auth/auth.service.spec.ts src/modules/auth/guards/session-auth.guard.spec.ts` | 2 files, 8 tests passed | ✓ PASS |
| server typecheck | `pnpm --filter @trip-map/server typecheck` | exit 0 | ✓ PASS |
| auth session e2e | `pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` | 1 file, 9 tests passed | ✓ PASS |
| auth bootstrap e2e | `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts` | 1 file, 4 tests passed | ✓ PASS |
| current-user records e2e | `pnpm --filter @trip-map/server test -- test/records-travel.e2e-spec.ts` | 1 file, 8 tests passed | ✓ PASS |
| web auth and map regressions | `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts src/components/auth/AuthDialog.spec.ts src/components/LeafletMapStage.spec.ts src/stores/map-points.spec.ts src/App.spec.ts` | 5 files, 65 tests passed | ✓ PASS |
| web typecheck | `pnpm --filter @trip-map/web typecheck` | exit 0 | ✓ PASS |
| schema drift gate | `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" verify schema-drift 23` | `drift_detected: false` | ✓ PASS |

### External DB Notes

- 初次在沙箱内运行 `auth-session.e2e`、`auth-bootstrap.e2e`、`records-travel.e2e` 时，Prisma 无法连接 `aws-1-ap-southeast-1.pooler.supabase.com:5432`。
- 按验证流程在沙箱外复跑后，这三条 server e2e 全部通过。
- 结论：本次最终 **没有** 因外部 DB 不可达而保留的跳过项；此前失败属于运行环境限制，不是当前代码回归。

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| AUTH-01 | 23-01, 23-02, 23-08, 23-09 | 用户可以使用邮箱和密码注册新账号 | ✓ SATISFIED | `auth.controller.ts` 的 `POST /auth/register`，`createUserWithSession()` 事务入口，`auth-session.e2e-spec.ts` 通过。 |
| AUTH-02 | 23-02, 23-05, 23-08, 23-09, 23-11 | 用户可以登录并主动退出当前账号 | ✓ SATISFIED | `POST /auth/login` / `POST /auth/logout` e2e 通过；`AuthTopbarControl.vue` 提供退出入口；错误凭据不会误清场。 |
| AUTH-03 | 23-01, 23-04, 23-05, 23-06, 23-10 | 刷新页面或重开应用后，会话仍能恢复到同一账号 | ✓ SATISFIED | `auth-bootstrap.e2e-spec.ts` 通过；`App.vue` 首挂 `restoreSession()`；23-10 关闭了 restore 阶段额外 `/records` 请求。 |
| AUTH-05 | 23-01, 23-05, 23-11 | 已登录用户可以看到当前账号身份并执行退出 | ✓ SATISFIED | `AuthTopbarControl.vue` 显示用户名/邮箱/退出；`App.spec.ts` 覆盖 anonymous 与 authenticated 顶栏分支。 |
| SYNC-01 | 23-01, 23-03, 23-07, 23-09, 23-10 | 登录后用户只能读取当前账号自己的旅行记录 | ✓ SATISFIED | current-user `/records` 路由 guard + `userId` 过滤；`records-travel.e2e-spec.ts` 通过。 |
| SYNC-02 | 23-01, 23-03, 23-04, 23-07, 23-10 | 登录后点亮地点会绑定当前账号并保存到云端 | ✓ SATISFIED | `records.repository.ts` 使用 `userId_placeId` upsert；`auth.bootstrap` 返回当前用户 records；`map-points.ts` 使用 server 返回的权威记录覆盖 optimistic record。 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| - | - | No blocker anti-patterns detected in scanned Phase 23 artifacts. | ℹ️ Info | 扫描到的 `null`/空态多为 Pinia 初始状态或分支清理逻辑，未发现 placeholder、TODO、静态空响应或仅日志实现。 |

### Human Verification Required

### 1. 认证弹层错误态居中

**Test:** 在真实浏览器中以匿名状态打开登录弹层，输入正确邮箱和错误密码后提交。  
**Expected:** 弹层保持打开，出现“登录失败”提示后仍处于视口中央，未出现偏左、跳位或原生 `<dialog>` 定位残留。  
**Why human:** 当前自动化只验证 DOM/class contract，不能像真实浏览器那样确认最终视觉定位。

### Gaps Summary

本次重新验证没有发现新的实现缺口。23-10 已关闭 restore 阶段误打 `/records` 与 records 写入静默失败两个 UAT 问题，23-11 已把错误态认证弹层的布局合同收口到应用自控 surface。所有与 Phase 23 目标直接相关的 must-haves 都有代码、接线与自动化命令支撑。

当前唯一剩余项是 23-11 的真实浏览器视觉确认，因此按验证规则状态记为 `human_needed`，而不是 `passed`。

---

_Verified: 2026-04-12T16:01:36Z_  
_Verifier: Codex (gsd-verifier)_  
