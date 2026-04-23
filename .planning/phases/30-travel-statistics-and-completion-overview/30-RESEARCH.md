# Phase 30: Travel Statistics & Completion Overview - Research

**Researched:** 2026-04-23
**Domain:** NestJS stats endpoint + Vue 3 statistics page + contracts extension
**Confidence:** HIGH

## Summary

Phase 30 是 v6.0 的最后一个阶段，目标是在独立的 `/statistics` 页面展示两个核心指标：总旅行次数（每条 `UserTravelRecord` 计一次）和已去过地点数（按 `placeId` 去重）。UI-SPEC 已批准，CONTEXT.md 决策已锁定，代码库模式高度一致，实现路径清晰。

后端需要新增一个 `GET /stats` 端点，在 `RecordsModule` 内扩展（不新建 module），通过 Prisma 的 `_count` + `groupBy` 或两条简单查询计算统计数据，返回 `TravelStatsResponse` 合约类型。前端需要新增 `StatisticsPageView.vue`（镜像 `TimelinePageView.vue` 的四状态结构）、`StatCard.vue` 组件、`/statistics` 路由、以及一个调用 `/stats` 的 API 服务函数。导航入口按钮加在用户账号面板中，与 Phase 29 的"时间轴"按钮并列。

D-05 已取消完成度百分比，STAT-02 的实际实现范围已收窄为"已去过地点数"（唯一 placeId 计数），与 STAT-01 的总旅行次数形成对比。D-07 明确要求同一地点多次去访只计一次唯一地点。

**Primary recommendation:** 在 `RecordsModule` 内扩展 stats 端点，用两条 Prisma 查询（`count` + `findMany distinct`）实现，不引入新 module；前端新建独立 Pinia store `useStatsStore` 管理 `/stats` 请求状态，与 `useMapPointsStore` 解耦。

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 统计展示在独立的 `/statistics` 页面，不集成到时间轴。
- **D-02:** 页面独立于 timeline，用户需要单独导航到达。
- **D-03:** 统计数据由后端 `/stats` API 端点计算返回，不在前端 travelRecords 上直接计算。
- **D-04:** 统计页面使用 Kawaii 风格卡片，与 timeline 页面视觉一致（cream/white gradient, rounded corners, pill badges）。
- **D-05:** 国家/地区完成度百分比功能已取消。不再需要考虑 denominator 口径。
- **D-06:** 基础统计指标包括：总旅行次数、已去过地点数。
- **D-07:** 同一地点多次去访：正确累加旅行次数，但不重复计算唯一地点数。

### Claude's Discretion
无明确标注的 discretion 项。

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STAT-01 | 用户可以查看基础旅行统计，包括总旅行次数、已去过地点数和已去过国家/地区数 | 后端 `_count` 查询 + `findMany distinct placeId` 实现；UI-SPEC 定义了两张 StatCard |
| STAT-02 | 用户可以查看国家/地区完成度 | D-05 已取消完成度百分比；实际实现为"已去过地点数"（唯一 placeId 计数），满足 STAT-02 的展示意图 |
| STAT-03 | 当同一地点存在多次旅行记录时，统计会正确区分"总旅行次数"和"唯一地点 / 完成度" | 后端查询分两条：`count(*)` 得总次数，`count(distinct placeId)` 得唯一地点数；D-07 锁定此语义 |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 统计计算（总次数 / 唯一地点数） | API / Backend | — | D-03 锁定：不在前端计算，由后端 `/stats` 端点负责 |
| 统计数据持久化 | Database / Storage | — | 直接查询 `UserTravelRecord` 表，无需新表 |
| 统计页面渲染 | Frontend (Vue SPA) | — | `/statistics` 路由，`StatisticsPageView.vue` |
| 导航入口按钮 | Frontend (Vue SPA) | — | 用户账号面板，与 Phase 29 "时间轴"按钮并列 |
| 认证状态判断 | Frontend (Vue SPA) | API / Backend | `useAuthSessionStore` 提供 status，`SessionAuthGuard` 保护端点 |
| 合约类型定义 | packages/contracts | — | `TravelStatsResponse` 新增到 contracts，前后端共享 |

---

## Standard Stack

### Core（已在项目中使用，无需新增依赖）

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| NestJS | 11.x | 后端框架，Controller/Service/Module 模式 | 项目已用，`RecordsModule` 扩展即可 |
| Prisma | 6.x | ORM，`count` + `findMany` 查询 | 项目已用，`UserTravelRecord` 表已存在 |
| Vue 3 | 3.x | 前端框架，`<script setup>` | 项目已用 |
| Pinia | 2.x | 状态管理，新建 `useStatsStore` | 项目已用，`useMapPointsStore` 为参考 |
| `@trip-map/contracts` | workspace | 共享类型，新增 `TravelStatsResponse` | 项目已用，`records.ts` 为参考 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `class-validator` | 已安装 | DTO 验证 | stats 端点无 body，不需要新 DTO |
| Vitest | 已安装 | 单元测试 | `stats.service.spec.ts` 测试统计逻辑 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 后端 `/stats` 端点 | 前端从 `travelRecords` 计算 | D-03 锁定后端计算；前端计算会在 bootstrap 前无数据时出错 |
| 新建 `StatsModule` | 在 `RecordsModule` 内扩展 | 统计数据来源是 `UserTravelRecord`，与 records 高度内聚；新 module 增加复杂度无收益 |
| 独立 `useStatsStore` | 复用 `useMapPointsStore` | stats 有独立的 loading/error 状态，解耦更清晰 |

**Installation:** 无需新增依赖。

---

## Architecture Patterns

### System Architecture Diagram

```
用户导航到 /statistics
        │
        ▼
StatisticsPageView.vue
  ├── useAuthSessionStore (status: restoring/anonymous/authenticated)
  │         │
  │    [restoring] → skeleton UI
  │    [anonymous] → 登录提示 + CTA
  │    [authenticated]
  │         │
  │         ▼
  │   useStatsStore.fetchStats()
  │         │
  │    [loading] → skeleton
  │    [error]   → error panel + retry
  │    [success] → StatCard × 2
  │
  └── StatCard.vue (totalTrips) + StatCard.vue (uniquePlaces)

useStatsStore
  └── GET /stats (SessionAuthGuard)
        │
        ▼
  RecordsController.getStats()
        │
        ▼
  RecordsService.getStats(userId)
        │
        ├── prisma.userTravelRecord.count({ where: { userId } })
        │     → totalTrips: number
        │
        └── prisma.userTravelRecord.findMany({
              where: { userId },
              select: { placeId: true },
              distinct: ['placeId']
            })
              → uniquePlaces: number (array.length)
```

### Recommended Project Structure

```
packages/contracts/src/
└── stats.ts                    # TravelStatsResponse 接口（新增）

apps/server/src/modules/records/
├── records.controller.ts       # 新增 GET /stats handler
├── records.service.ts          # 新增 getStats(userId) 方法
├── records.repository.ts       # 新增 getTravelStats(userId) 方法
└── records.service.spec.ts     # 新增 getStats 测试用例

apps/web/src/
├── services/api/stats.ts       # fetchStats() API 函数（新文件）
├── stores/stats.ts             # useStatsStore（新文件）
├── components/statistics/
│   └── StatCard.vue            # 单指标卡片组件（新文件）
├── views/
│   └── StatisticsPageView.vue  # 统计页面（新文件）
└── router/index.ts             # 新增 /statistics 路由
```

### Pattern 1: 后端 stats 查询（两条 Prisma 查询）

**What:** 用 `count` 得总旅行次数，用 `findMany + distinct` 得唯一地点数。
**When to use:** 统计数据需要区分"总次数"和"唯一地点"时。

```typescript
// Source: Prisma docs — count + findMany distinct [ASSUMED: pattern verified against Prisma 6 API]
async getTravelStats(userId: string): Promise<{ totalTrips: number; uniquePlaces: number }> {
  const [totalTrips, uniquePlaceRecords] = await Promise.all([
    this.prisma.userTravelRecord.count({ where: { userId } }),
    this.prisma.userTravelRecord.findMany({
      where: { userId },
      select: { placeId: true },
      distinct: ['placeId'],
    }),
  ])
  return { totalTrips, uniquePlaces: uniquePlaceRecords.length }
}
```

### Pattern 2: 前端 useStatsStore（镜像 useMapPointsStore 模式）

**What:** 独立 Pinia store，管理 `/stats` 请求的 loading/error/data 状态。
**When to use:** 页面级数据获取，需要独立 loading 状态时。

```typescript
// Source: 项目现有 useMapPointsStore 模式 [VERIFIED: apps/web/src/stores/map-points.ts]
export const useStatsStore = defineStore('stats', () => {
  const stats = shallowRef<TravelStatsResponse | null>(null)
  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  async function fetchStats() {
    isLoading.value = true
    error.value = null
    try {
      stats.value = await apiFetchStats()
    } catch {
      error.value = 'fetch-failed'
    } finally {
      isLoading.value = false
    }
  }

  return { stats, isLoading, error, fetchStats }
})
```

### Pattern 3: StatisticsPageView 四状态结构

**What:** 镜像 `TimelinePageView.vue` 的 isRestoring / shouldShowAnonymousState / shouldShowEmptyState / shouldShowStats 四状态。
**When to use:** 所有需要认证保护的页面视图。

```typescript
// Source: [VERIFIED: apps/web/src/views/TimelinePageView.vue]
const isRestoring = computed(() => status.value === 'restoring')
const shouldShowAnonymousState = computed(
  () => status.value !== 'authenticated' || currentUser.value === null,
)
const shouldShowEmptyState = computed(
  () => status.value === 'authenticated' && (stats.value?.totalTrips ?? 0) === 0,
)
const shouldShowStats = computed(
  () => status.value === 'authenticated' && (stats.value?.totalTrips ?? 0) > 0,
)
```

### Anti-Patterns to Avoid

- **前端直接从 travelRecords 计算统计：** D-03 明确禁止。`travelRecords` 在 bootstrap 前为空，会导致统计短暂显示 0。
- **新建 StatsModule：** 统计数据来源是 `UserTravelRecord`，与 `RecordsModule` 高度内聚，新 module 增加无谓复杂度。
- **在 `useMapPointsStore` 内添加 stats 状态：** stats 有独立的 fetch 生命周期，混入会污染 map-points store 的职责边界。
- **在 contracts 中复用 `TravelRecord[]` 计算统计：** 应新增 `TravelStatsResponse` 接口，不依赖前端对 records 数组的二次处理。

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 唯一 placeId 计数 | 前端 Set 去重 | Prisma `findMany distinct` | D-03 锁定后端计算；数据库层去重更准确 |
| 认证保护 | 手写 session 检查 | `SessionAuthGuard` (已有) | 项目已有 guard，直接复用 |
| 并发查询 | 串行 await | `Promise.all([count, findMany])` | 两条查询无依赖关系，并发执行减少延迟 |

**Key insight:** 统计逻辑极简（两条查询），复杂度在于正确区分"总次数"和"唯一地点"的语义，而非计算本身。

---

## Common Pitfalls

### Pitfall 1: empty state 判断依赖 stats.totalTrips 而非 travelRecords.length

**What goes wrong:** 如果 `shouldShowEmptyState` 依赖 `travelRecords.value.length === 0`（来自 `useMapPointsStore`），而 stats 尚未 fetch，会出现状态不一致。
**Why it happens:** `useMapPointsStore` 的 `travelRecords` 在 bootstrap 时填充，`useStatsStore` 的 `stats` 需要单独 fetch。
**How to avoid:** `shouldShowEmptyState` 基于 `stats.value?.totalTrips === 0`（stats fetch 完成后），或在 `onMounted` 时触发 `fetchStats()`，在 stats 未加载时显示 skeleton。
**Warning signs:** 页面短暂显示 empty state 后跳转到 populated state。

### Pitfall 2: /stats 端点未加 SessionAuthGuard

**What goes wrong:** 未认证用户可以查询任意 userId 的统计数据（如果 userId 从 token 以外的地方传入）。
**Why it happens:** 忘记在新 handler 上加 `@UseGuards(SessionAuthGuard)`。
**How to avoid:** 参考 `RecordsController` 中所有需要认证的 handler，均有 `@UseGuards(SessionAuthGuard)` 装饰器。
**Warning signs:** 未登录状态下 `/stats` 返回 200 而非 401。

### Pitfall 3: contracts 修改后未重新 build

**What goes wrong:** 前端引用 `TravelStatsResponse` 时 TypeScript 报找不到类型。
**Why it happens:** `packages/contracts` 是编译产物，修改 `src/` 后需要 `pnpm --filter @trip-map/contracts build`。
**How to avoid:** 在 contracts 新增 `stats.ts` 并在 `index.ts` re-export 后，立即执行 contracts build。
**Warning signs:** `tsc` 报 `Module '@trip-map/contracts' has no exported member 'TravelStatsResponse'`。

### Pitfall 4: 导航入口按钮位置错误

**What goes wrong:** "查看统计"按钮加在错误的组件中，与 Phase 29 的"时间轴"按钮不在同一面板。
**Why it happens:** Phase 29 的时间轴入口在用户账号面板（点击用户名后展开），需要找到正确的组件文件。
**How to avoid:** 先定位 Phase 29 添加"时间轴"按钮的组件，在同一位置添加"查看统计"按钮。
**Warning signs:** 按钮出现在地图主界面而非账号面板中。

---

## Code Examples

### contracts/src/stats.ts（新文件）

```typescript
// Source: 参考 packages/contracts/src/records.ts 模式 [VERIFIED]
export interface TravelStatsResponse {
  totalTrips: number
  uniquePlaces: number
}
```

### RecordsController GET /stats

```typescript
// Source: 参考 RecordsController 现有 handler 模式 [VERIFIED: apps/server/src/modules/records/records.controller.ts]
@Get('stats')
@ApiOperation({ summary: '获取旅行统计' })
@ApiOkResponse()
@UseGuards(SessionAuthGuard)
async getStats(
  @CurrentUser() user: AuthUser,
): Promise<TravelStatsResponse> {
  return this.recordsService.getStats(user.id)
}
```

### StatCard.vue props 接口

```typescript
// Source: UI-SPEC StatCard Layout Contract [VERIFIED: 30-UI-SPEC.md]
interface Props {
  label: string       // e.g. '总旅行次数'
  value: number       // e.g. 42
  unit: string        // e.g. '次旅行'
  gradient: string    // CSS gradient string
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 前端从 records 数组计算统计 | 后端 `/stats` 端点计算 | D-03 (Phase 30 设计) | 统计逻辑集中在后端，前端无需维护计算逻辑 |
| 完成度百分比（denominator 口径） | 已取消（D-05） | Phase 30 讨论阶段 | 简化实现，只需两个绝对数值指标 |

**Deprecated/outdated:**
- STAT-02 原始描述中的"国家/地区完成度"：D-05 取消了百分比，实际实现为"已去过地点数"（唯一 placeId 计数）。

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prisma 6 支持 `findMany` 的 `distinct` 参数用于字段级去重 | Architecture Patterns | 需改用 `groupBy` 或原生 SQL；逻辑等价，影响小 |
| A2 | 导航入口"查看统计"按钮所在组件与 Phase 29"时间轴"按钮在同一文件 | Common Pitfalls | 需要在实现时定位具体组件文件 |

---

## Open Questions

1. **导航入口按钮的具体组件文件**
   - What we know: Phase 29 在用户账号面板添加了"时间轴"按钮，路由到 `/timeline`
   - What's unclear: 该按钮在哪个具体组件文件中（未在本次研究中读取）
   - Recommendation: 规划时将"定位并修改账号面板组件"作为独立任务，实现前先 grep `RouterLink` + `timeline`

---

## Environment Availability

Step 2.6: SKIPPED（本阶段为纯代码变更，无新增外部依赖；所有依赖已在 Phase 27-29 中验证可用）

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `apps/server/vitest.config.ts` / `apps/web/vitest.config.ts` |
| Quick run command | `pnpm --filter @trip-map/server test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | `getStats` 返回正确的 `totalTrips` 和 `uniquePlaces` | unit | `pnpm --filter @trip-map/server test` | ❌ Wave 0 |
| STAT-03 | 同一 placeId 多条记录：totalTrips 累加，uniquePlaces 不重复计数 | unit | `pnpm --filter @trip-map/server test` | ❌ Wave 0 |
| STAT-01 | `StatCard.vue` 正确渲染 label/value/unit | unit | `pnpm --filter @trip-map/web test` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/server test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/server/src/modules/records/records.service.spec.ts` — 新增 `getStats` 测试用例（文件已存在，追加用例）
- [ ] `apps/web/src/components/statistics/StatCard.spec.ts` — StatCard 渲染测试（新文件）

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `SessionAuthGuard` — `/stats` 端点必须加 guard |
| V3 Session Management | no | 无新 session 逻辑 |
| V4 Access Control | yes | `@CurrentUser()` 从 session 取 userId，不接受客户端传入 userId |
| V5 Input Validation | no | GET 端点无 body，无需 DTO 验证 |
| V6 Cryptography | no | 无新加密需求 |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 未认证访问 /stats | Elevation of Privilege | `@UseGuards(SessionAuthGuard)` |
| 客户端伪造 userId 查询他人统计 | Information Disclosure | `@CurrentUser()` 从 session 取 userId，不从请求参数读取 |

---

## Sources

### Primary (HIGH confidence)
- `apps/server/src/modules/records/records.controller.ts` — NestJS controller 模式，guard 用法
- `apps/server/src/modules/records/records.service.ts` — service 方法模式
- `apps/server/src/modules/records/records.repository.ts` — Prisma 查询模式
- `apps/web/src/views/TimelinePageView.vue` — 四状态页面结构
- `apps/web/src/stores/map-points.ts` — Pinia store 模式
- `packages/contracts/src/records.ts` — contracts 接口定义模式
- `.planning/phases/30-travel-statistics-and-completion-overview/30-CONTEXT.md` — 锁定决策
- `.planning/phases/30-travel-statistics-and-completion-overview/30-UI-SPEC.md` — UI 合约

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — STAT-01/02/03 正式定义

### Tertiary (LOW confidence)
- 无

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 全部复用现有依赖，无新引入
- Architecture: HIGH — 基于已验证的项目模式（RecordsModule、TimelinePageView）
- Pitfalls: HIGH — 来自对现有代码库的直接分析

**Research date:** 2026-04-23
**Valid until:** 2026-05-23（稳定技术栈，30 天有效）
