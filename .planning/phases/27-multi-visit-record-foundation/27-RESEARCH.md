# Phase 27: Multi-Visit Record Foundation - Research

**Researched:** 2026-04-20
**Domain:** Prisma schema migration + NestJS records API + Vue 3 Pinia store + inline date input UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 新增旅行记录时，用户必须先填写旅行日期后才能保存。
- **D-02:** 旅行日期精度固定到天，使用 `YYYY-MM-DD`。
- **D-03:** 每条旅行记录支持开始日期和可选结束日期；未填写结束日期时表示单日旅行；若填写结束日期，则必须满足 `结束日期 >= 开始日期`。
- **D-04:** 对于已点亮地点，"再记一次旅行"仍在当前地图 popup 内完成，不跳到其他页面，也不额外弹出独立对话框。
- **D-05:** 已点亮地点的 popup 默认展示轻量摘要：`已去过 N 次 + 最近一次日期/日期范围`。
- **D-06:** 地图上的"取消点亮"继续保持地点级清理语义，不细化到单条旅行记录删除；当一个地点的所有旅行记录都被清除后，该地点才变为未点亮。
- **D-07:** v6 之前的旧地点记录在迁移后，每个地点转换为 1 条历史旅行记录，而不是拆分或推测多次历史去访。
- **D-08:** 旧记录迁移后的旅行日期统一标记为"未知"，不能用旧 record 的 `createdAt` 近似伪装成真实旅行日期。
- **D-09:** 首次登录时导入的本地旧记录与账号里已有旧记录遵循同一迁移口径，保持数据语义一致。

### Claude's Discretion
- 具体的日期输入控件形态与表单展开动画，由规划和实现阶段结合现有 Kawaii popup 视觉系统决定。
- "日期未知"在数据层的具体表示方式由规划阶段决定，可为 nullable start/end date、显式状态字段或等价方案，但对产品语义必须统一为"未知而非推测"。
- 多次旅行记录落地后，前端是直接持有多条 trip 记录，还是在 store 内额外维护 place 级聚合视图，由规划阶段根据现有 `placeId` 主链路兼容成本决定。

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRIP-01 | 用户点亮地点时可以选择这次旅行发生的日期 | D-01~D-03 锁定日期模型；PointSummaryCard 与 illuminate 流程是实现入口 |
| TRIP-02 | 用户可以为同一地点保存多次旅行记录，而不是被覆盖成单次去访 | 核心变更：移除 `@@unique([userId, placeId])`，前端 store 改为多条记录聚合 |
| TRIP-03 | 已保存的旅行日期与同地点多次去访记录在刷新、重开应用和跨设备后仍能稳定恢复 | `/auth/bootstrap` 链路携带新字段；`applyAuthoritativeTravelRecords` 需适配多条记录语义 |
</phase_requirements>

---

## Summary

Phase 27 的核心工程任务是把整个记录模型从**每地点一条存在性记录**（由 `@@unique([userId, placeId])` 强制）升级为**每次旅行一条带日期的历史记录**。这个变更横跨数据库 schema、后端 API、shared contracts 和前端 store 四层，每层都有严格的接口依赖，必须按固定顺序逐层升级。

前端当前的 `travelRecords: TravelRecord[]` 以 `placeId` 为唯一键假设运行（`findSavedPointByPlaceId`、`applyAuthoritativeTravelRecords` 内的 `snapshotByPlaceId` Map 等处），多条记录模型落地后，必须在 store 层引入**place 级聚合视图**，保证地图点亮逻辑（`isPlaceIlluminated = travelRecords.some(r => r.placeId === placeId)`）和 `unilluminate`（按 `placeId` 全部删除）的行为不变。

旧记录迁移方面，现有账号数据库中每条 `UserTravelRecord` 已是"单地点一条"结构，Phase 27 只需为这些记录补充"日期未知"标记，无需数据重分拆；首次登录时导入的本地记录（`legacy-point-storage`）同理，以同一口径处理。

**Primary recommendation:** 按 contracts → schema migration → backend → frontend store → UI 的顺序逐步升级，每步均有可运行的测试验证，防止跨层回归。

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 旅行日期字段定义与约束 | contracts 包 | — | 前后端 strict 类型共享的单一真源 |
| 旅行记录多条持久化 | Database (Prisma schema) | API (RecordsRepository) | schema 层结构约束决定持久化语义 |
| 日期字段校验 | API (DTO / class-validator) | — | 服务端校验，防止非法数据入库 |
| Bootstrap 恢复 (跨设备) | API (AuthService.bootstrap) | Frontend (auth-session store) | 服务端返回 authoritative snapshot，前端被动消费 |
| Place 级点亮状态聚合 | Frontend (map-points store) | — | 地图 UX 聚合逻辑，与数据库行数解耦 |
| "再记一次旅行"UI 交互 | Frontend (PointSummaryCard) | Frontend (MapContextPopup) | D-04 决定留在 popup 内闭环，不跳页 |
| 旧记录迁移口径 | Backend migration (数据库 migration SQL) | Frontend (legacy-point-storage) | 数据库中已有记录补字段；本地记录归一化时同步处理 |
| 取消点亮删除语义 | Frontend store + API | — | D-06：仍按 placeId 全部删除，API DELETE /:placeId 语义不变 |

---

## Standard Stack

### Core（均为已有依赖，无新增安装）

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma Client | ^6.19.3 [VERIFIED: package.json] | ORM + schema migration | 项目既有 ORM，schema.prisma 是唯一数据模型真源 |
| NestJS + class-validator | 已有 [VERIFIED: records DTO 代码] | DTO 校验 | 项目既有 NestJS 校验体系，IsOptional + Matches 可直接复用 |
| Vue 3 Composition API + Pinia | 已有 [VERIFIED: map-points.ts] | 前端状态管理 | 项目唯一状态管理方案 |
| TypeScript 5.9 (strict) | 已有 [VERIFIED: tsconfig] | 类型安全 | 全栈 strict TS，contracts 包提供共享类型 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @nestjs/swagger + ApiProperty | 已有 | DTO 文档与 OpenAPI 装饰器 | 新增日期字段时在 DTO 补充 `@ApiProperty` |
| Vitest | 已有 | 单元与集成测试 | 所有 `.spec.ts` 文件，运行命令 `vitest run` |

### 无需新增依赖

日期输入控件不需要引入 datepicker 库：HTML `<input type="date">` 原生支持 `YYYY-MM-DD` 格式，与 D-02 精度完全对齐，且无额外包体积。Kawaii 视觉风格通过 Tailwind 类覆盖实现。

**Installation:** 无需新增包。

---

## Architecture Patterns

### System Architecture Diagram

```
用户点击地图
     |
     v
LeafletMapStage → MapContextPopup → PointSummaryCard
                                          |
                        ┌─────────────────┴──────────────────┐
                        |                                      |
                 [未点亮地点]                            [已点亮地点]
                 inline 日期表单                        轻量摘要 + "再记一次"按钮
                 (startDate + endDate)                  展开 inline 日期表单
                        |                                      |
                        └────────────────┬─────────────────────┘
                                         |
                               emit('illuminate', { startDate, endDate })
                                         |
                                   map-points store
                               illuminate(summary + dates)
                                         |
                              optimistic: 追加到 travelRecords[]
                                         |
                              POST /records { ...place, startDate, endDate }
                                         |
                        ┌────────────────┴────────────────┐
                        |                                  |
                   服务端成功                          服务端失败
               replace 乐观记录                    回滚乐观记录
               with authoritative                  显示 warning notice
                        |
              /auth/bootstrap 恢复 (刷新/跨设备)
                        |
              AuthService.bootstrap → findUserTravelRecords
                        |
              AuthBootstrapResponse.records: TravelRecord[] (含日期字段)
                        |
              auth-session store → map-points store
              applyAuthoritativeTravelRecords(records)
                        |
              place 级点亮状态重建: isPlaceIlluminated(placeId)
              = travelRecords.some(r => r.placeId === placeId)
```

### Recommended Project Structure（变更文件清单）

```
packages/contracts/src/
└── records.ts                    # TravelRecord 增 startDate?/endDate?; CreateTravelRecordRequest 同步

apps/server/prisma/
├── schema.prisma                 # UserTravelRecord: 移除 @@unique([userId,placeId]), 加日期字段
└── migrations/
    └── 20260420_phase27_multi_visit_dates/migration.sql

apps/server/src/modules/records/
├── dto/create-travel-record.dto.ts    # 新增可选日期字段 + 校验
├── dto/import-travel-records.dto.ts   # 透传（CreateTravelRecordDto 变更自动生效）
├── records.repository.ts              # createTravelRecord: 改为 create 而非 upsert
│                                      # deleteTravelRecordByPlaceId: 保持 deleteMany by placeId (D-06)
│                                      # importTravelRecords: 去重逻辑需重新定义（见Pitfall 2）
└── records.service.ts                 # toContractTravelRecord: 映射新日期字段

apps/server/src/modules/auth/
└── auth.service.ts                    # toContractTravelRecord: 同步映射日期字段

apps/web/src/
├── stores/map-points.ts               # illuminate 签名加日期; 多条记录 store 结构重构
├── services/api/records.ts            # createTravelRecord request 携带日期
├── services/legacy-point-storage.ts   # normalizeLegacyTravelRecord 输出 dateKnown: false
└── components/map-popup/
    ├── PointSummaryCard.vue           # 已点亮摘要 + inline 日期表单 + "再记一次"入口
    └── TripDateForm.vue               # (新) 内联日期表单子组件
```

### Pattern 1: Prisma Schema 多条记录模型

**What:** 移除 `@@unique([userId, placeId])`，改为 `@@index([userId, placeId])`，允许同一地点多条旅行记录。新增 `startDate`（nullable String, YYYY-MM-DD）和 `endDate`（nullable String）字段表达日期，nullable 用于兼容旧记录的"日期未知"语义（D-08）。

**When to use:** 凡需要保存同一实体的多次历史事件时，使用独立行而非 upsert 覆盖。

**Example:**
```prisma
// Source: apps/server/prisma/schema.prisma [VERIFIED: 现有代码]
model UserTravelRecord {
  id             String   @id @default(cuid())
  userId         String
  placeId        String
  boundaryId     String
  placeKind      String
  datasetVersion String
  displayName    String
  regionSystem   String?
  adminType      String?
  typeLabel      String?
  parentLabel    String?
  subtitle       String
  startDate      String?  // YYYY-MM-DD, null = 日期未知
  endDate        String?  // YYYY-MM-DD, null = 单日或未知
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, placeId])   // 从 @@unique 降级为 @@index
  @@index([userId])
}
```

### Pattern 2: contracts 日期字段设计

**What:** `TravelRecord` 新增可选日期字段；`CreateTravelRecordRequest` 同步。选择 nullable string 而非 Date 对象，与现有 `createdAt: string` 模式一致，避免时区序列化问题。

**Example:**
```typescript
// Source: packages/contracts/src/records.ts [VERIFIED: 现有代码结构]
export interface TravelRecord {
  id: string
  placeId: string
  // ... 其他已有字段 ...
  startDate: string | null   // YYYY-MM-DD; null = 日期未知
  endDate: string | null     // YYYY-MM-DD; null = 单日旅行或未知
  createdAt: string
}

export interface CreateTravelRecordRequest extends CanonicalPlaceSummary {
  startDate: string | null
  endDate: string | null
}
```

### Pattern 3: DTO 日期校验（class-validator）

**What:** 日期字段使用 `@IsOptional()` + `@Matches(/^\d{4}-\d{2}-\d{2}$/)` 进行格式约束，服务端额外校验 `endDate >= startDate`。

**Example:**
```typescript
// Source: [ASSUMED - class-validator 标准用法，基于现有 DTO 结构]
import { IsOptional, Matches } from 'class-validator'

@IsOptional()
@Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
startDate?: string | null

@IsOptional()
@Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
endDate?: string | null
```

### Pattern 4: store 层 place 级聚合视图

**What:** `travelRecords` 继续持有多条记录（`TravelRecord[]`），新增派生计算 `tripsByPlaceId: Map<string, TravelRecord[]>` 供 UI 读取次数摘要，`isPlaceIlluminated` 保持 `some(r => r.placeId)` 语义不变。

**Example:**
```typescript
// Source: apps/web/src/stores/map-points.ts [VERIFIED: 现有结构推导]
// 新增 computed
const tripsByPlaceId = computed(() => {
  const map = new Map<string, TravelRecord[]>()
  for (const record of travelRecords.value) {
    const existing = map.get(record.placeId) ?? []
    map.set(record.placeId, [...existing, record])
  }
  return map
})

// isPlaceIlluminated — 不变
function isPlaceIlluminated(placeId: string): boolean {
  return travelRecords.value.some((r) => r.placeId === placeId)
}

// unilluminate — 后端 DELETE /:placeId 仍按地点级删除，D-06 语义不变
// 前端乐观更新：移除该 placeId 下所有记录
travelRecords.value = travelRecords.value.filter((r) => r.placeId !== placeId)
```

### Pattern 5: illuminate 签名扩展

**What:** `illuminate` 函数增加 `startDate: string | null` / `endDate: string | null` 参数。当地点已存在至少一条记录时，不再跳过（当前逻辑 `if (travelRecords.value.some(r => r.placeId === placeId)) return`），改为允许追加新记录。

**关键变化：** 移除"Skip if already illuminated"短路逻辑，改为允许多次 illuminate 同一地点。

**Example:**
```typescript
// Source: apps/web/src/stores/map-points.ts [VERIFIED: 现有代码，需修改]
async function illuminate(summary: {
  placeId: string
  // ... 其他已有字段 ...
  startDate: string | null
  endDate: string | null
}) {
  // 不再: if (travelRecords.value.some(r => r.placeId === placeId)) return
  // 改为: 允许追加，乐观记录用 `id: pending-${placeId}-${Date.now()}` 防冲突
  const optimisticRecord: TravelRecord = {
    id: `pending-${placeId}-${Date.now()}`,
    // ...
    startDate: summary.startDate,
    endDate: summary.endDate,
  }
  travelRecords.value = [...travelRecords.value, optimisticRecord]
  // ...
}
```

### Pattern 6: applyAuthoritativeTravelRecords 多条记录适配

**What:** 当前 `applyAuthoritativeTravelRecords` 用 `Map<placeId, TravelRecord>` 合并，假设每个 placeId 最多一条。多条记录后需改为按记录 `id` 合并。

**Example:**
```typescript
// Source: apps/web/src/stores/map-points.ts [VERIFIED: 现有代码，需修改]
function applyAuthoritativeTravelRecords(records: TravelRecord[]) {
  if (pendingPlaceIds.value.size === 0) {
    travelRecords.value = [...records]
    hasBootstrapped.value = true
    return
  }

  // 改为按 record.id 合并，而非 placeId
  const snapshotById = new Map(records.map((r) => [r.id, r]))
  const pendingRecords = travelRecords.value.filter(
    (r) => r.id.startsWith('pending-') && pendingPlaceIds.value.has(r.placeId)
  )

  const merged = [...snapshotById.values(), ...pendingRecords]
  travelRecords.value = merged
  hasBootstrapped.value = true
}
```

### Pattern 7: displayPoints 去重（place 级 UI 聚合）

**What:** `displayPoints` 当前直接 `travelRecords.value.map(recordToDisplayPoint)`，多条记录后地图上同一地点会出现多个 marker。需改为按 placeId 去重，只保留最新一条记录作为 display 代表。

**Example:**
```typescript
// Source: [ASSUMED - 基于现有逻辑推导]
const displayPoints = computed<MapPointDisplay[]>(() => {
  // 每个 placeId 只取最新一条记录作为地图 marker 代表
  const latestByPlaceId = new Map<string, TravelRecord>()
  for (const record of travelRecords.value) {
    const existing = latestByPlaceId.get(record.placeId)
    if (!existing || record.createdAt > existing.createdAt) {
      latestByPlaceId.set(record.placeId, record)
    }
  }
  const points = [...latestByPlaceId.values()].map(recordToDisplayPoint)
  if (draftPoint.value) points.push(draftPoint.value)
  return points
})
```

### Pattern 8: importTravelRecords 多条记录去重口径

**What:** 当前 `importTravelRecords` 按 `placeId` 查找已存在记录并跳过。多条记录模型下，"本地已有该 placeId 的旧记录"不再是跳过的理由——只有完全相同的记录（相同 placeId + 相同 startDate + 相同 endDate）才应视为重复（D-09）。

导入旧记录时 `startDate: null, endDate: null`，此时相同 placeId + null + null 才为重复，避免为同一历史地点重复创建多条"日期未知"记录。

### Anti-Patterns to Avoid

- **不要用 `createdAt` 近似旧记录旅行日期**：D-08 明确禁止，字段必须显式设为 null（"未知"），不得用 `createdAt` 填充 `startDate`。
- **不要在 map 地图层渲染多个同 placeId marker**：`displayPoints` 必须按 placeId 去重，多条旅行记录是数据层概念，地图层只展示 place 存在性。
- **不要把 illuminate 的"已点亮跳过"短路留在原处**：现在需要支持同一地点多次新增，必须移除该早返回逻辑。
- **不要在 `applyAuthoritativeTravelRecords` 用 placeId 作为合并 key**：多条记录后同 placeId 存在多条，必须改为 record `id` 作为合并 key。
- **不要让 `unilluminate` 只删一条记录**：D-06 要求地点级清理，必须删除该 placeId 下所有记录。

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 日期格式校验 | 自定义日期 parser | `@Matches(/^\d{4}-\d{2}-\d{2}$/)` + HTML `<input type="date">` | 原生方案零依赖，浏览器/Node 内置支持 |
| 日期比较（endDate >= startDate） | 手写 Date 对象比较 | 字符串字典序比较（`endDate >= startDate`，YYYY-MM-DD 格式保证单调性） | 简单可靠，无时区问题 |
| 多条记录 upsert/去重 | 自定义 SQL | Prisma `create` + 应用层查重逻辑 | `createMany` + `skipDuplicates` 可处理批量去重 |
| 数据库 migration | 手写 ALTER TABLE | `prisma migrate dev` 生成 migration SQL | Prisma 保证迁移幂等、可回滚 |

**Key insight:** 日期精度到天（D-02）让整个实现大幅简化：无需时区处理，字符串字典序比较即可正确排序和比大小。

---

## Runtime State Inventory

> 此阶段包含 schema 变更和字段增加，属于部分迁移性质，需审查运行时状态。

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | PostgreSQL `UserTravelRecord` 表已有数据：每行 `startDate` / `endDate` 字段不存在 | schema migration 新增字段（nullable，默认 null），存量数据自动获得"日期未知"语义 |
| Live service config | Prisma migration 部署通过 `prisma migrate deploy` 执行，无 UI 配置 | 代码编排，不需要手动操作 |
| OS-registered state | 无 Task Scheduler / pm2 / launchd 相关注册 | 无需操作 |
| Secrets/env vars | `DATABASE_URL` / `DIRECT_URL` 已有，不涉及重命名 | 无需操作 |
| Build artifacts | Prisma Client 需在 schema 变更后重新生成 | `prisma generate` 作为 Wave 0 任务 |

**Migration 核心动作：**
1. `prisma migrate dev` 生成 migration SQL（开发环境）
2. migration SQL 内容：
   - `ALTER TABLE "UserTravelRecord" DROP CONSTRAINT "UserTravelRecord_userId_placeId_key";` — 移除 unique 约束
   - `ALTER TABLE "UserTravelRecord" ADD COLUMN "startDate" TEXT;` — nullable
   - `ALTER TABLE "UserTravelRecord" ADD COLUMN "endDate" TEXT;` — nullable
   - `CREATE INDEX "UserTravelRecord_userId_placeId_idx" ON "UserTravelRecord"("userId", "placeId");` — 降级为普通索引
3. 存量数据不需要 UPDATE：`startDate = null` 天然表达"日期未知"（D-08）

---

## Common Pitfalls

### Pitfall 1: illuminate "已点亮跳过"短路导致无法再记一次

**What goes wrong:** 现有代码在 `illuminate` 内有 `if (travelRecords.value.some(r => r.placeId === placeId)) return` 的早返回，直接跳过整个 API 调用。
**Why it happens:** v5 设计中每地点只允许一条记录，所以重复 illuminate 是 no-op。
**How to avoid:** 移除该早返回，但需确保 `openSavedPointForPlaceOrStartDraft` 对"已点亮地点"的处理路径（切换到 `summaryMode = 'view'`）也相应更新，使 popup 进入"已点亮摘要 + 再记一次"视图，而不是再次触发 illuminate。
**Warning signs:** `createTravelRecord` API 从未被调用 when user clicks "再记一次"。

### Pitfall 2: importTravelRecords 去重破坏多次记录

**What goes wrong:** 当前 `importTravelRecords` 按 `placeId` 查重并跳过已有记录。多条记录模型下，用户可能本地有北京的旧记录，账号也有北京的旧记录，直接跳过会导致本地"日期未知"记录无法补充到账号。
**Why it happens:** 去重口径从"同 placeId"变为"同 placeId + 同 startDate + 同 endDate"。
**How to avoid:** 修改 `importTravelRecords` 的查重逻辑：查询时加 startDate/endDate 条件，只有三者完全相同时才跳过。由于旧记录 startDate/endDate 均为 null，null + null + placeId 三元组相同才算重复。
**Warning signs:** 首次登录导入后，同一地点出现两条日期未知的记录。

### Pitfall 3: applyAuthoritativeTravelRecords 按 placeId 合并截断多条记录

**What goes wrong:** 当前合并逻辑 `snapshotByPlaceId = new Map(records.map(r => [r.placeId, r]))` 在同一 placeId 有多条时，只保留 Map 最后一条。
**Why it happens:** Map key 是 placeId，多条记录后放会覆盖前放。
**How to avoid:** 改为按 `record.id` 合并；pending 记录的合并逻辑也相应改为基于 id 前缀判断。
**Warning signs:** 用户有 3 次北京旅行，刷新后只显示 1 次（`Map` 覆盖导致丢失）。

### Pitfall 4: displayPoints 渲染多个同 placeId marker

**What goes wrong:** 如果 `displayPoints` 不去重，北京有 3 条旅行记录，地图上就会叠加 3 个 marker，地图边界高亮逻辑也会出错（`savedBoundaryIds` 重复收集同一 boundaryId）。
**Why it happens:** `travelRecords.map(recordToDisplayPoint)` 是 1:1 映射，不感知 place 级聚合。
**How to avoid:** `displayPoints` 改为先按 placeId 取最新记录，再映射为 display point。`savedBoundaryIds` 也需同步去重（已有 `Array.from(new Set(...))`，只要 `displayPoints` 正确则自动生效）。
**Warning signs:** 地图上同一地点出现多个 marker 叠加。

### Pitfall 5: Prisma Client 未重新生成导致新字段不可见

**What goes wrong:** schema 改动后如果未运行 `prisma generate`，`@prisma/client` 的类型定义中没有 `startDate`/`endDate`，TypeScript 报错或运行时读取 undefined。
**Why it happens:** Prisma Client 是代码生成产物，不会自动热更新。
**How to avoid:** Wave 0 任务：schema 变更 → `prisma generate` → 验证 `UserTravelRecord` 类型包含新字段。
**Warning signs:** `record.startDate` TypeScript 报"属性不存在"。

### Pitfall 6: ValidationPipe `forbidNonWhitelisted` 拒绝新字段

**What goes wrong:** 当前 `CreateTravelRecordDto` 用 `forbidNonWhitelisted: true`。如果客户端发来 `startDate`/`endDate` 而 DTO 没有声明，会返回 400 Bad Request。
**Why it happens:** NestJS ValidationPipe 严格白名单模式。
**How to avoid:** 在 `CreateTravelRecordDto` 中显式声明 `startDate`/`endDate`（带 `@IsOptional()`），确保字段在白名单内。
**Warning signs:** POST /records 返回 400，body 含 `"property startDate should not exist"`。

### Pitfall 7: auth.service.ts 的 toContractTravelRecord 未同步日期字段

**What goes wrong:** `RecordsService` 和 `AuthService` 中各有一个 `toContractTravelRecord` 映射函数（代码已验证存在两处），若只改了 `records.service.ts`，`auth.service.ts` 的 bootstrap 响应仍然不包含日期字段。
**Why it happens:** 两处独立实现同一映射，未抽取为共享函数。
**How to avoid:** Phase 27 升级时同步修改两处；或抽取为共享函数（推荐）。
**Warning signs:** POST /records 返回有日期，但刷新后 bootstrap 记录无日期。

---

## Code Examples

### 已验证的现有代码结构（供规划参考）

#### records.repository.ts createTravelRecord（当前 upsert 模式，需改为 create）
```typescript
// Source: apps/server/src/modules/records/records.repository.ts [VERIFIED]
// 当前实现 — 需改为 create（不再 upsert）
async createTravelRecord(userId: string, input: CreateTravelRecordDto): Promise<UserTravelRecord> {
  return this.prisma.userTravelRecord.upsert({
    where: { userId_placeId: { userId, placeId: input.placeId } },
    update: toTravelRecordData(userId, input),
    create: toTravelRecordData(userId, input),
  })
}
// 改为:
async createTravelRecord(userId: string, input: CreateTravelRecordDto): Promise<UserTravelRecord> {
  return this.prisma.userTravelRecord.create({
    data: toTravelRecordData(userId, input),
  })
}
```

#### map-points.ts illuminate（当前短路逻辑，需移除）
```typescript
// Source: apps/web/src/stores/map-points.ts [VERIFIED]
// 当前需要移除的短路
if (travelRecords.value.some((r) => r.placeId === placeId)) {
  selectedPointId.value = placeId
  summaryMode.value = 'view'
  return   // ← 此处 return 在多次记录模型下需要移除
}
```

#### deleteTravelRecordByPlaceId（保持语义不变，D-06）
```typescript
// Source: apps/server/src/modules/records/records.repository.ts [VERIFIED]
// 此函数语义已正确（deleteMany by placeId），Phase 27 不需要改动
async deleteTravelRecordByPlaceId(userId: string, placeId: string): Promise<void> {
  await this.prisma.userTravelRecord.deleteMany({
    where: { userId, placeId },
  })
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 每地点一条旅行记录（upsert 语义） | 每次旅行一条记录（create 语义） | Phase 27 | 解锁多次去访场景，但 store 层需 place 级聚合 |
| `@@unique([userId, placeId])` | `@@index([userId, placeId])` | Phase 27 migration | 数据库不再强制唯一性，应用层负责去重语义 |
| `TravelRecord` 无日期字段 | `startDate?` / `endDate?`（nullable string） | Phase 27 contracts | Bootstrap、import、create 全链路携带日期 |
| illuminate 单次（重复调用 no-op） | illuminate 支持多次（每次新增一条记录） | Phase 27 | UI 需要区分"首次点亮"与"再记一次" |

**Deprecated/outdated:**
- `upsert` 在 `createTravelRecord` 中的用法：Phase 27 后改为 `create`，upsert 语义（幂等覆盖）与多次记录模型不兼容。
- `snapshotByPlaceId = new Map(records.map(r => [r.placeId, r]))` 在 `applyAuthoritativeTravelRecords`：Phase 27 后改为按 record id 合并。

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 字符串字典序比较对 YYYY-MM-DD 日期格式正确（`endDate >= startDate`） | Pattern 3 | 若日期含时区或格式异常，比较结果错误；但 YYYY-MM-DD 固定格式保证字典序 = 时间序，低风险 |
| A2 | `displayPoints` 按 placeId 去重取最新记录作为 marker 代表，不会破坏地图层其他逻辑 | Pattern 7 | 若 selectedPointId 与 displayPoints id 不一致，popup 选择逻辑可能失效；需验证 `selectPointById` 使用 `placeId` 而非 `id` |
| A3 | `importTravelRecords` 中 null + null 三元组去重（placeId + null startDate + null endDate）能正确防止重复旧记录 | Pitfall 2 | 若 Prisma 的 nullable 字段参与 `findMany where` 条件时行为不符合预期，需用 IS NULL 写法 |

**如果此表为空条目可信：** 以上三条均为低风险假设，A1 和 A2 可在 Wave 0 测试中立即验证，A3 通过 Prisma 文档确认 null where 条件写法即可消除。

---

## Open Questions

1. **selectedPointId 与多条记录的 activePoint 选择**
   - What we know: `activePoint = displayPoints.find(p => p.id === selectedPointId)`；`displayPoints` 改为 placeId 去重后，point.id = record.id（最新一条）。
   - What's unclear: 当用户点击"再记一次"后，新记录 id 与 selectedPointId 是否能自动同步，使 popup 保持打开状态。
   - Recommendation: 在 illuminate 成功回调后，将 selectedPointId 更新为新记录的 placeId（保持原逻辑，因 displayPoints 仍以 placeId 作为 id）。实际 `recordToDisplayPoint` 中 `id: record.placeId`（已验证），所以 selectedPointId 用 placeId 没问题。

2. **PointSummaryCard "view" 模式下 inline 日期表单的展开时机**
   - What we know: D-04 要求 popup 内闭环；D-05 要求已点亮地点默认显示摘要（N 次 + 最近日期）。
   - What's unclear: "再记一次"是立即展开表单，还是需要用户再点一次按钮？
   - Recommendation: 增加"再记一次"CTA 按钮，点击后展开内联日期表单（两步操作），避免误触。表单展开状态用本地 `ref` 管理，不入 store。

3. **importTravelRecords response 中的 mergedDuplicateCount 计数口径**
   - What we know: 当前 `mergedDuplicateCount = inputs.length - importedCount`，含义是"因重复跳过的记录数"。
   - What's unclear: 多条记录模型下，"重复"定义变为三元组，旧的 `mergedDuplicateCount` 含义是否需要更新给前端展示？
   - Recommendation: Phase 27 保持 response 结构不变，`mergedDuplicateCount` 更新为新的三元组去重口径，数字语义不变（跳过的条数）。

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 全栈运行 | ✓ | v22.22.1 [VERIFIED] | — |
| pnpm | 包管理 | ✓ | 10.33.0 [VERIFIED] | — |
| Prisma CLI | schema migration | ✓ | ^6.19.3 [VERIFIED: package.json] | — |
| PostgreSQL | 数据持久化 | 需环境变量 DATABASE_URL | — | 无（必须） |
| Vitest | 测试运行 | ✓ | 已有 [VERIFIED: vitest.config.ts] | — |

**Missing dependencies with no fallback:**
- PostgreSQL 数据库连接（DATABASE_URL）：migration 执行和 e2e 测试必须。开发环境需预先配置。

**Missing dependencies with fallback:**
- 无其他阻塞依赖。

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (web: happy-dom; server: node) |
| Config file (web) | `apps/web/vitest.config.ts` |
| Config file (server) | `apps/server/vitest.config.ts` |
| Quick run command | `pnpm --filter @trip-map/web test` 或 `pnpm --filter @trip-map/server test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRIP-01 | illuminate 带日期参数成功调用 API | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ 需扩展 |
| TRIP-01 | PointSummaryCard 展示日期表单并 emit illuminate with dates | unit | `pnpm --filter @trip-map/web test src/components/map-popup/PointSummaryCard.spec.ts` | ✅ 需扩展 |
| TRIP-01 | DTO 校验拒绝格式非法的日期字符串 | unit | `pnpm --filter @trip-map/server test src/modules/records` | ❌ Wave 0 |
| TRIP-02 | 同一 placeId 可创建第二条 trip 记录（数据库层） | integration | `pnpm --filter @trip-map/server test` | ❌ Wave 0 |
| TRIP-02 | travelRecords store 中同一 placeId 可持有多条记录 | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ 需扩展 |
| TRIP-02 | displayPoints 按 placeId 去重，不渲染重复 marker | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ 需扩展 |
| TRIP-02 | unilluminate 按 placeId 删除所有该地点记录 | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ 需扩展 |
| TRIP-03 | AuthService.bootstrap 返回包含日期字段的记录 | unit | `pnpm --filter @trip-map/server test src/modules/auth/auth.service.spec.ts` | ✅ 需扩展 |
| TRIP-03 | applyAuthoritativeTravelRecords 按 record.id 合并多条记录 | unit | `pnpm --filter @trip-map/web test src/stores/map-points.spec.ts` | ✅ 需扩展 |
| TRIP-03 | legacy-point-storage normalizeLegacyTravelRecord 输出 startDate: null | unit | `pnpm --filter @trip-map/web test src/services/legacy-point-storage.spec.ts` | ✅ 需扩展 |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web test` 或 `pnpm --filter @trip-map/server test`（取决于变更层）
- **Per wave merge:** `pnpm test`（全量）
- **Phase gate:** `pnpm test` 全绿 + `pnpm typecheck` 通过

### Wave 0 Gaps

- [ ] `apps/server/src/modules/records/records.repository.spec.ts` — 覆盖 TRIP-02 数据库层多条记录创建
- [ ] `apps/server/src/modules/records/records.service.spec.ts` — 覆盖 DTO 日期校验 (TRIP-01) 和 importTravel 去重口径 (TRIP-02)
- [ ] `apps/server/src/modules/auth/auth.service.spec.ts` 扩展 — bootstrap 返回日期字段 (TRIP-03)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | 不变，Phase 27 不修改认证 |
| V3 Session Management | no | 不变 |
| V4 Access Control | yes | `@UseGuards(SessionAuthGuard)` 已有，POST /records 受保护 |
| V5 Input Validation | yes | class-validator DTO: `@Matches` 验证日期格式；服务端校验 endDate >= startDate |
| V6 Cryptography | no | 不涉及加密 |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 非法日期格式注入 (e.g., `../etc/passwd`) | Tampering | `@Matches(/^\d{4}-\d{2}-\d{2}$/)` + `forbidNonWhitelisted: true` |
| endDate < startDate 语义错误 | Tampering | 服务层显式校验，返回 BadRequestException |
| 未授权写入他人旅行记录 | Elevation of Privilege | `SessionAuthGuard` + `CurrentUser` decorator 绑定 userId，不从 body 读 userId |
| 大量 import 导致记录膨胀 | DoS | [ASSUMED] 当前无 import 记录数限制；Phase 27 应在 `ImportTravelRecordsDto` 加 `@ArrayMaxSize` 约束 |

---

## Project Constraints (from CLAUDE.md)

| Directive | Category | Impact on Phase 27 |
|-----------|----------|---------------------|
| 始终使用中文回复 | 规范 | 代码注释可用中文，字段名保持英文 |
| Composition API + `<script setup lang="ts">` | Vue | PointSummaryCard、TripDateForm 必须用 Composition API |
| Pinia 状态管理 | 前端架构 | 所有新状态入 map-points store，不用 Vue 2 pattern |
| Prisma ORM | 后端数据层 | schema 变更通过 prisma migrate，不手写 raw SQL |
| `class-validator` + `class-transformer` | 后端校验 | 日期字段校验通过 DTO 装饰器，不自定义 pipe |
| 不可变模式（创建新对象，不 mutate） | 编码风格 | store 中 `travelRecords.value = [...]` 已遵循；新增逻辑保持 spread 模式 |
| 函数体 < 50 行，文件 < 800 行 | 编码风格 | TripDateForm 独立为子组件，不内联到 PointSummaryCard 导致文件过大 |
| Vitest (`vitest run`) | 测试 | 所有新功能先写测试（TDD） |
| Commit message: `<type>(<scope>): <desc>` | Git | scope 用 `27-xx`（plan 编号）或 `contracts/server/web` |

---

## Sources

### Primary (HIGH confidence)
- `apps/server/prisma/schema.prisma` — UserTravelRecord 现有结构（含 `@@unique([userId, placeId])`）[VERIFIED]
- `packages/contracts/src/records.ts` — TravelRecord / CreateTravelRecordRequest 现有接口 [VERIFIED]
- `apps/web/src/stores/map-points.ts` — illuminate / unilluminate / applyAuthoritativeTravelRecords 现有逻辑 [VERIFIED]
- `apps/server/src/modules/records/records.repository.ts` — upsert 现有实现 [VERIFIED]
- `apps/server/src/modules/auth/auth.service.ts` — bootstrap + toContractTravelRecord 现有实现 [VERIFIED]
- `apps/web/src/services/legacy-point-storage.ts` — normalizeLegacyTravelRecord 现有实现 [VERIFIED]
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — illuminate emit 现有 UI 结构 [VERIFIED]
- `.planning/phases/27-multi-visit-record-foundation/27-CONTEXT.md` — 用户决策 D-01~D-09 [VERIFIED]
- `apps/server/package.json` — Prisma 版本 ^6.19.3 [VERIFIED]
- `.planning/config.json` — nyquist_validation: true [VERIFIED]

### Secondary (MEDIUM confidence)
- HTML `<input type="date">` 原生 YYYY-MM-DD 支持 — MDN 文档标准，广泛支持 [CITED: developer.mozilla.org]
- Prisma `deleteMany` + nullable 字段 `where` 条件行为 — Prisma 6 文档标准 [CITED: prisma.io/docs]

### Tertiary (LOW confidence)
- `@ArrayMaxSize` 用于 import 记录数限制 — class-validator 标准装饰器，未在本项目实际验证 [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 全部为已有依赖，版本已验证
- Architecture: HIGH — 基于现有代码结构直接推导，变更点明确
- Pitfalls: HIGH — 全部来自实际代码库中已验证的具体逻辑点

**Research date:** 2026-04-20
**Valid until:** 2026-05-20（Prisma 6 API 稳定，30 天内有效）
