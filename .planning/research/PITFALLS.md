# Domain Pitfalls

**Domain:** v5.0 为现有 local-first 旅行地图追加账号体系、每用户云同步与更大海外覆盖
**Researched:** 2026-04-10
**Confidence:** HIGH

## 建议先拆出的 roadmap phase

1. **Phase 1: Auth & Ownership Foundation**
   先改数据模型、用户归属、鉴权入口与服务端 ownership。
2. **Phase 2: Session Boundary & Local Import**
   处理登录态切换、旧本地数据导入、首登迁移与前端状态重置。
3. **Phase 3: Sync Semantics & Multi-Device Hardening**
   处理幂等写入、冲突、离线/重试、多设备一致性。
4. **Phase 4: Overseas Coverage Foundation**
   处理 canonical ID 稳定性、geometry 数据源扩展、覆盖说明与回归。

## Critical Pitfalls

### Pitfall 1: 仍把 `TravelRecord` 设计成“全局 placeId 唯一”

**What goes wrong:**  
一旦引入账号，同一个 `placeId` 必须允许被不同用户各自保存；当前模型若不改，第二个用户点亮同一地点会直接冲突，或者被误判为“已点亮”。

**Why it happens in this codebase:**  
当前 `TravelRecord` 只有 `placeId @unique`，没有 `userId`，CRUD 也都按 `placeId` 读写。

**Prevention:**  
- 在账号功能上线前先加 `User` / `Account` 归属字段，所有旅行记录改为 `userId + placeId` 复合唯一约束。  
- 删除、查询、去重、统计全部按 `(userId, placeId)` 做，不再按裸 `placeId`。  
- 不要让客户端传 `userId` 作为真源，服务端从会话中推导当前用户。

**Roadmap phase:** Phase 1

---

### Pitfall 2: 误以为“开了 RLS”就已经隔离了多用户数据

**What goes wrong:**  
账号上线后仍可能出现跨用户读到全表、删掉别人记录、或 policy 漏写导致“自己也读不到自己数据”的情况。

**Why it happens in this codebase:**  
当前 migration 只 `ENABLE ROW LEVEL SECURITY`，但还没有按 `userId` 的 `SELECT` / `INSERT` / `DELETE` policy；现有 repository 代码也没有任何 user filter。

**Prevention:**  
- 在 Phase 1 同时完成三层护栏：服务端 guard、repository `where: { userId }`、数据库 RLS policy。  
- RLS policy 明确区分 `USING` 与 `WITH CHECK`，不要只写读策略不写写策略。  
- 若 Prisma 连接角色是表 owner 或高权限角色，确认是否会绕过 RLS；必要时用 `FORCE ROW LEVEL SECURITY` 或继续保持应用层 ownership 校验为主。

**Roadmap phase:** Phase 1

---

### Pitfall 3: 账号切换后前端沿用旧用户内存态，造成“串号”或空白假象

**What goes wrong:**  
用户登录、退出、切账号后，地图仍保留上一个用户的点亮结果，或首次鉴权尚未完成时就把空列表缓存成真相，随后不再自动重拉。

**Why it happens in this codebase:**  
`map-points` store 目前只做一次 `bootstrapFromApi()`，`hasBootstrapped` 置位后不会因 auth 状态变化自动重置；失败时还会把 `travelRecords` 置空并停止重试。

**Prevention:**  
- 把 store 生命周期绑定到 auth session，而不是绑定到 app 首次启动。  
- 明确区分 `auth-loading / unauthenticated / authenticated-ready / sync-error`，不要用空数组同时表达“未加载”和“没有数据”。  
- 退出和切账号时强制 `reset stores + cancel in-flight requests + clear pending mutations`。

**Roadmap phase:** Phase 2

---

### Pitfall 4: 现有本地用户首次登录后看到空云端，误以为记录丢失

**What goes wrong:**  
v4.0 之前的用户本来有本地旅行记录；v5.0 若直接把云端列表当唯一真源，首次登录极可能出现“地图被清空”，造成严重信任损失。

**Why it happens in this codebase:**  
当前前端已经把远端 `/records` 当主真源，本地 legacy 数据迁移路径尚未定义；这是“从单机升级到账号化”最典型的数据感知断层。

**Prevention:**  
- 单独做“首登导入”phase，不要把它夹在 auth API 开发里顺手做。  
- 明确导入策略：本地覆盖云端、云端覆盖本地，还是按 `placeId` 合并；并给用户明确确认文案。  
- 如果要保留“先体验再注册”的产品路径，优先支持匿名身份升级或显式 guest-import，而不是强制先注册再找回数据。

**Roadmap phase:** Phase 2

---

### Pitfall 5: 多设备同时点亮/取消时，当前 API 幂等语义不够稳

**What goes wrong:**  
同一用户在两台设备几乎同时点亮同一地点，可能一端成功、一端 409、前端却把 409 当“成功返回 record”处理；结果是状态闪烁、卡住、或 UI 与数据库不一致。

**Why it happens in this codebase:**  
当前客户端已经把 `409` 当作幂等成功分支，但后端冲突返回的是异常，不是 canonical record；再叠加账号和多设备后，这会从边缘问题变成主链路问题。

**Prevention:**  
- 服务端把“点亮 place”设计成真正幂等的 upsert/put 语义，并返回最终 canonical record。  
- 每个 mutation 带操作类型和稳定幂等键，不要只靠 HTTP 状态码猜测结果。  
- 前端明确区分 `401/403`、`409`、网络失败、重试中，不要统一回滚成“空状态”。

**Roadmap phase:** Phase 3

---

### Pitfall 6: 在 canonical ID 规则未稳定前就大规模扩海外覆盖，旧记录会失去可回放性

**What goes wrong:**  
一旦新增国家、替换海外数据源或重命名 `boundaryId`，历史同步记录可能还能存在数据库里，但地图无法重新高亮，甚至被识别成另一块区域。

**Why it happens in this codebase:**  
当前记录直接持久化 `boundaryId` 与 `datasetVersion`，前端 reopen/highlight 也直接依赖这些字段；海外层又建立在 Natural Earth admin-1 之上，本身就存在行政层级、命名和历史变更不完全稳定的问题。

**Prevention:**  
- 先定义“稳定 canonical place ID”与“可变 render boundary ID”的分层，不要把 render ID 当永久身份。  
- 引入 boundary alias / migration table，允许旧 `boundaryId` 映射到新 geometry。  
- 每次海外扩容必须附带“历史记录 reopen 回归”，不是只测新国家能点亮。

**Roadmap phase:** Phase 4

---

### Pitfall 7: 混合多种海外边界来源后，解析语义和渲染语义会慢慢漂移

**What goes wrong:**  
解析结果说的是“一级行政区”，渲染实际用的是另一层级或另一版本边界，最终出现标题正确、点亮错误、命中区域怪异、同国不同州精度不一致。

**Why it happens in this codebase:**  
现有中国链路与海外链路本来就使用不同数据源与坐标体系，海外 `Natural Earth` 数据里也已有国家级特殊注释；覆盖扩展若继续“按国家补洞”，很容易把 canonical、geometry、命名翻译各做各的。

**Prevention:**  
- 维持单一 ingestion contract：source catalog、checksum、dataset version、admin level、命名来源必须一起版本化。  
- 每新增一批国家，都要补 fixtures：resolve、confirm、persist、reopen、highlight 五段式回归。  
- 明确规定 v5.0 海外只支持一个可解释的行政层级，不要有的国家到州、有的国家到省、有的国家退到国家级却不提示。

**Roadmap phase:** Phase 4

## Moderate Pitfalls

### Pitfall 1: 没有显式 mutation 队列，网络抖动时乐观 UI 会反复打脸

**What goes wrong:**  
当前 `illuminate/unilluminate` 直接乐观改内存，失败就回滚。加上 auth token 过期、移动端弱网、多设备后，这会频繁造成“刚点亮又灭掉”的体验。

**Prevention:**  
- 引入 per-user pending mutation queue、重试策略和“待同步”态。  
- 把 401/refresh failure 与普通网络失败分开处理。

**Roadmap phase:** Phase 3

---

### Pitfall 2: 海外覆盖不透明，用户会把“不支持”理解成“识别错了”

**What goes wrong:**  
更多海外国家上线后，用户点击某些区域只能识别到上层行政区，或根本无法点亮；如果 UI 不明确说明支持层级和覆盖边界，用户会把问题归因于账号同步或地图 bug。

**Prevention:**  
- 在 popup/summary 中明确显示当前国家的支持层级与“不支持原因”。  
- 提供 coverage 文案或国家级支持矩阵，不要让用户靠试错理解能力边界。

**Roadmap phase:** Phase 4

---

### Pitfall 3: 把 auth 做成强制登录墙，会破坏现有“先点图再决定是否登录”的价值

**What goes wrong:**  
应用从轻量地图工具突然变成“进来先注册”，会直接降低首次体验，尤其对原本只是想临时点几下地图的用户。

**Prevention:**  
- 保留游客体验，登录只在需要跨设备同步时触发。  
- 如果选择匿名身份升级路径，必须设计清楚“何时转正、如何保留数据、何时清理匿名账号”。

**Roadmap phase:** Phase 2

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Auth & Ownership Foundation | 直接在现有 `TravelRecord` 上叠 auth，没先改唯一键和归属字段 | 先做 schema/repository/API 归属改造，再接前端登录 |
| Auth & Ownership Foundation | 只配登录，不配 ownership filter / RLS policy | 同 phase 完成服务端过滤、RLS、权限回归 |
| Session Boundary & Local Import | 登录态变化不触发 store reset，出现串号或空白缓存 | 把 store bootstrap 绑定 session；登录/退出强制重置 |
| Session Boundary & Local Import | v4.x 本地数据无迁移方案 | 单独做首登导入与合并确认，不与 auth 表单耦合 |
| Sync Semantics & Multi-Device Hardening | 双设备重复写入导致 409/回滚/闪烁 | 服务端幂等 upsert + 客户端 mutation queue |
| Sync Semantics & Multi-Device Hardening | token 过期被当普通失败处理 | 单独处理 auth refresh 失败，禁止静默吞掉 |
| Overseas Coverage Foundation | 先大批量加国家，后补 canonical/boundary 稳定性 | 先锁 canonical ID 规则、alias 迁移和回归基线 |
| Overseas Coverage Foundation | 支持层级不统一，用户误解“同步有问题” | UI 明确标识国家支持层级与不支持原因 |

## Current-Code Warning Signs

- `apps/server/prisma/schema.prisma`: `TravelRecord.placeId` 仍是全局唯一，尚无 `userId`。
- `apps/server/src/modules/records/records.repository.ts`: 旅行记录查询/删除未按用户过滤。
- `apps/server/prisma/migrations/20260408093000_enable_rls_for_public_tables/migration.sql`: 目前只有 `ENABLE RLS`，未见用户级 policy。
- `apps/web/src/stores/map-points.ts`: `bootstrapFromApi()` 是一次性启动逻辑，且失败后不会自动重试。
- `apps/web/src/stores/map-points.ts`: `illuminate/unilluminate` 依赖乐观更新，尚无同步队列。
- `apps/web/src/services/api/records.ts`: 客户端已把 `409` 当幂等成功分支，但服务端尚未提供稳定“冲突即返回最终 record”语义。

## Sources

- 本地代码证据：
  - `.planning/PROJECT.md`
  - `.planning/MILESTONES.md`
  - `apps/server/prisma/schema.prisma`
  - `apps/server/src/modules/records/records.repository.ts`
  - `apps/server/prisma/migrations/20260408093000_enable_rls_for_public_tables/migration.sql`
  - `apps/web/src/stores/map-points.ts`
  - `apps/web/src/services/api/records.ts`
- 官方资料：
  - Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
  - Supabase Auth `getUser`: https://supabase.com/docs/reference/javascript/auth-getuser
  - Supabase Anonymous Sign-Ins: https://supabase.com/docs/guides/auth/auth-anonymous
  - PostgreSQL Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
  - PostgreSQL `CREATE POLICY`: https://www.postgresql.org/docs/current/sql-createpolicy.html
  - Prisma composite unique constraints: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
  - Natural Earth Admin-1 States and Provinces: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
