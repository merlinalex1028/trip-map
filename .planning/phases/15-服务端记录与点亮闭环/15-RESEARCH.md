# Phase 15: 服务端记录与点亮闭环 - Research

**Researched:** 2026-03-31
**Domain:** NestJS CRUD API + Prisma schema migration + Vue 3 Pinia 乐观更新 + Leaflet 高亮同步
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `PointPreviewDrawer.vue` 连同所有相关代码（drawerMode、EditablePointSnapshot、toggleActivePointFeatured 等）全部删除，不保留只读版本。
- **D-02:** Popup 成为唯一交互表面：地点基本信息（displayName、typeLabel、subtitle）+ 点亮按钮。无名称输入、无备注输入、无编辑表单。
- **D-03:** 候选确认链路（canonical resolve 歧义时的候选列表）继续保留在 Popup 内。
- **D-04:** 点亮按钮位于 Popup 地点标题右侧，文案：未点亮 **"点亮"**，已点亮 **"已点亮"**。
- **D-05:** 点击"已点亮"触发取消点亮（删除记录），无需确认对话框。
- **D-06:** 按钮状态色区分已点亮（高亮色，与地图边界高亮色系呼应）和未点亮（次要色）。
- **D-07:** 点亮 = 创建 TravelRecord；取消点亮 = 删除 TravelRecord。不存在"有记录但未点亮"的中间状态。
- **D-08:** `TravelRecord` 模型只包含：`placeId`、`boundaryId`、`placeKind`、`datasetVersion`、`displayName`、`subtitle`。无 `isFeatured`、无用户自定义名称、无备注字段。
- **D-09:** 数据库中的所有 `TravelRecord` 行在地图上都应高亮。
- **D-10:** 点击点亮/取消点亮后**立即**切换按钮状态 + 地图边界高亮，不等待 API 返回。
- **D-11:** API 成功时静默确认（不需要 toast）；**失败时回滚 UI 状态 + 显示 toast 错误提示**。
- **D-12:** 乐观更新期间按钮短暂禁用（防止重复点击）。
- **D-13:** v3.0 启动后，`localStorage` 旅行数据和 seed 点位全部静默删除/忽略，不读取、不迁移、不提示用户。
- **D-14:** 地图首次加载时，如果 server 无记录则展示空白地图，无引导文案，无空状态插画。
- **D-15:** `point-storage.ts`、`seed-points.ts` 导入引用从前端代码中完全移除。

### Claude's Discretion

- `TravelRecord` API 的具体路由设计（`POST /records`、`DELETE /records/:placeId` 还是其他形态）
- Prisma schema 中 `TravelRecord` 模型的精确字段命名与索引策略
- 前端 Pinia store 的重构方式（是否保留 `map-points.ts` 结构还是拆分）
- Popup 内点亮按钮的具体尺寸、圆角、间距等视觉细节
- 取消点亮失败时 toast 的文案措辞
- API 调用的具体错误处理（网络超时、4xx/5xx 等分类处理方式）

### Deferred Ideas (OUT OF SCOPE)

- 旅行记录添加自定义名称、备注、访问日期字段
- 删除前确认对话框
- 多设备同步、导出、分享（SYNC-01, SYNC-02）
- 账号/登录体系（AUTH-01）
- 记录列表页（查看所有已点亮地点）
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| API-01 | 旅行记录读取、创建、删除通过 server API 持久化 | NestJS CRUD 路由 + Prisma TravelRecord 模型 + 前端 API 调用层 |
| API-02 | 点亮/取消点亮以 canonical `placeId` 为目标 | placeId 作为 DELETE 路由参数和 GET 查询键 |
| API-05 | v3.0 不再读取 localStorage 旅行数据 | map-points.ts 重构，移除 bootstrapPoints/point-storage/seed-points |
| MAP-07 | 用户点亮或取消点亮后地图边界样式立即同步 | savedBoundaryIds 乐观更新驱动 useGeoJsonLayers.refreshStyles() |
| UIX-02 | 地点面板标题右侧提供明确"点亮/取消点亮"按钮，不用 checkbox | PointSummaryCard 标题行按钮重构 |
| UIX-03 | 点击后立即看到按钮文案、状态色和地图边界高亮同步变化 | 乐观更新 + savedBoundaryIds 修改即触发 useGeoJsonLayers watch |
| UIX-05 | popup、地图高亮与 API 返回状态在成功/失败/加载中三种情况下保持一致反馈 | 加载态禁用按钮 + 失败时回滚 + toast |
</phase_requirements>

---

## Summary

Phase 15 是 v3.0 的收口阶段，目标是把旅行记录的读写链路从 `localStorage` + `seed-points` 彻底迁移到 `server` API，同时把交互表面从"Popup + Drawer"简化为"仅 Popup + 点亮按钮"。

**后端工作量**：从已有的 `SmokeRecord` smoke 模型演进到正式 `TravelRecord` 模型。需要写一次 Prisma migration（添加 `TravelRecord` 表），把 `RecordsController` 从单个 `POST /records/smoke` 演进为 `GET /records`、`POST /records`、`DELETE /records/:placeId` 三条路由，并更新 contracts 包定义。`SmokeRecord` 可以保留也可以删除，建议保留以免破坏现有 migration 历史，但将其功能收缩为内部 smoke 用途。

**前端工作量**：`map-points.ts` 是核心重构对象——移除 localStorage/seed 逻辑，改为 async `bootstrapFromApi()`；新增乐观更新 `illuminate(placeId, summary)` 和 `unilluminate(placeId)` 动作。`PointSummaryCard.vue` 重构标题行以容纳点亮按钮，删除 footer 中原有的多按钮操作区。`PointPreviewDrawer.vue` 及相关类型全部删除。`LeafletMapStage.vue` 接线清理。

**乐观更新关键洞察**：`useGeoJsonLayers.ts` 已经通过 `watch(savedBoundaryIds, refreshStyles)` 自动响应 `savedBoundaryIds` 的变化。因此乐观更新的实现只需要在 store action 中同步修改 `savedBoundaryIds`（添加或移除一个 `boundaryId`），无需直接调用 `refreshStyles`——响应链已经存在。

**Primary recommendation:** 按后端 schema → contracts → 后端 controller/service → 前端 store 重构 → 前端 UI 的顺序分三个 plan 交付，确保每步可独立验证。

---

## Standard Stack

### Core（已在项目中）

| 库 | 版本 | 用途 | 说明 |
|---|---|---|---|
| NestJS | 11.x | 后端路由框架 | 已在用，RecordsModule 已存在 |
| Prisma | 6.x | ORM + migration | 已在用，需新增 TravelRecord 模型 |
| class-validator + class-transformer | 已有 | DTO 验证 | 已在 CreateSmokeRecordDto 中使用，复用模式 |
| Pinia | 已有 | 前端状态管理 | map-points.ts 的重构基础 |
| Vue 3 Composition API | 已有 | 前端组件 | `<script setup lang="ts">` 统一风格 |
| Vitest | 已有 | 测试框架 | `vitest run` 非 watch 模式 |

### 无需新增依赖

Phase 15 不引入任何新 npm 包。`fetch` 原生 API 已足够，无需 axios/ofetch。toast 提示使用现有 `useMapUiStore` 的 `setInteractionNotice` 机制（已存在），或新增一个极简 toast ref——但后者属于 Claude's Discretion。

---

## Architecture Patterns

### 推荐项目结构变化

```
apps/server/
  prisma/
    schema.prisma                  ← 新增 TravelRecord 模型，保留 SmokeRecord
    migrations/
      20260330..._init_smoke/      ← 已有
      20260331..._add_travel_record/  ← 新建 migration
  src/modules/records/
    dto/
      create-smoke-record.dto.ts   ← 保留（smoke 用途）
      create-travel-record.dto.ts  ← 新建
    records.controller.ts          ← 添加 GET / POST / DELETE travel endpoints
    records.service.ts             ← 添加 travel CRUD 方法
    records.repository.ts          ← 添加 TravelRecord CRUD 方法

packages/contracts/src/
  records.ts                       ← 从 smoke 契约升级，新增 TravelRecord 类型
  index.ts                         ← re-export（如有新增类型）

apps/web/src/
  stores/
    map-points.ts                  ← 核心重构：移除 localStorage/seed，加入 API bootstrap + 乐观更新
  services/api/
    records.ts                     ← 新建：GET/POST/DELETE records API 调用函数
  components/
    map-popup/PointSummaryCard.vue ← 标题行新增点亮按钮，移除 footer 多操作按钮
    map-popup/MapContextPopup.vue  ← 移除 openDetail/editPoint emit，简化事件接口
    LeafletMapStage.vue            ← 移除 Drawer 引用，移除 openDrawerView/enterEditMode
    PointPreviewDrawer.vue         ← 完全删除
    PointPreviewDrawer.spec.ts     ← 完全删除
```

### Pattern 1: TravelRecord 极简 Prisma 模型

**What:** `TravelRecord` 只记录 canonical 地点身份，不含用户自定义字段。`placeId` 唯一索引防止重复点亮。

**When to use:** 点亮即创建，取消点亮即删除——没有 update 操作。

```typescript
// apps/server/prisma/schema.prisma
model TravelRecord {
  id             String   @id @default(cuid())
  placeId        String   @unique          // canonical placeId — 防止重复
  boundaryId     String
  placeKind      String                    // 'CN_ADMIN' | 'OVERSEAS_ADMIN1'
  datasetVersion String
  displayName    String
  subtitle       String
  createdAt      DateTime @default(now())

  @@index([placeId])
}
```

**注意：** `@unique` 约束确保同一地点不能重复点亮，同时也是 `DELETE /records/:placeId` 的查找键。如果前端乐观更新后 API 返回 409（已存在），说明 UI 状态已是正确的点亮态，可当作成功处理。

### Pattern 2: 路由设计（Claude's Discretion 推荐）

```
GET    /records          → 返回所有 TravelRecord[]（初始化用）
POST   /records          → body: CreateTravelRecordRequest → 创建记录（点亮）
DELETE /records/:placeId → 删除指定 placeId 的记录（取消点亮）
```

**理由：** `placeId` 是自然键（canonical 唯一标识），用它做 DELETE 参数比用内部 `id` 更语义清晰，且前端不需要先 GET 再 DELETE 两次请求。

### Pattern 3: 前端乐观更新模式

**What:** 点击点亮按钮后立即修改 Pinia store 中的 `savedBoundaryIds`，API 请求在后台执行。

**关键洞察：** `useGeoJsonLayers.ts` 已有：
```typescript
watch(savedBoundaryIds, () => {
  refreshStyles()
})
```
因此 store 中只需操作 `savedBoundaryIds`，地图高亮会自动同步——**不需要手动调用 refreshStyles**。

**乐观更新 store action 骨架（概念）：**
```typescript
// 在 useMapPointsStore 中
async function illuminate(summary: CanonicalPlaceSummary) {
  const { placeId, boundaryId } = summary

  // 1. 乐观更新：立即加入 savedBoundaryIds
  const prev = savedBoundaryIds.value  // 保存快照以备回滚
  travelRecords.value = [...travelRecords.value, { placeId, boundaryId, ...summary }]

  // 2. 禁用按钮（通过 pendingPlaceIds set）
  pendingPlaceIds.value = new Set([...pendingPlaceIds.value, placeId])

  try {
    await createTravelRecord(summary)       // POST /records
  } catch {
    // 3. 失败回滚
    travelRecords.value = travelRecords.value.filter(r => r.placeId !== placeId)
    showErrorToast('点亮失败，请重试')
  } finally {
    // 4. 解除按钮禁用
    const next = new Set(pendingPlaceIds.value)
    next.delete(placeId)
    pendingPlaceIds.value = next
  }
}
```

**savedBoundaryIds 应变为 computed，基于 travelRecords：**
```typescript
const savedBoundaryIds = computed(() =>
  Array.from(new Set(travelRecords.value.map(r => r.boundaryId).filter(Boolean)))
)
```
这样乐观更新 `travelRecords.value` 时，`savedBoundaryIds` 自动变化，`useGeoJsonLayers` 的 watch 随即触发 `refreshStyles()`。

### Pattern 4: App bootstrap 改为 async API 初始化

```typescript
// map-points.ts 中的新 bootstrapFromApi（替换旧 bootstrapPoints）
async function bootstrapFromApi() {
  if (hasBootstrapped.value) return
  hasBootstrapped.value = true

  try {
    const records = await fetchTravelRecords()   // GET /records
    travelRecords.value = records
  } catch {
    travelRecords.value = []
    // 静默失败——空地图直接呈现
  }
}
```

调用时机：在 `LeafletMapStage.vue` 的 `onMounted` 或 `watch(isReady, ...)` 中触发，确保地图准备好后再加载已点亮边界并 preload shards。

### Pattern 5: contracts 升级

```typescript
// packages/contracts/src/records.ts

export interface TravelRecord {
  id: string
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
  displayName: string
  subtitle: string
  createdAt: string
}

export interface CreateTravelRecordRequest {
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
  displayName: string
  subtitle: string
}

// SmokeRecord 类型保留，避免破坏现有 smoke endpoint
```

### Anti-Patterns to Avoid

- **Anti-pattern：手动调用 refreshStyles**：`useGeoJsonLayers` 的 watch 已经自动处理，重复调用会产生多余渲染。
- **Anti-pattern：在 Vue 组件内直接发 fetch 请求**：所有 API 调用应放在 `services/api/records.ts` 或 store action 中，不在 `.vue` 文件中内联。
- **Anti-pattern：保留 PersistedMapPoint/SeedPointOverride 类型**：Phase 15 后这些类型不再有意义，应删除以免类型混乱。
- **Anti-pattern：drawerMode 残留**：即使 Drawer 删除了，如果 `drawerMode` shallowRef 还在，`LeafletMapStage` 中的 `isSummarySurfaceVisible` 计算逻辑会失效（它依赖 `drawerMode === null`）。删除 Drawer 时必须同步清理 `drawerMode` 相关判断。
- **Anti-pattern：fetch TravelRecords 过早**：必须等 Pinia store bootstrap 完成后再 preload boundary shards，避免空 `savedBoundaryIds` 触发无效的 shard 加载。

---

## Don't Hand-Roll

| 问题 | 不要自己写 | 用已有机制 | 理由 |
|---|---|---|---|
| 地图高亮刷新 | 手动操控 Leaflet layer styles | `useGeoJsonLayers` 的 `watch(savedBoundaryIds)` | 已经自动响应，触发一次即全量刷新 |
| 乐观更新的 UI 快照 | 复杂的 undo stack | shallowRef 快照 + try/catch 回滚 | 只有两个操作（点亮/取消），状态简单 |
| toast 消息 | 新增 toast 组件库 | `setInteractionNotice`（`map-ui.ts` 已有） | 与现有通知体系保持一致，避免引入依赖 |
| DTO 验证 | 手写 if 判断 | `class-validator` + `ValidationPipe`（已在 smoke DTO 中） | 复用 `CreateSmokeRecordDto` 同款模式 |
| API URL 构造 | 硬编码字符串 | `createApiUrl()`（`services/api/client.ts` 已有） | 统一处理 `/api` 前缀和环境变量 |

---

## Common Pitfalls

### Pitfall 1: drawerMode 逻辑遗留导致 Popup 永不显示

**What goes wrong:** `LeafletMapStage.vue` 中 `isSummarySurfaceVisible` 依赖 `drawerMode.value === null`。Drawer 删除后如果 `drawerMode` 仍在 store 中且未清理，Popup 的可见性判断可能永远满足不了（永远是 null = 正常）——但 `isDeepPopupVisible` 依赖 `drawerMode !== null`，它引用的 `popup` ref 和 `PointPreviewDrawer` 模板绑定也需要同步删除。

**Why it happens:** `drawerMode` 状态耦合了"是否显示 Drawer"和"Popup 是否被覆盖"两个关注点。

**How to avoid:** 删除 `PointPreviewDrawer.vue` 的同时，从 store 移除 `drawerMode` shallowRef 及所有相关逻辑；从 `LeafletMapStage.vue` 移除 `drawerMode` 解构和所有使用了 `drawerMode` 的计算属性分支。

**Warning signs:** 修改后 Popup 在地图点击后完全不显示——检查 `isSummarySurfaceVisible` 的计算链。

### Pitfall 2: savedBoundaryIds 从 computed 改写为 ref 导致响应性断裂

**What goes wrong:** 如果把 `savedBoundaryIds` 从 `computed` 改成普通的 `shallowRef`，在 `useGeoJsonLayers` 中传入的 `savedBoundaryIds` 参数只在 `buildStyleFunction` 调用时捕获一次引用，之后直接替换 ref.value 的写法（`savedBoundaryIds.value = [...]`）会断裂响应链。

**Why it happens:** `buildStyleFunction` 接收的是 `Ref<string[]>`，读的是 `.value`——需要是同一个 ref 对象，value 的变化才能被 watch 到。

**How to avoid:** 保持 `savedBoundaryIds` 为 `computed`，派生自 `travelRecords` state。`travelRecords` 用 `shallowRef<TravelRecord[]>`，乐观更新时替换整个数组（不可变模式）。

**Warning signs:** 点亮后按钮状态变了，但地图高亮没有跟着变化。

### Pitfall 3: Prisma migration 冲突（placeId @unique）

**What goes wrong:** 如果将来前端乐观更新触发了两次 `POST /records`（竞态条件），数据库会返回 unique constraint violation（Prisma P2002 错误）。如果后端未处理这个错误，前端会收到 500，错误地显示 toast。

**Why it happens:** `@unique` 约束是正确的业务约束，但点亮按钮禁用期间的防重逻辑不够完善时会触发。

**How to avoid:** 在 `RecordsService.create` 中 catch Prisma P2002 错误并返回 HTTP 409；前端对 409 的处理：不回滚（记录已存在说明点亮状态正确），只清除 pending 状态。

**Warning signs:** 快速双击点亮按钮后，toast 显示错误但地图显示点亮——数据实际上已保存。

### Pitfall 4: bootstrapFromApi 与 preloadSavedBoundaryShards 的顺序

**What goes wrong:** `LeafletMapStage.vue` 现有的 `watch(isReady, preloadSavedBoundaryShards)` 是在地图就绪后立即预加载 `savedBoundaryIds` 对应的 shards。如果 `bootstrapFromApi` 是异步的，地图可能在 API 返回前就已就绪，导致 `savedBoundaryIds` 为空，预加载 shards 被跳过。

**Why it happens:** `isReady` 由 Leaflet 初始化控制，独立于 API 响应。

**How to avoid:** `preloadSavedBoundaryShards` 需要在 `bootstrapFromApi` 完成之后调用，而不是在 `isReady` 变为 true 时立即调用。可以用 `watch([isReady, hasBootstrapped], ...)` 同时等待两者为 true，或在 `bootstrapFromApi` 完成后手动触发预加载。

**Warning signs:** 刷新页面后已点亮地点的高亮边界不显示（按钮状态正确但地图无高亮）。

### Pitfall 5: TravelRecord 在 contracts 中的字段与 CanonicalPlaceSummary 对齐问题

**What goes wrong:** `CanonicalPlaceSummary` 包含 `regionSystem`、`adminType`、`typeLabel`、`parentLabel` 等字段，但 D-08 规定 `TravelRecord` 只需 `placeId`、`boundaryId`、`placeKind`、`datasetVersion`、`displayName`、`subtitle`。如果 contracts 定义不一致，前端在 illuminate 时需要从 `CanonicalPlaceSummary` 提取子集。

**How to avoid:** `CreateTravelRecordRequest` 只包含 D-08 规定的字段。后端 `CreateTravelRecordDto` 只验证这些字段。前端调用时从 `CanonicalPlaceSummary` 提取所需字段，不传递多余字段（`ValidationPipe` 的 `forbidNonWhitelisted: true` 会拒绝多余字段）。

---

## Code Examples

以下均为现有代码片段，供计划者参考实现细节。

### 现有：useGeoJsonLayers 高亮响应链

```typescript
// apps/web/src/composables/useGeoJsonLayers.ts（现有）
// watch 自动响应 savedBoundaryIds 变化 — Phase 15 只需更新 store 中的 travelRecords
watch(savedBoundaryIds, () => {
  refreshStyles()
})
```

### 现有：已点亮状态的样式

```typescript
// useGeoJsonLayers.ts 中的三态样式（现有）
if (savedBoundaryIds.value.includes(boundaryId)) {
  return {
    color: 'rgba(132, 199, 216, 0.82)',   // 蓝青色 — 点亮态
    weight: 2.4,
    fillColor: 'rgba(132, 199, 216, 0.24)',
    fillOpacity: 0.24,
    opacity: 1,
  }
}
// 选中态（粉色）优先级高于点亮态，在上方判断
```

点亮按钮的"已点亮"状态色应呼应 `rgba(132, 199, 216, 0.82)` 这个蓝青色系。

### 现有：API URL 构造

```typescript
// services/api/client.ts（现有）
export function createApiUrl(path: string) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
// 新增 records.ts: createApiUrl('/records') → '/api/records'
```

### 现有：ValidationPipe 模式（可复用到 TravelRecord DTO）

```typescript
// records.controller.ts（现有 smoke 模式，新 endpoint 复用）
@Post()
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
}))
async create(@Body() body: CreateTravelRecordDto): Promise<TravelRecord> { ... }

@Delete(':placeId')
async delete(@Param('placeId') placeId: string): Promise<void> { ... }
```

### 现有：setInteractionNotice（可用作 toast 回调）

```typescript
// map-ui.ts（现有）
setInteractionNotice({
  tone: 'warning',
  message: '点亮失败，请重试',
})
```

---

## State of the Art

| 旧做法 | Phase 15 新做法 | 影响 |
|---|---|---|
| `bootstrapPoints()` 从 localStorage 读取 | `bootstrapFromApi()` 从 `GET /records` 读取 | 数据来源切换为服务端 |
| `userPoints: PersistedMapPoint[]` + `seedOverrides` + `deletedSeedIds` | `travelRecords: TravelRecord[]` | store 状态大幅简化 |
| `saveDraftAsPoint()` 同步写 localStorage | `illuminate(summary)` 异步写 server API | 引入乐观更新模式 |
| Drawer 为深度编辑表面 | Popup 为唯一交互表面 | 移除 drawerMode、EditablePointSnapshot 等类型 |
| `SmokeRecord` 为临时占位模型 | `TravelRecord` 为正式业务模型 | 需要 Prisma migration |
| PointSummaryCard 有"保存为地点"、"查看详情"、"编辑地点"三按钮 | 只有"点亮"/"已点亮"一个按钮 | 大幅简化 footer |

**Deprecated/outdated 文件（Phase 15 后应删除或清空）：**
- `apps/web/src/data/seed-points.ts` — 完全删除
- `apps/web/src/services/point-storage.ts` — 完全删除（连同 `.spec.ts`）
- `apps/web/src/components/PointPreviewDrawer.vue` — 完全删除（连同 `.spec.ts`）
- `apps/web/src/types/map-point.ts` 中：`DrawerMode`、`EditablePointSnapshot`、`SeedPointOverride`、`PersistedMapPoint`（`source: 'seed'`）、`PointStorageHealth` — 可移除

---

## Open Questions

1. **SmokeRecord 模型去留**
   - What we know: 现有 migration `20260330_init_smoke_record` 创建了 `SmokeRecord` 表。
   - What's unclear: 是否需要在 Phase 15 删除 `SmokeRecord` 表和相关 endpoint `/records/smoke`？
   - Recommendation: 保留 `SmokeRecord` 表和 schema（避免 migration 复杂性），在代码层面将其设为内部 smoke 测试用途。`/records/smoke` endpoint 保留但不在前端使用。TravelRecord 通过新 migration 独立添加。

2. **toast 实现机制**
   - What we know: `setInteractionNotice` 已有 `tone: 'warning' | 'info'`，用于地图底部的状态提示。
   - What's unclear: 这个通知机制是否适合作为点亮失败的 toast（可能在用户不注视通知区域时错过）？
   - Recommendation: Phase 15 复用 `setInteractionNotice`，无需引入独立 toast 组件。如果视觉效果不够显眼，这是 UI 细节问题，可在 Wave 内调整。

3. **bootstrapFromApi 的 hasBootstrapped 标志与 HMR**
   - What we know: 现有 `hasBootstrapped` 防止重复初始化。Pinia HMR 通过 `acceptHMRUpdate` 处理。
   - What's unclear: 热更新时 store 重置后 `hasBootstrapped` 是否会阻止二次 bootstrap？
   - Recommendation: 开发环境下接受这个限制（刷新页面即可重新加载）。生产环境不受影响。

---

## Environment Availability

| 依赖 | 需要方 | 可用 | 版本 | 备注 |
|---|---|---|---|---|
| Node.js | 全部 | ✓ | 22.22.1 | 满足要求 |
| pnpm | 包管理 | ✓ | 10.33.0 | 满足要求 |
| PostgreSQL (via Supabase) | Prisma migration | 需确认 | — | DATABASE_URL 已配置；migration 需连通数据库 |
| Prisma CLI | schema migration | ✓ | 已在 devDeps | `pnpm --filter @trip-map/server prisma migrate dev` |

**Missing dependencies with no fallback:**
- 无（Phase 15 不引入新依赖）

**Note on Prisma migration:** `prisma migrate dev` 需要能连接到 Supabase 数据库（`DIRECT_URL` 环境变量）。开发时若网络不通，可先用 `prisma migrate dev --create-only` 生成 migration SQL，后续联网再 apply。

---

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | Vitest (已配置) |
| Config file | `apps/web/vitest.config.ts` / `apps/server` 参考根 turbo config |
| Quick run command (web) | `pnpm --filter @trip-map/web test` |
| Quick run command (server) | `pnpm --filter @trip-map/server test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| API-01 | `GET /records` 返回所有 TravelRecord | e2e (supertest) | `pnpm --filter @trip-map/server test` | ❌ Wave 0 |
| API-01 | `POST /records` 创建 TravelRecord，重复 placeId 返回 409 | e2e (supertest) | `pnpm --filter @trip-map/server test` | ❌ Wave 0 |
| API-01 | `DELETE /records/:placeId` 删除记录，不存在返回 404 | e2e (supertest) | `pnpm --filter @trip-map/server test` | ❌ Wave 0 |
| API-02 | POST body 中 placeId 必填，缺失返回 400 | e2e (supertest) | `pnpm --filter @trip-map/server test` | ❌ Wave 0 |
| API-05 | bootstrapFromApi 调用 GET /records，不读 localStorage | unit (map-points store) | `pnpm --filter @trip-map/web test` | ❌ Wave 0 |
| MAP-07 | illuminate() 后 savedBoundaryIds 包含该 boundaryId | unit (map-points store) | `pnpm --filter @trip-map/web test` | ❌ Wave 0 |
| MAP-07 | unilluminate() 后 savedBoundaryIds 不含该 boundaryId | unit (map-points store) | `pnpm --filter @trip-map/web test` | ❌ Wave 0 |
| MAP-07 | API 失败时 savedBoundaryIds 回滚到操作前状态 | unit (map-points store) | `pnpm --filter @trip-map/web test` | ❌ Wave 0 |
| UIX-02 | PointSummaryCard view mode 渲染"点亮"按钮，isSaved=true 时渲染"已点亮" | unit (vue component) | `pnpm --filter @trip-map/web test` | ❌ Wave 0 |
| UIX-05 | pending 期间按钮 disabled；失败时按钮状态回滚 | unit (vue component / store) | `pnpm --filter @trip-map/web test` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm --filter @trip-map/web test` + `pnpm --filter @trip-map/server test`
- **Per wave merge:** `pnpm test`（全量）
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/server/src/modules/records/records-travel.e2e-spec.ts` — 覆盖 API-01、API-02 的 CRUD e2e
- [ ] `apps/web/src/stores/map-points.spec.ts` — 现有 spec 需更新以覆盖 MAP-07、API-05
- [ ] `apps/web/src/components/map-popup/PointSummaryCard.spec.ts` — 新建，覆盖 UIX-02、UIX-05

---

## Project Constraints (from CLAUDE.md)

以下约束对所有 Plan 均有强制效力：

| 约束 | 来源 | 适用范围 |
|---|---|---|
| 始终使用 Composition API + `<script setup lang="ts">` | CLAUDE.md Vue 规范 | 所有 `.vue` 文件 |
| 优先不可变模式——创建新对象而非修改已有对象 | CLAUDE.md TS 规范 + 全局规则 | store action 中的数组操作 |
| 函数体 < 50 行，文件 < 800 行 | CLAUDE.md TS 规范 | 新建和修改的所有文件 |
| 后端验证使用 class-validator + class-transformer | CLAUDE.md NestJS 规范 | CreateTravelRecordDto |
| 修改 contracts 后必须 `pnpm --filter @trip-map/contracts build` | CLAUDE.md contracts 规范 | contracts 包变更后 |
| 测试框架统一使用 Vitest，命令为 `vitest run` | CLAUDE.md 测试规范 | 所有测试 |
| Commit message 格式：`<type>(<scope>): <description>` | CLAUDE.md Git 约定 | 所有 commit |
| 不引入 PostGIS、Redis、BullMQ 或复杂基础设施 | REQUIREMENTS.md API-04 | 整个 Phase 15 |
| Fastify 适配器（不用 Express） | CLAUDE.md NestJS 规范 | NestJS 路由 |

---

## Sources

### Primary (HIGH confidence)

- 直接读取 `apps/server/prisma/schema.prisma`——当前 SmokeRecord 模型结构
- 直接读取 `apps/web/src/stores/map-points.ts`——完整 localStorage 逻辑，464 行，Phase 15 主要重构对象
- 直接读取 `apps/web/src/composables/useGeoJsonLayers.ts`——`watch(savedBoundaryIds)` 自动刷新样式的响应链
- 直接读取 `apps/server/src/modules/records/records.controller.ts`——现有 smoke endpoint 结构
- 直接读取 `packages/contracts/src/records.ts` + `place.ts`——契约现状
- 直接读取 `apps/web/src/components/LeafletMapStage.vue`——完整 749 行，含 Drawer 引用、事件接线、bootstrap 时序
- 直接读取 `apps/web/src/components/map-popup/PointSummaryCard.vue`——619 行，含按钮/事件结构

### Secondary (MEDIUM confidence)

- `.planning/phases/15-服务端记录与点亮闭环/15-CONTEXT.md`——用户决策 D-01 至 D-15
- `.planning/REQUIREMENTS.md`——API-01/02/05、MAP-07、UIX-02/03/05 完整定义

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 所有库已在项目中，无新依赖
- Architecture patterns: HIGH — 基于对现有代码的直接读取，响应链已经验证存在
- Pitfalls: HIGH — 基于代码中观察到的真实耦合点（drawerMode、savedBoundaryIds computed 链、bootstrap 时序）

**Research date:** 2026-03-31
**Valid until:** 2026-04-30（项目依赖稳定，NestJS/Prisma/Vue 均无重大版本更新预期）
