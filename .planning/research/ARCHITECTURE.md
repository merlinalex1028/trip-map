# Architecture Research: v5.0 账号体系、云同步与海外覆盖扩展

**Domain:** 现有 trip-map 架构上的新增集成层
**Researched:** 2026-04-10
**Confidence:** HIGH

## Current Constraints

- `apps/server/prisma/schema.prisma` 中 `TravelRecord.placeId` 仍是全局唯一，无法表达“同一地点被多个用户点亮”。
- `apps/server/src/modules/records/*` 当前是公开 CRUD，没有身份上下文，`findAllTravel()` 会返回整张表。
- `apps/web/src/services/api/records.ts` 是裸 `fetch`，没有统一凭证注入。
- `apps/web/src/stores/map-points.ts` 的 bootstrap 逻辑是匿名全量拉取，且本地状态主键直接等于 `placeId`。
- `apps/server/src/modules/canonical-places/canonical-places.service.ts` 已经把 canonical place 元数据和海外 geometry manifest 绑在一起，说明“扩海外”应继续走数据资产扩展，而不是塞进 records/auth 业务表。

## Recommended Architecture

```text
apps/web
  auth-session store
  map-points store
  api client (credentials: include)
        |
        v
apps/server
  auth module -> user/session guard
  bootstrap endpoint -> user profile + records snapshot
  records module -> per-user record set
  canonical-places module -> public resolve/confirm
        |
        v
PostgreSQL
  users
  auth_sessions
  user_travel_records
  smoke_records

data pipeline
  canonical place dataset
  geometry manifest + overseas shards
```

## New vs Modified Pieces

### New

| Area | Piece | Responsibility |
|------|-------|----------------|
| Server | `auth` module | 注册、登录、登出、会话恢复、当前用户读取 |
| Server | `users` repository/service | 用户唯一身份与密码哈希管理 |
| Server | `session` guard + `@CurrentUser()` decorator | 把 cookie/session 解析成请求用户上下文 |
| Server | bootstrap endpoint (`GET /auth/bootstrap`) | 一次返回 `user + records snapshot`，作为同步入口 |
| Database | `User` | 账号主体 |
| Database | `AuthSession` | 服务端可撤销会话，多设备登录基础 |
| Database | `UserTravelRecord` | 用户私有旅行记录，唯一键改为 `(userId, placeId)` |
| Contracts | `auth.ts` / `bootstrap.ts` | 注册、登录、会话、bootstrap DTO |
| Web | `auth-session` store | 启动时恢复登录态，持有 `user/bootstrapStatus` |
| Web | authenticated API wrapper | 统一 `credentials: 'include'`、401 清理、错误归一化 |

### Modified

| Area | Piece | Change |
|------|-------|--------|
| Server | `records` module | 从“全局 records”改为“当前用户 records” |
| Server | `main.ts` | 注册 cookie/session 所需 Fastify 插件，必要时补跨域 cookie 配置 |
| Database | 现有 `TravelRecord` | 不再作为 v5 主表；建议保留为 legacy 数据，不直接硬改归属 |
| Contracts | `TravelRecord` | 建议补 `updatedAt`，保留 canonical snapshot 字段 |
| Web | `services/api/records.ts` | 走 authenticated API wrapper，语义改为“当前用户记录” |
| Web | `stores/map-points.ts` | 不再自己决定登录态；依赖 auth bootstrap 成功后加载记录 |
| Data pipeline | canonical/geometry 生成链路 | 扩大海外 place catalog 与 geometry manifest，但不改 auth/records 边界 |

## User Ownership Model

**推荐不要在现有 `TravelRecord` 上原地做 ownership backfill。** 当前全局表没有任何可信 owner 信息，无法安全地把旧记录归到某个用户。

### 推荐数据模型

| Table | Key fields | Notes |
|------|------------|-------|
| `User` | `id`, `email`(unique), `passwordHash`, `createdAt`, `updatedAt` | 账号主体 |
| `AuthSession` | `id`, `userId`, `sessionTokenHash`, `expiresAt`, `revokedAt`, `lastSeenAt` | 支持多设备登录与服务端登出 |
| `UserTravelRecord` | `id`, `userId`, `placeId`, `boundaryId`, `datasetVersion`, `displayName`, `regionSystem`, `adminType`, `typeLabel`, `parentLabel`, `subtitle`, `createdAt`, `updatedAt` | `@@unique([userId, placeId])` |

### Why New Table Instead of In-Place Mutation

- 现有 `TravelRecord.placeId @unique` 是全局约束，直接修改会让迁移窗口复杂化。
- 旧数据没有 owner，强行加 `userId` 只会把不确定数据永久带入正式模型。
- 新表切换更清晰：v5 代码只读写 `UserTravelRecord`，legacy 表留作审计/清理。

## Auth and Session Design

**推荐：同域 HttpOnly cookie + 服务端 session 表，不在前端持久化 JWT。**

### Why

- 现有 web 默认通过 `/api` 同域访问后端，cookie 模式与现状最贴合。
- 刷新页面后，前端只需重新请求 bootstrap，不需要本地保存 access token。
- 服务端 session 天然支持“退出当前设备 / 全部设备退出 / 会话撤销”。
- 对 `fetch` 的改造面最小：统一加 `credentials: 'include'` 即可。

### Request Flow

1. `POST /auth/register` 或 `POST /auth/login`
2. 服务端创建 `AuthSession`，写入 HttpOnly cookie
3. Web 启动时调用 `GET /auth/bootstrap`
4. 服务端根据 cookie 解析用户，返回：

```ts
{
  user: {
    id: string
    email: string
  },
  records: TravelRecord[]
}
```

5. `map-points` 用返回的 `records` 初始化，而不是自己单独匿名拉取

### Guard Boundary

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/bootstrap`
- `GET/POST/DELETE /records`

`/places/resolve` 与 `/places/confirm` 继续保持公开，避免地理识别能力被登录态耦合。

## Sync Bootstrap and Conflict Semantics

### v5 Sync Scope

v5 应定义为：**登录后拉取服务端权威快照 + 所有写操作直写服务端**。  
不要在本里程碑引入离线队列、后台 diff engine、CRDT 或复杂双向合并。

### Bootstrap Contract

`GET /auth/bootstrap` 是唯一权威入口：

- `200`: 已登录，返回 `user + records`
- `401`: 未登录，前端清空 auth state 与 map records

这比“先 `/auth/me` 再 `/records`”更稳，能避免前端在 session 失效边界出现分裂状态。

### Mutation Semantics

| Operation | Server semantics | Frontend handling |
|----------|------------------|-------------------|
| Illuminate | 对 `(userId, placeId)` 执行 upsert / create-if-missing | 乐观插入，成功后用服务端记录覆盖 |
| Unilluminate | 按 `(userId, placeId)` 删除；不存在也返回成功语义 | 乐观删除，失败时回滚 |
| Re-bootstrap | 始终以下一份服务端快照覆盖本地 `travelRecords` | 用于刷新、重新登录、401 后恢复 |

### Conflict Rule

- **同地点重复点亮**：按 idempotent create 处理，返回当前服务端行。
- **一端删除、一端仍显示旧数据**：不做增量冲突合并；以下次 bootstrap 为准。
- **同账号多设备并发**：服务端权威，客户端仅保证“本次操作”的乐观一致性。

这套语义足够支撑“跨设备同步基础版”，但不会过早把系统推进到实时同步复杂度。

## Overseas Coverage Expansion Path

### Principle

海外扩展走 **canonical dataset + geometry manifest + shard 资产** 三件套，不走 records schema 定制。

### Integration Rule

- `UserTravelRecord` 继续存 canonical snapshot：`placeId / boundaryId / datasetVersion / labels`
- 渲染时仍通过 `boundaryId -> geometry manifest` 判断当前是否有边界覆盖
- 新增海外地点时，主要改动应落在：
  - canonical place 数据源
  - geometry shard 生成
  - `GEOMETRY_MANIFEST`
  - 必要的 `placeId` / `boundaryId` 兼容映射

### Compatibility Requirement

海外覆盖扩展时，**优先保持既有 `placeId` 稳定**。如果确实需要重命名：

- 服务端增加 alias/compat lookup，或
- 提供一次性 backfill 脚本迁移 `UserTravelRecord.placeId/boundaryId`

不要把“place ID 兼容”推给前端 `map-points` store。

## Migration Path

### Phase A: Expand Without Cutover

1. 新增 `User`、`AuthSession`、`UserTravelRecord`
2. 保留旧 `TravelRecord` 不动，视为 legacy
3. 新增 auth/bootstrap/contracts，但暂不切换现有 records 流量

### Phase B: Cut Over Runtime

1. `records` 模块改为只访问 `UserTravelRecord`
2. 受保护路由全部从 request user 取 `userId`
3. 前端先跑 auth bootstrap，再初始化 `map-points`
4. 401 统一触发本地状态清空

### Phase C: Legacy Handling

1. 导出或审计旧 `TravelRecord`
2. 明确“不自动认领 legacy 记录”
3. 稳定后再决定删除 legacy 表或保留只读归档

## Migration Hotspots

| Hotspot | Why risky | Mitigation |
|--------|-----------|------------|
| 旧 `TravelRecord` 无 owner | 不能可信回填到用户 | 新建 `UserTravelRecord`，legacy 隔离 |
| `map-points` 现在自己 bootstrap | 容易和 auth state 脱节 | 改成依赖 `auth-session` store 的 bootstrap 结果 |
| 现有 API client 无凭证策略 | 登录后请求不会自动带 cookie | 统一 API wrapper + `credentials: 'include'` |
| 海外 place/boundary 重命名 | 已保存记录可能失去边界覆盖 | placeId 稳定优先；必要时做 alias/backfill |
| 公开 `/records` 语义切换 | 容易导致旧测试/旧前端误读全局数据 | contracts 与 e2e 同步更新，明确“当前用户记录” |

## Suggested Build Order

1. **Auth foundation**
   - Prisma 新表
   - cookie/session 基础设施
   - `auth` module + `GET /auth/bootstrap`

2. **Per-user records cutover**
   - 新 `UserTravelRecord` repository/service
   - `records` 路由接入 guard
   - contracts 增加 `updatedAt` 与 bootstrap DTO

3. **Web bootstrap rewrite**
   - 新 `auth-session` store
   - API wrapper 加 `credentials: 'include'`
   - `map-points` 改成消费 bootstrap snapshot

4. **Legacy isolation + verification**
   - legacy 数据导出/审计
   - 登录/登出/换设备/bootstrap 回归测试
   - 多账号互不串数据验证

5. **Overseas coverage expansion**
   - 扩 canonical place catalog 与 geometry shards
   - 做兼容映射/回填策略
   - 验证“老记录仍可展示，新地点可识别可点亮”

## Roadmap Implications

- 账号体系必须先于记录 ownership 改造落地，否则 records 无法有稳定命名空间。
- sync baseline 应作为 auth 的一部分交付，不要把 bootstrap 拆成独立后补 phase。
- 海外覆盖扩展应排在“用户私有 records 稳定”之后；否则会在 place/boundary 兼容上同时踩两类迁移风险。
- `SmokeRecord` 不应进入本 milestone 主链路，除非它被明确用于 auth/records 迁移验证。

## Sources

### Internal code

- `apps/server/prisma/schema.prisma`
- `apps/server/src/modules/records/records.service.ts`
- `apps/server/src/modules/records/records.repository.ts`
- `apps/server/src/modules/records/records.controller.ts`
- `apps/server/src/modules/canonical-places/canonical-places.service.ts`
- `apps/web/src/services/api/records.ts`
- `apps/web/src/stores/map-points.ts`
- `apps/web/src/services/geometry-manifest.ts`
- `apps/web/src/services/city-boundaries.ts`

### External references

- NestJS Authentication: https://docs.nestjs.com/security/authentication
- NestJS Session techniques: https://docs.nestjs.com/techniques/session
- Prisma compound unique constraints: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
- MDN `Request.credentials`: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
- MDN `Set-Cookie`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
