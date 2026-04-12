# Phase 23: Auth & Ownership Foundation - Research

**Researched:** 2026-04-11
**Domain:** 邮箱密码账号、服务端会话、按账号隔离的旅行记录真源
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### 账号入口
- **D-01:** 账号入口放在顶栏右侧，使用 `账号 chip + 下拉菜单`，不新增独立账号页或常驻侧栏。
- **D-02:** 顶栏 chip 主展示内容为用户自定义用户名，不显示邮箱前缀作为主身份标识。
- **D-03:** 下拉菜单内容保持最小闭环：显示用户名、邮箱和退出入口，不加入“账号设置”“其他设备”或更多占位能力。

### 注册与登录表单
- **D-04:** 未登录时从顶栏入口打开同一个认证弹层，内部使用 `注册 / 登录` 两个 tab 切换，而不是拆成独立页面或分步邮箱判定流。
- **D-05:** 注册表单字段固定为 `用户名 + 邮箱 + 密码`，注册完成后即可立刻显示正式用户名身份。
- **D-06:** 登录表单只做 `邮箱 + 密码 + 提交`，不加入“记住我”或“忘记密码”占位。
- **D-07:** 注册或登录成功后，认证弹层自动关闭，并立即更新顶栏账号态与当前地图记录视图。

### 会话恢复体验
- **D-08:** 应用启动时先进入轻量会话恢复态；恢复完成前，不直接把地图记录区当作“空数据”渲染给用户。
- **D-09:** 恢复态保留现有 app shell 与顶栏，只在地图主舞台添加柔和的 loading 蒙层，不切到全页独立 loading 页面。
- **D-10:** 如果会话恢复失败或已失效，结束恢复态后回到未登录视角，并给出明确提示，允许用户继续浏览地图。

### 多设备会话策略
- **D-11:** 同一账号允许在多设备或多浏览器中同时保持登录，不采用“新登录挤掉旧登录”的单会话策略。
- **D-12:** 本阶段只支持“退出当前设备/当前浏览器会话”，不提供其他设备会话查看、提醒或“退出所有设备”能力。

### 已锁定的上游约束
- **D-13:** 鉴权只做邮箱密码，不引入 OAuth。
- **D-14:** 会话采用 `sid` cookie + 服务端 session 表，不使用 JWT refresh 架构。
- **D-15:** canonical 地点识别链路继续公开；本阶段只把记录读写切换到账号上下文，不把地图识别能力和登录态耦合。

### Claude's Discretion
- 用户名最大长度、超长时的截断样式与校验文案可由 planner / executor 自行决定，但必须服务于顶栏 chip 的稳定展示。
- 恢复态蒙层的具体视觉实现、动画节奏和 loading 文案可由 the agent 决定，但不能变成独立启动页。
- 认证错误态、字段级校验提示、成功提示的具体 copy 可由 the agent 决定，只要不引入新能力。

### Deferred Ideas (OUT OF SCOPE)
- 忘记密码 / 找回密码流程 — 不在 Phase 23，后续再单独评估。
- 其他设备会话查看、设备列表、退出所有设备 — 超出当前最小 auth foundation 范围。
- OAuth / 第三方登录 — 已明确为 v5.0 out of scope。
- 首登本地记录导入、云端优先选择、切账号后的数据迁移解释 — 属于 Phase 24。
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | 用户可以使用邮箱和密码注册新账号。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要 `User` 表、唯一邮箱约束、`argon2` 密码哈希、`POST /auth/register`、成功后写入 `sid` cookie。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: codebase grep][CITED: https://docs.nestjs.com/security/encryption-and-hashing][CITED: https://docs.nestjs.com/techniques/cookies] |
| AUTH-02 | 用户可以使用邮箱和密码登录，并能主动退出当前账号。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要 `AuthSession` 表、`POST /auth/login`、`POST /auth/logout`、顶栏稳定退出入口和 cookie 清除语义。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: context][CITED: https://docs.nestjs.com/techniques/cookies][CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie] |
| AUTH-03 | 用户刷新页面或重新打开应用后，会话仍能恢复到同一账号。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要单一 `GET /auth/bootstrap`、前端 `credentials: 'include'`、`auth-session` store 和地图舞台恢复态。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: context][VERIFIED: codebase grep][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] |
| AUTH-05 | 已登录用户可以明确看到当前账号身份，并能从界面进入退出操作。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要顶栏右侧 `账号 chip + 下拉菜单`、展示用户名/邮箱/退出按钮，并让 UI 直接消费 bootstrap 用户信息。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: context][VERIFIED: codebase grep] |
| SYNC-01 | 登录后用户只能读取当前账号自己的旅行记录。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要把 `/records` 改为 auth-protected current-user records，并在 service/repository 层按 `userId` 过滤，数据库层至少有复合唯一键，RLS 可作为附加护栏。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints][CITED: https://www.postgresql.org/docs/current/ddl-rowsecurity.html] |
| SYNC-02 | 登录后用户点亮地点时，旅行记录会绑定到当前账号并保存到云端。 [VERIFIED: .planning/REQUIREMENTS.md] | 需要服务端从 session 推导 `userId`，对 `(userId, placeId)` 做幂等 upsert/create，前端不再发送 owner 字段。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- 与用户交流必须使用中文。 [VERIFIED: CLAUDE.md]
- 实现时优先最小改动，并遵循现有项目结构与风格。 [VERIFIED: CLAUDE.md]
- 前端必须继续使用 Vue 3 Composition API + `<script setup lang="ts">` + Pinia。 [VERIFIED: CLAUDE.md]
- 后端必须继续使用 NestJS Fastify 适配器，输入验证沿用 `class-validator` + `class-transformer`。 [VERIFIED: CLAUDE.md][VERIFIED: codebase grep]
- 共享 DTO 必须放在 `packages/contracts/src/`，新增模块后需要通过 `src/index.ts` re-export。 [VERIFIED: CLAUDE.md][VERIFIED: codebase grep]
- 测试框架统一是 Vitest；Phase 23 规划必须包含 Nyquist validation，因为 `.planning/config.json` 中 `workflow.nyquist_validation` 为 `true`。 [VERIFIED: CLAUDE.md][VERIFIED: .planning/config.json]

## Summary

Phase 23 不是“补一个登录弹层”这么小的工作；当前后端把 `/records` 暴露为公开接口，`TravelRecord.placeId` 仍是全局唯一，前端 `map-points` store 也只做一次匿名 bootstrap，这三处一起决定了“账号成为唯一归属真源”尚未建立。 [VERIFIED: codebase grep]

基于当前代码和锁定决策，最稳的规划路径是继续沿用现有 `Vue 3 + Pinia + Vite`、`NestJS + Fastify`、`Prisma + PostgreSQL` 基线，在服务端新增 `User`、`AuthSession` 和新的用户归属 records 模型，统一通过 `sid` HttpOnly cookie + `GET /auth/bootstrap` 建立会话恢复与当前用户记录快照。 [VERIFIED: package.json][VERIFIED: context][VERIFIED: codebase grep][CITED: https://docs.nestjs.com/techniques/cookies][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials]

规划时最关键的切分点是不要把 Phase 24 的“首登本地记录导入/迁移解释”提前混进 Phase 23。 当前数据库里的 `TravelRecord` 没有 owner 信息，而 Phase 24 已明确承接首次迁移语义，因此 Phase 23 更适合通过新表 cutover 建立正式账号 records，而不是在旧全局表上直接回填 owner。 [VERIFIED: codebase grep][VERIFIED: .planning/ROADMAP.md][VERIFIED: context]

**Primary recommendation:** 以 `User` + `AuthSession` + `UserTravelRecord`、`sid` cookie、`GET /auth/bootstrap`、受保护的 current-user `/records` 为 Phase 23 主干，同时把前端记录 bootstrap 生命周期绑定到 auth session。 [VERIFIED: codebase grep][VERIFIED: context]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vue` | `3.5.32` (published 2026-04-03) [VERIFIED: npm registry][VERIFIED: package.json] | 现有单页地图应用 UI 基线。 [VERIFIED: package.json] | 仓库已在 `apps/web` 固定使用 Vue 3，Phase 23 不需要框架迁移。 [VERIFIED: package.json][VERIFIED: CLAUDE.md] |
| `pinia` | `3.0.4` (published 2025-11-05) [VERIFIED: npm registry][VERIFIED: package.json] | 持有 auth session、map points、顶栏账号态。 [VERIFIED: package.json][VERIFIED: codebase grep] | 当前前端状态已由 Pinia 驱动，新增 auth session store 的改动面最小。 [VERIFIED: codebase grep] |
| `vite` | `8.0.7` (published 2026-04-07) [VERIFIED: npm registry][VERIFIED: package.json] | Web 构建与 `/api` dev proxy。 [VERIFIED: package.json][VERIFIED: codebase grep] | 现有代理已把 `/api` 转发到本地 server，cookie session 可以沿用同一路径。 [VERIFIED: codebase grep] |
| `@nestjs/platform-fastify` | `11.1.18` (published 2026-04-03) [VERIFIED: npm registry][VERIFIED: package.json] | 后端主运行时与插件注册入口。 [VERIFIED: package.json][VERIFIED: codebase grep] | 现有 `createApp()` 已使用 Fastify 适配器，最适合接入 cookie 与 auth guard。 [VERIFIED: codebase grep] |
| `fastify` | `5.8.4` (published 2026-03-23) [VERIFIED: npm registry][VERIFIED: package.json] | Nest HTTP adapter 实际运行时。 [VERIFIED: package.json] | 与 `@fastify/cookie` 同生态，新增 cookie 解析不会引入额外 runtime。 [VERIFIED: package.json][CITED: https://docs.nestjs.com/techniques/cookies] |
| `@prisma/client` | `6.19.2` (published 2026-01-13) [VERIFIED: npm registry][VERIFIED: package.json] | 持久化 `User`、`AuthSession`、用户归属 records。 [VERIFIED: package.json] | 当前 schema、repository、e2e 已全部围绕 Prisma 工作，Phase 23 只需扩展关系模型。 [VERIFIED: codebase grep] |
| `postgresql` | project datastore via `DATABASE_URL` / `DIRECT_URL`. [VERIFIED: codebase grep] | 关系型唯一键、会话表、records 归属约束。 [VERIFIED: codebase grep] | 现有 Prisma datasource 已是 PostgreSQL，复合唯一键和 RLS 都有成熟能力。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints][CITED: https://www.postgresql.org/docs/current/ddl-rowsecurity.html] |
| `@trip-map/contracts` | workspace package. [VERIFIED: package.json][VERIFIED: codebase grep] | 共享 auth/bootstrap/records DTO。 [VERIFIED: codebase grep] | 现有 records contracts 已在 web/server 两端消费，Phase 23 应继续通过 contracts 收口接口形状。 [VERIFIED: codebase grep][VERIFIED: CLAUDE.md] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@fastify/cookie` | `11.0.2` (published 2025-01-05) [VERIFIED: npm registry] | 解析与写入 `sid` cookie。 [CITED: https://docs.nestjs.com/techniques/cookies] | 在 `apps/server/src/main.ts` 注册 Fastify cookie 插件时使用。 [VERIFIED: codebase grep][CITED: https://docs.nestjs.com/techniques/cookies] |
| `argon2` | `0.44.0` (published 2025-08-10) [VERIFIED: npm registry] | 密码哈希。 [CITED: https://docs.nestjs.com/security/encryption-and-hashing] | 注册与登录阶段处理密码时使用。 [VERIFIED: .planning/REQUIREMENTS.md][CITED: https://docs.nestjs.com/security/encryption-and-hashing] |
| `@fastify/cors` | `11.2.0` (published 2025-12-09) [VERIFIED: npm registry] | 保留为未来跨 origin 变更的备用项。 [VERIFIED: npm registry][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] | Phase 23 已锁定同站点生产基线，因此本 phase 不纳入 credentialed CORS/CSRF 扩展。 [RESOLVED 2026-04-12] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 新增 `UserTravelRecord` 主表作为正式账号 records。 [VERIFIED: codebase grep][VERIFIED: context] | 直接给现有 `TravelRecord` 加 `userId` 并回填 owner。 [VERIFIED: codebase grep] | 现有全局记录没有任何 owner 信息，直接回填会把 Phase 24 的首次迁移问题提前到 Phase 23。 [VERIFIED: codebase grep][VERIFIED: .planning/ROADMAP.md] |
| `sid` cookie + 服务端 session 表。 [VERIFIED: context] | JWT access/refresh token 架构。 [VERIFIED: context] | 当前 web fetch 层极简、API 默认同域 `/api`，cookie 会话对现有代码的 blast radius 更小。 [VERIFIED: codebase grep][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] |
| 一方自建 auth module。 [VERIFIED: codebase grep][VERIFIED: context] | Auth SaaS 或 OAuth。 [VERIFIED: context] | milestone 已锁定邮箱密码与现有 Nest/Prisma 后端做真源，引入第二身份平面只会增加迁移成本。 [VERIFIED: context][VERIFIED: codebase grep] |

**Installation:**
```bash
pnpm --filter @trip-map/server add @fastify/cookie argon2
```

**Version verification:** 当前仓库锁定版本分别为 `vue@3.5.32`、`pinia@3.0.4`、`vite@8.0.7`、`@nestjs/platform-fastify@11.1.18`、`fastify@5.8.4`、`@prisma/client@6.19.2`，上表中的发布日期均已通过 `npm view` 核对。 [VERIFIED: npm registry][VERIFIED: package.json]

## Architecture Patterns

### Recommended Project Structure

```text
apps/server/src/
├── modules/auth/                 # register/login/logout/bootstrap + guard + decorator
├── modules/records/              # current-user records controller/service/repository
├── prisma/                       # Prisma service and schema-backed models
└── main.ts                       # Fastify cookie registration and global security config

apps/web/src/
├── stores/auth-session.ts        # restore status, current user, logout/reset orchestration
├── stores/map-points.ts          # consume bootstrap snapshot, no anonymous global bootstrap
├── services/api/client.ts        # credentials include wrapper + normalized API errors
├── services/api/auth.ts          # register/login/logout/bootstrap
└── App.vue                       # topbar chip, dropdown, auth modal, stage loading overlay

packages/contracts/src/
├── auth.ts                       # AuthUser, RegisterRequest, LoginRequest
├── bootstrap.ts                  # AuthBootstrapResponse
└── index.ts                      # re-export new contracts
```

### Pattern 1: Single Bootstrap Authority

**What:** 让 `GET /auth/bootstrap` 一次返回 `user + records`，前端 app 启动只认这一个会话恢复入口。 [VERIFIED: context][VERIFIED: codebase grep]
**When to use:** 应用启动、刷新、重新打开标签页、登录成功后立即重建页面态时使用。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: context]
**Example:**
```typescript
// Source: current repo bootstrap pattern + locked phase guidance
// Source URLs: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
export type AuthBootstrapResponse =
  | { authenticated: false }
  | { authenticated: true; user: AuthUser; records: TravelRecord[] }

export async function fetchAuthBootstrap() {
  const response = await fetch(createApiUrl('/auth/bootstrap'), {
    method: 'GET',
    credentials: 'include',
  })

  if (response.status === 401) {
    return { authenticated: false } as const
  }

  if (!response.ok) {
    throw new Error(`bootstrap failed: ${response.status}`)
  }

  return response.json() as Promise<AuthBootstrapResponse>
}
```

### Pattern 2: Server-Derived Ownership

**What:** client 永远不发送 `userId`，后端从当前 session 解析用户，再在 repository 层按 `(userId, placeId)` 读写。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: codebase grep]
**When to use:** `GET /records`、`POST /records`、`DELETE /records/:placeId` 全部适用。 [VERIFIED: .planning/ROADMAP.md]
**Example:**
```typescript
// Source: Prisma compound unique constraints docs
// Source URL: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
await prisma.userTravelRecord.upsert({
  where: {
    userId_placeId: {
      userId,
      placeId: input.placeId,
    },
  },
  update: {
    boundaryId: input.boundaryId,
    datasetVersion: input.datasetVersion,
    displayName: input.displayName,
    regionSystem: input.regionSystem,
    adminType: input.adminType,
    typeLabel: input.typeLabel,
    parentLabel: input.parentLabel,
    subtitle: input.subtitle,
    updatedAt: new Date(),
  },
  create: {
    userId,
    placeId: input.placeId,
    boundaryId: input.boundaryId,
    datasetVersion: input.datasetVersion,
    displayName: input.displayName,
    regionSystem: input.regionSystem,
    adminType: input.adminType,
    typeLabel: input.typeLabel,
    parentLabel: input.parentLabel,
    subtitle: input.subtitle,
  },
})
```

### Pattern 3: Auth-Bound Store Lifecycle

**What:** `map-points` 不再用“是否 bootstrapped 过一次”代表真实状态，而是由 `auth-session` store 驱动 `restoring` / `anonymous` / `authenticated`。 [VERIFIED: codebase grep][VERIFIED: context]
**When to use:** 页面启动、登录成功、登出成功、session 失效、401 统一回收时使用。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: .planning/REQUIREMENTS.md]
**Example:**
```typescript
// Source: current map-points store shape + locked UX decisions
type AuthStatus = 'restoring' | 'anonymous' | 'authenticated'

async function restoreSession() {
  status.value = 'restoring'

  try {
    const bootstrap = await fetchAuthBootstrap()

    if (!bootstrap.authenticated) {
      currentUser.value = null
      mapPointsStore.replaceRecords([])
      status.value = 'anonymous'
      return
    }

    currentUser.value = bootstrap.user
    mapPointsStore.replaceRecords(bootstrap.records)
    status.value = 'authenticated'
  } catch {
    currentUser.value = null
    mapPointsStore.replaceRecords([])
    status.value = 'anonymous'
    mapUiStore.setInteractionNotice({
      tone: 'warning',
      message: '账号会话恢复失败，请重新登录。',
    })
  }
}
```

### Anti-Patterns to Avoid

- **仅新增登录表单，不改 `/records` ownership 边界：** 这会让 UI 看起来“有账号了”，但数据库仍然是全局 records。 [VERIFIED: codebase grep][VERIFIED: .planning/REQUIREMENTS.md]
- **继续用 `hasBootstrapped` 表示 records 已真实就绪：** 当前 store 会把“加载失败”和“当前账号没有数据”混成同一个空数组结果。 [VERIFIED: codebase grep]
- **让客户端 body 带 `userId`：** 这会直接引入伪造 owner 的风险，不满足“账号成为唯一归属真源”。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: .planning/REQUIREMENTS.md]
- **把 canonical places API 和 auth guard 耦合：** 上游决策已锁定地点识别链路继续公开。 [VERIFIED: context]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 密码存储 | 自己拼盐值与哈希格式。 [CITED: https://docs.nestjs.com/security/encryption-and-hashing] | `argon2`. [CITED: https://docs.nestjs.com/security/encryption-and-hashing][VERIFIED: npm registry] | 密码哈希参数和格式细节容易做错，Nest 官方已明确给出 `argon2` / `bcrypt` 方案。 [CITED: https://docs.nestjs.com/security/encryption-and-hashing] |
| Cookie 解析与写入 | 手写 header 解析器。 [CITED: https://docs.nestjs.com/techniques/cookies] | `@fastify/cookie`. [CITED: https://docs.nestjs.com/techniques/cookies][VERIFIED: npm registry] | 现有 server 已用 Fastify adapter，官方路径就是注册 Fastify cookie 插件。 [VERIFIED: codebase grep][CITED: https://docs.nestjs.com/techniques/cookies] |
| 每用户 records 去重键 | 自己维护字符串拼接唯一键。 [CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] | Prisma `@@unique([userId, placeId])`. [CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] | 复合唯一键与 Prisma 查询 API 已内建支持，不需要应用层手搓。 [CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] |
| 跨 origin 凭证传输 | 自己判断浏览器会不会带 cookie。 [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] | 明确 `credentials: 'include'`，必要时配 `@fastify/cors`. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials][VERIFIED: npm registry] | MDN 已明确 `credentials` 影响 cookie 发送与 `Set-Cookie` 接受语义。 [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] |

**Key insight:** 本 phase 真正复杂的是 ownership 边界和生命周期切换，而不是表单渲染；应把底层安全与会话基础设施交给现成能力，把业务精力留给“当前用户 records 真源”这条主线。 [VERIFIED: codebase grep][VERIFIED: context][CITED: https://docs.nestjs.com/techniques/cookies]

## Common Pitfalls

### Pitfall 1: 继续把 `TravelRecord` 当全局 `placeId` 唯一

**What goes wrong:** 第二个用户点亮同一地点时会撞上当前全局唯一约束，无法满足 SYNC-01/SYNC-02。 [VERIFIED: codebase grep][VERIFIED: .planning/REQUIREMENTS.md]
**Why it happens:** `apps/server/prisma/schema.prisma` 里的 `TravelRecord.placeId` 仍是 `@unique`。 [VERIFIED: codebase grep]
**How to avoid:** Phase 23 直接切到以 `userId + placeId` 为复合唯一键的正式账号 records 表。 [VERIFIED: .planning/REQUIREMENTS.md][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints]
**Warning signs:** 新建第二个测试账号时，`POST /records` 仍然返回“already exists”。 [VERIFIED: codebase grep]

### Pitfall 2: 登录后仍然能读到全表 records

**What goes wrong:** 用户 A 登录后能看到用户 B 的旅行记录，直接破坏 ownership 真源。 [VERIFIED: .planning/REQUIREMENTS.md]
**Why it happens:** 当前 `RecordsController` / `RecordsService` / `RecordsRepository` 根本没有用户上下文；`findAllTravelRecords()` 返回整表。 [VERIFIED: codebase grep]
**How to avoid:** Guard、service、repository 三层都要收口到当前用户；RLS 只能作为附加护栏，不能替代应用层过滤。 [VERIFIED: codebase grep][CITED: https://www.postgresql.org/docs/current/ddl-rowsecurity.html]
**Warning signs:** `GET /records` 在未认证请求下仍返回 `200 []` 或非空数组。 [VERIFIED: codebase grep]

### Pitfall 3: 会话恢复过程把空数组误渲染成“没有数据”

**What goes wrong:** 刷新页面时用户会先看到地图点亮结果清空，再瞬间恢复，或者恢复失败后误以为数据丢失。 [VERIFIED: context]
**Why it happens:** 当前 `map-points` 的 `bootstrapFromApi()` 失败后会把 `travelRecords` 置空且 `hasBootstrapped = true`。 [VERIFIED: codebase grep]
**How to avoid:** 新增显式 auth restore state，并按 D-08/D-09 在地图主舞台显示恢复态蒙层，而不是用空列表假装已经就绪。 [VERIFIED: context]
**Warning signs:** 页面刷新后先闪空，再出现 records；或 401 后 `hasBootstrapped` 仍保持真值。 [VERIFIED: codebase grep]

### Pitfall 4: 直接在旧 `TravelRecord` 上做 owner 回填

**What goes wrong:** 你必须在 Phase 23 决定“历史全局记录属于谁”，这与 Phase 24 的首次迁移边界冲突。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: context]
**Why it happens:** 当前全局 `TravelRecord` 没有任何 owner 字段，也没有用户身份历史。 [VERIFIED: codebase grep]
**How to avoid:** 让 Phase 23 使用新的正式账号 records 表，legacy `TravelRecord` 保持隔离，首次导入/认领留给 Phase 24。 [VERIFIED: .planning/ROADMAP.md][VERIFIED: context][VERIFIED: codebase grep]
**Warning signs:** 规划里开始出现“首个注册用户继承所有历史 records”之类 rollout 规则。 [VERIFIED: .planning/ROADMAP.md]

### Pitfall 5: 仍把 `409` 当作前端幂等成功语义

**What goes wrong:** 多设备或重复点击时前端会误把冲突当成功，但服务端并未返回最终权威记录。 [VERIFIED: codebase grep]
**Why it happens:** `apps/web/src/services/api/records.ts` 现在把 `409` 直接当成功分支，而 server 的 `createTravel()` 在唯一键冲突时抛 `ConflictException`。 [VERIFIED: codebase grep]
**How to avoid:** Phase 23 改成服务端按 `(userId, placeId)` 真正 upsert 或返回权威 record，别让客户端猜测冲突结果。 [VERIFIED: codebase grep][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints]
**Warning signs:** 不同设备同时点亮同一地点时 UI 出现闪烁、回滚或 pending 卡住。 [VERIFIED: codebase grep]

## Code Examples

Verified patterns from official sources:

### Fastify Cookie Registration
```typescript
// Source: https://docs.nestjs.com/techniques/cookies
import fastifyCookie from '@fastify/cookie'

await app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
})
```

### Session Cookie Flags
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
reply.setCookie('sid', rawSessionToken, {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
})
```

### Password Hashing
```typescript
// Source: https://docs.nestjs.com/security/encryption-and-hashing
import * as argon2 from 'argon2'

const passwordHash = await argon2.hash(plainPassword)
const isValid = await argon2.verify(passwordHash, plainPassword)
```

### Explicit Credentials on Web API Calls
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
const response = await fetch(createApiUrl('/auth/bootstrap'), {
  method: 'GET',
  credentials: 'include',
})
```

### Composite Unique Lookup
```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
const record = await prisma.userTravelRecord.findUnique({
  where: {
    userId_placeId: {
      userId,
      placeId,
    },
  },
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 浏览器里保存 bearer token / refresh token。 [ASSUMED] | 对于当前浏览器单页应用，优先使用 HttpOnly same-site cookie + 服务端 session 表。 [VERIFIED: context][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials][CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie] | 这不是本仓库已实现现状，而是本 milestone 已锁定的 Phase 23 设计。 [VERIFIED: context] | 减少 token 持久化、刷新和 401 replay 复杂度。 [VERIFIED: codebase grep][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] |
| 全局 `placeId` 唯一的 records 模型。 [VERIFIED: codebase grep] | 每用户 records 唯一键应为 `(userId, placeId)`。 [VERIFIED: .planning/REQUIREMENTS.md][CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] | 需求已在 2026-04-10 写入 v5.0 roadmap，但代码尚未切换。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: .planning/ROADMAP.md][VERIFIED: codebase grep] | 允许多个账号独立点亮同一 canonical place。 [VERIFIED: .planning/REQUIREMENTS.md] |
| app 启动后匿名拉 `/records` 一次。 [VERIFIED: codebase grep] | 通过单一 `/auth/bootstrap` 同步恢复 `user + records`。 [VERIFIED: context] | 这是本 phase 锁定的 bootstrap 设计。 [VERIFIED: context] | 避免登录态与 records 快照分裂。 [VERIFIED: context][VERIFIED: codebase grep] |

**Deprecated/outdated:**
- 当前公开的 `GET /records` / `POST /records` / `DELETE /records/:placeId` 全局语义已经不适合 Phase 23，必须切换到 current-user records。 [VERIFIED: codebase grep][VERIFIED: .planning/REQUIREMENTS.md]
- 当前 `map-points.hasBootstrapped` 只能代表“请求过一次”，不能代表“当前会话 records 已可靠恢复”。 [VERIFIED: codebase grep]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 已锁定：Phase 23 继续以同站点生产部署为支持基线，因此 cookie 基线固定为 `HttpOnly + SameSite=Lax`，生产启用 `Secure`，本 phase 不扩展跨 origin CORS/CSRF 方案。 [RESOLVED 2026-04-12] | Supporting / Security Domain | 如果未来部署拓扑改成跨 origin，应在后续 phase 单独新增 CORS/CSRF 计划，而不是回改本 phase 基线。 |
| A2 | 已锁定：现有全局 `TravelRecord` 在 Phase 23 保持为隔离 legacy 存储，不面向最终用户认领或迁移；相关 rollout/import 统一推迟到 Phase 24。 [RESOLVED 2026-04-12] | Summary / Common Pitfalls | 如果后续发现必须保留并导入 legacy 数据，应在 Phase 24 处理，不向 Phase 23 追加入口迁移任务。 |

## Resolved Planning Inputs

1. **生产 web/api origin 拓扑**
   - Locked resolution: Phase 23 以同站点生产部署继续作为支持基线。当前前端默认请求 `/api`，dev server 已把 `/api` 代理到 `http://127.0.0.1:4000`。 [VERIFIED: codebase grep][RESOLVED 2026-04-12]
   - Planning consequence: cookie 方案固定为 `HttpOnly + SameSite=Lax`、生产启用 `Secure`；不在本 phase 扩展 `@fastify/cors`、跨站 cookie domain 或 CSRF 新护栏。

2. **legacy `TravelRecord` rollout 策略**
   - Locked resolution: 现有无 owner 的全局 `TravelRecord` 在 Phase 23 继续保持隔离 legacy 存储。 [VERIFIED: codebase grep][VERIFIED: .planning/ROADMAP.md][RESOLVED 2026-04-12]
   - Planning consequence: Phase 23 直接通过新表 cutover 建立账号 ownership 真源，不补面向最终用户的认领/import/migration 任务；首次导入与迁移解释统一留给 Phase 24。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `node` | web/server build, test, scripts | ✓ | `v22.22.1` [VERIFIED: local command] | — |
| `pnpm` | monorepo install, filter scripts | ✓ | `10.33.0` [VERIFIED: local command] | — |
| `python3` | optional local tooling only | ✓ | `3.13.13` [VERIFIED: local command] | — |
| PostgreSQL CLI (`psql`, `pg_isready`) | local DB diagnostics for Prisma migrate/e2e | ✗ | — | 依赖现有 `.env` 中的 `DATABASE_URL` / `DIRECT_URL` 配置，但本次未验证连接可达。 [VERIFIED: codebase grep][ASSUMED] |
| Docker daemon | 可选本地 Postgres 容器 | ✗ | client `28.5.2`, daemon unavailable. [VERIFIED: local command] | 使用非 Docker 的现有数据库环境。 [ASSUMED] |

**Missing dependencies with no fallback:**
- 无直接阻塞的构建工具缺失；真正未验证的是“可用数据库目标”而不是 CLI 本身。 [VERIFIED: local command][VERIFIED: codebase grep]

**Missing dependencies with fallback:**
- 缺少本地 PostgreSQL 诊断工具与 Docker daemon；若已有可用 `.env` 数据库，仍可执行 Prisma migrate 与 server e2e。 [VERIFIED: local command][VERIFIED: codebase grep][ASSUMED]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `Vitest 4.1.3` on web/server/contracts. [VERIFIED: package.json][VERIFIED: npm registry] |
| Config file | [`apps/web/vitest.config.ts`](/Users/huangjingping/i/trip-map/apps/web/vitest.config.ts), [`apps/server/vitest.config.ts`](/Users/huangjingping/i/trip-map/apps/server/vitest.config.ts). [VERIFIED: codebase grep] |
| Quick run command | `pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts`, `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts`, `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts`, `pnpm --filter @trip-map/web test -- src/App.spec.ts`. [VERIFIED: package.json][ASSUMED] |
| Full suite command | `pnpm typecheck && pnpm test`. [VERIFIED: package.json] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | 注册成功后创建用户、写入 `sid` cookie、返回当前用户摘要。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e | `pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` [ASSUMED] | Plan 02 |
| AUTH-02 | 登录成功可恢复 session，退出仅清除当前设备会话。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: context] | server e2e | `pnpm --filter @trip-map/server test -- test/auth-session.e2e-spec.ts` [ASSUMED] | Plan 02 |
| AUTH-03 | 刷新后通过 `/auth/bootstrap` 恢复同一账号与 records，并在 App 首挂时真实触发。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e + web store + App spec | `pnpm --filter @trip-map/server test -- test/auth-bootstrap.e2e-spec.ts`, `pnpm --filter @trip-map/web test -- src/stores/auth-session.spec.ts`, `pnpm --filter @trip-map/web test -- src/App.spec.ts` [ASSUMED] | Plans 06 / 04 / 05 |
| AUTH-05 | 顶栏显示用户名身份，并能通过稳定入口退出。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: context] | web component/store | `pnpm --filter @trip-map/web test -- src/App.spec.ts src/components/auth/AuthDialog.spec.ts` [ASSUMED] | Plan 05 |
| SYNC-01 | 登录后只能读到当前账号自己的旅行记录。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e | `pnpm --filter @trip-map/server test -- test/records-ownership.e2e-spec.ts` [ASSUMED] | Plan 03 |
| SYNC-02 | 登录后创建记录自动绑定当前账号，并可在下次 bootstrap 拉回。 [VERIFIED: .planning/REQUIREMENTS.md] | server e2e + web store | `pnpm --filter @trip-map/server test -- test/records-ownership.e2e-spec.ts` and `pnpm --filter @trip-map/web test -- src/stores/map-points.spec.ts` [ASSUMED] | Plans 03 / 04 |

### Sampling Rate

- **Per task commit:** 运行该任务的最近邻验证命令，优先单 spec 或 `rg/test -f` 级检查，目标在 30 秒内返回。 [RESOLVED 2026-04-12]
- **Per wave merge:** `pnpm typecheck && pnpm test`. [VERIFIED: package.json]
- **Phase gate:** Full suite green before `/gsd-verify-work`. [VERIFIED: .planning/config.json]

### Wave 0 Status

无需额外 Wave 0 测试计划。当前 23-01 至 23-06 已在各自任务内显式创建缺失 spec/fixture，并为每个任务提供最近邻自动验证命令。 [RESOLVED 2026-04-12]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | 唯一邮箱 + `argon2` 密码哈希 + 注册/登录 DTO 验证。 [VERIFIED: .planning/REQUIREMENTS.md][CITED: https://docs.nestjs.com/security/encryption-and-hashing][VERIFIED: codebase grep] |
| V3 Session Management | yes | `sid` HttpOnly cookie + 服务端 session 表 + 当前设备登出。 [VERIFIED: context][CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie] |
| V4 Access Control | yes | session guard、server-derived `userId`、repository `where: { userId }`，RLS 仅作附加护栏。 [VERIFIED: .planning/REQUIREMENTS.md][VERIFIED: codebase grep][CITED: https://www.postgresql.org/docs/current/ddl-rowsecurity.html] |
| V5 Input Validation | yes | 全局 `ValidationPipe` + `class-validator` DTO。 [VERIFIED: codebase grep][VERIFIED: CLAUDE.md] |
| V6 Cryptography | yes | `argon2`；不要自定义密码哈希。 [CITED: https://docs.nestjs.com/security/encryption-and-hashing] |

### Known Threat Patterns for auth + ownership stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 跨用户 records 串读 / 串删（IDOR）。 [VERIFIED: codebase grep][VERIFIED: .planning/REQUIREMENTS.md] | Elevation of Privilege / Tampering | 所有 records 路由强制从 session 取当前用户，并在 repository 层按 `userId` 过滤。 [VERIFIED: codebase grep][VERIFIED: .planning/REQUIREMENTS.md] |
| 浏览器脚本读取会话令牌。 [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie] | Information Disclosure | `HttpOnly` cookie，生产启用 `Secure`，避免 token 落到 `localStorage`。 [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie][VERIFIED: context] |
| 跨站请求伪造触发 records 写操作。 [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] | Tampering | 维持同站点部署并使用 `SameSite=Lax` 作为基线；Phase 23 不扩展跨站 CORS/CSRF 方案。 [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie][RESOLVED 2026-04-12] |
| 数据库泄露后明文密码外泄。 [CITED: https://docs.nestjs.com/security/encryption-and-hashing] | Information Disclosure | 仅存储 `argon2` 哈希，不回传密码，不记录明文。 [CITED: https://docs.nestjs.com/security/encryption-and-hashing] |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: codebase grep] [`apps/server/prisma/schema.prisma`](/Users/huangjingping/i/trip-map/apps/server/prisma/schema.prisma) - 当前 `TravelRecord` 全局唯一键、无 owner 字段。
- [VERIFIED: codebase grep] [`apps/server/src/modules/records/records.controller.ts`](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.controller.ts) - 当前 `/records` 全公开。
- [VERIFIED: codebase grep] [`apps/server/src/modules/records/records.service.ts`](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.service.ts) - 当前创建冲突走 `409`，未绑定用户上下文。
- [VERIFIED: codebase grep] [`apps/server/src/modules/records/records.repository.ts`](/Users/huangjingping/i/trip-map/apps/server/src/modules/records/records.repository.ts) - 当前查询/删除按全局 `placeId`。
- [VERIFIED: codebase grep] [`apps/web/src/stores/map-points.ts`](/Users/huangjingping/i/trip-map/apps/web/src/stores/map-points.ts) - 当前 bootstrap/optimistic update 生命周期。
- [VERIFIED: codebase grep] [`apps/web/src/services/api/client.ts`](/Users/huangjingping/i/trip-map/apps/web/src/services/api/client.ts) - 当前 `/api` client。
- [VERIFIED: codebase grep] [`apps/web/src/services/api/records.ts`](/Users/huangjingping/i/trip-map/apps/web/src/services/api/records.ts) - 当前 `fetch` 未显式带 credentials，且把 `409` 当成功。
- [VERIFIED: codebase grep] [`apps/web/vite.config.ts`](/Users/huangjingping/i/trip-map/apps/web/vite.config.ts) - dev proxy 现状。
- [VERIFIED: codebase grep] [`apps/server/prisma/migrations/20260408093000_enable_rls_for_public_tables/migration.sql`](/Users/huangjingping/i/trip-map/apps/server/prisma/migrations/20260408093000_enable_rls_for_public_tables/migration.sql) - 当前只启用 RLS，未定义 ownership policy。
- [VERIFIED: codebase grep] [`apps/server/test/records-travel.e2e-spec.ts`](/Users/huangjingping/i/trip-map/apps/server/test/records-travel.e2e-spec.ts) - 当前 records e2e 假设公开全局 CRUD。
- [VERIFIED: package.json] [`package.json`](/Users/huangjingping/i/trip-map/package.json), [`apps/web/package.json`](/Users/huangjingping/i/trip-map/apps/web/package.json), [`apps/server/package.json`](/Users/huangjingping/i/trip-map/apps/server/package.json) - 当前 stack 与测试命令。
- [VERIFIED: CLAUDE.md] [`CLAUDE.md`](/Users/huangjingping/i/trip-map/CLAUDE.md) - 项目执行与测试约束。
- [CITED: https://docs.nestjs.com/techniques/cookies] NestJS cookies docs - Fastify cookie 集成路径。
- [CITED: https://docs.nestjs.com/security/encryption-and-hashing] NestJS hashing docs - `argon2`/`bcrypt` 推荐。
- [CITED: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints] Prisma docs - 复合唯一键与查询。
- [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials] MDN - `credentials` 对 cookie 发送/接收的定义。
- [CITED: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie] MDN - `HttpOnly` / `SameSite` / `Secure` cookie 语义。
- [CITED: https://www.postgresql.org/docs/current/ddl-rowsecurity.html] PostgreSQL row security docs - RLS 行为与默认拒绝模型。

### Secondary (MEDIUM confidence)
- [VERIFIED: npm registry] `npm view @fastify/cookie version time --json`
- [VERIFIED: npm registry] `npm view argon2 version time --json`
- [VERIFIED: npm registry] `npm view @fastify/cors version time --json`
- [VERIFIED: npm registry] `npm view vue time --json`
- [VERIFIED: npm registry] `npm view pinia time --json`
- [VERIFIED: npm registry] `npm view vite time --json`
- [VERIFIED: npm registry] `npm view @nestjs/platform-fastify time --json`
- [VERIFIED: npm registry] `npm view fastify time --json`
- [VERIFIED: npm registry] `npm view @prisma/client time --json`
- [VERIFIED: npm registry] `npm view vitest time --json`

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 现有 package pin、npm registry 与官方文档都已核对。 [VERIFIED: package.json][VERIFIED: npm registry][CITED: https://docs.nestjs.com/techniques/cookies]
- Architecture: HIGH - 代码现状、锁定决策与 requirements 一致指向同一 cutover 方案。 [VERIFIED: codebase grep][VERIFIED: context][VERIFIED: .planning/REQUIREMENTS.md]
- Pitfalls: HIGH - 主要风险都能在当前 schema、records API、store 生命周期中直接定位。 [VERIFIED: codebase grep]

**Research date:** 2026-04-11
**Valid until:** 2026-04-25
