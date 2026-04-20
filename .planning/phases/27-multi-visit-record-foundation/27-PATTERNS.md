# Phase 27: Multi-Visit Record Foundation - Pattern Map

**Mapped:** 2026-04-20
**Files analyzed:** 11 new/modified files
**Analogs found:** 11 / 11

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `packages/contracts/src/records.ts` | model/contract | transform | 自身（现有接口扩展）| exact |
| `apps/server/prisma/schema.prisma` | config/migration | CRUD | 自身（现有 model 修改）| exact |
| `apps/server/src/modules/records/dto/create-travel-record.dto.ts` | model/DTO | request-response | 自身（现有 DTO 扩展）| exact |
| `apps/server/src/modules/records/records.repository.ts` | service/repository | CRUD | 自身（现有 repo 修改）| exact |
| `apps/server/src/modules/records/records.service.ts` | service | request-response | 自身（现有 service 修改）| exact |
| `apps/server/src/modules/auth/auth.service.ts` | service | request-response | `records.service.ts` toContractTravelRecord | exact |
| `apps/web/src/stores/map-points.ts` | store | event-driven | 自身（现有 store 重构）| exact |
| `apps/web/src/services/api/records.ts` | service/client | request-response | 自身（现有 client 扩展）| exact |
| `apps/web/src/services/legacy-point-storage.ts` | utility | transform | 自身（现有 utility 修改）| exact |
| `apps/web/src/components/map-popup/PointSummaryCard.vue` | component | event-driven | 自身（现有组件修改）| exact |
| `apps/web/src/components/map-popup/TripDateForm.vue` | component | event-driven | `PointSummaryCard.vue` | role-match |

---

## Pattern Assignments

### `packages/contracts/src/records.ts` (contract, transform)

**Analog:** 自身现有代码（扩展 `TravelRecord` 和 `CreateTravelRecordRequest`）

**现有接口结构** (lines 13-28):
```typescript
// 当前 TravelRecord — 无日期字段
export interface TravelRecord {
  id: string
  placeId: string
  boundaryId: string
  placeKind: PlaceKind
  datasetVersion: string
  displayName: string
  regionSystem: 'CN' | 'OVERSEAS'
  adminType: ChinaAdminType | 'ADMIN1'
  typeLabel: string
  parentLabel: string
  subtitle: string
  createdAt: string
}

// 当前 CreateTravelRecordRequest — 无日期字段
export interface CreateTravelRecordRequest extends CanonicalPlaceSummary {}
```

**Phase 27 需要添加的字段（复制此模式）:**
```typescript
// 在 TravelRecord 末尾、createdAt 之前加入：
startDate: string | null   // YYYY-MM-DD；null = 日期未知（D-08）
endDate: string | null     // YYYY-MM-DD；null = 单日旅行或日期未知

// CreateTravelRecordRequest 改为显式接口（不再 extends only），加入：
export interface CreateTravelRecordRequest extends CanonicalPlaceSummary {
  startDate: string | null
  endDate: string | null
}
```

**注意:** 修改后须运行 `pnpm --filter @trip-map/contracts build`，上游包才能消费新类型。

---

### `apps/server/prisma/schema.prisma` (config/migration, CRUD)

**Analog:** 自身现有代码 + 同文件 `SmokeRecord` 作为字段风格参考

**现有 UserTravelRecord 结构** (lines 67-87):
```prisma
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
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, placeId])   // ← Phase 27: 移除此行
  @@index([userId])
}
```

**Phase 27 变更模式（在 `createdAt` 之前插入日期字段，替换 unique 约束）:**
```prisma
// 新增字段（nullable String，对应 YYYY-MM-DD 或 null）
startDate      String?  // YYYY-MM-DD; null = 日期未知
endDate        String?  // YYYY-MM-DD; null = 单日旅行或未知

// 约束变更：
@@index([userId, placeId])   // 从 @@unique 降级为 @@index（允许多条记录）
@@index([userId])            // 保留
```

**Migration 执行命令:**
```bash
pnpm --filter @trip-map/server exec prisma migrate dev --name phase27_multi_visit_dates
pnpm --filter @trip-map/server exec prisma generate
```

---

### `apps/server/src/modules/records/dto/create-travel-record.dto.ts` (model/DTO, request-response)

**Analog:** 自身现有代码

**现有 DTO 装饰器模式** (lines 1-62，`@IsString() @IsNotEmpty()` 配对模式):
```typescript
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import type { ... } from '@trip-map/contracts'

export class CreateTravelRecordDto implements CreateTravelRecordRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  placeId!: string

  // ... 其他必填字段同上模式 ...

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subtitle!: string
}
```

**Phase 27 新增日期字段模式（追加到 `subtitle` 之后）:**
```typescript
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

// 在 CreateTravelRecordDto 末尾加入：
@ApiProperty({ nullable: true, example: '2025-10-01' })
@IsOptional()
@Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
startDate?: string | null

@ApiProperty({ nullable: true, example: '2025-10-07' })
@IsOptional()
@Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
endDate?: string | null
```

**跨字段校验（在 `records.service.ts` 层做，不在 DTO）:**
```typescript
// records.service.ts createTravel 方法中加入：
if (input.startDate && input.endDate && input.endDate < input.startDate) {
  throw new BadRequestException('endDate must be >= startDate')
}
```

---

### `apps/server/src/modules/records/records.repository.ts` (service/repository, CRUD)

**Analog:** 自身现有代码

**现有 `toTravelRecordData` 工具函数** (lines 15-29):
```typescript
// 当前版本 — 无日期字段
function toTravelRecordData(userId: string, input: CreateTravelRecordDto) {
  return {
    userId,
    placeId: input.placeId,
    boundaryId: input.boundaryId,
    placeKind: input.placeKind,
    datasetVersion: input.datasetVersion,
    displayName: input.displayName,
    regionSystem: input.regionSystem,
    adminType: input.adminType,
    typeLabel: input.typeLabel,
    parentLabel: input.parentLabel,
    subtitle: input.subtitle,
  }
}
```

**Phase 27 修改：在 `toTravelRecordData` 末尾追加日期字段:**
```typescript
function toTravelRecordData(userId: string, input: CreateTravelRecordDto) {
  return {
    // ... 现有字段保持不变 ...
    subtitle: input.subtitle,
    startDate: input.startDate ?? null,   // 新增
    endDate: input.endDate ?? null,       // 新增
  }
}
```

**`createTravelRecord` 从 upsert 改为 create** (lines 63-74):
```typescript
// 当前 upsert 实现（需替换）：
async createTravelRecord(userId: string, input: CreateTravelRecordDto): Promise<UserTravelRecord> {
  return this.prisma.userTravelRecord.upsert({
    where: { userId_placeId: { userId, placeId: input.placeId } },
    update: toTravelRecordData(userId, input),
    create: toTravelRecordData(userId, input),
  })
}

// Phase 27 改为（直接 create，允许同 placeId 多条）：
async createTravelRecord(userId: string, input: CreateTravelRecordDto): Promise<UserTravelRecord> {
  return this.prisma.userTravelRecord.create({
    data: toTravelRecordData(userId, input),
  })
}
```

**`importTravelRecords` 去重口径变更** (lines 76-129):
```typescript
// 当前：按 placeId 查重（需替换为三元组查重）
const existingRecords = await this.prisma.userTravelRecord.findMany({
  where: {
    userId,
    placeId: { in: uniqueInputs.map((input) => input.placeId) },
  },
  select: { placeId: true },
})
const existingPlaceIds = new Set(existingRecords.map((record) => record.placeId))
const recordsToCreate = uniqueInputs.filter((input) => !existingPlaceIds.has(input.placeId))

// Phase 27 改为：按 placeId + startDate + endDate 三元组查重
// 旧记录 startDate/endDate 均为 null，null + null 也参与匹配，
// 防止同一地点重复创建"日期未知"记录（D-09）
```

**`deleteTravelRecordByPlaceId` 不变** (lines 131-138):
```typescript
// 保持 deleteMany by placeId — D-06 语义不变，无需修改
async deleteTravelRecordByPlaceId(userId: string, placeId: string): Promise<void> {
  await this.prisma.userTravelRecord.deleteMany({
    where: { userId, placeId },
  })
}
```

---

### `apps/server/src/modules/records/records.service.ts` (service, request-response)

**Analog:** 自身现有代码

**现有 `toContractTravelRecord` 映射函数** (lines 39-54):
```typescript
function toContractTravelRecord(record: UserTravelRecord): ContractTravelRecord {
  return {
    id: record.id,
    placeId: record.placeId,
    boundaryId: record.boundaryId,
    placeKind: record.placeKind as PlaceKind,
    datasetVersion: record.datasetVersion,
    displayName: record.displayName,
    regionSystem: record.regionSystem as ContractTravelRecord['regionSystem'],
    adminType: record.adminType as ContractTravelRecord['adminType'],
    typeLabel: record.typeLabel as ContractTravelRecord['typeLabel'],
    parentLabel: record.parentLabel as ContractTravelRecord['parentLabel'],
    subtitle: record.subtitle,
    createdAt: record.createdAt.toISOString(),
  }
}
```

**Phase 27 在 `createdAt` 之前追加日期字段:**
```typescript
// 在 createdAt 行之前插入：
startDate: record.startDate ?? null,   // Prisma String? → contract string | null
endDate: record.endDate ?? null,
createdAt: record.createdAt.toISOString(),
```

**`createTravel` 加入跨字段日期校验** (lines 73-77):
```typescript
async createTravel(userId: string, input: CreateTravelRecordDto): Promise<ContractTravelRecord> {
  this.assertAuthoritativeOverseasRecord(input)
  // 新增：日期区间合法性校验
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    throw new BadRequestException('endDate must be >= startDate')
  }
  const record = await this.recordsRepository.createTravelRecord(userId, input)
  return toContractTravelRecord(record)
}
```

---

### `apps/server/src/modules/auth/auth.service.ts` (service, request-response)

**Analog:** 同文件现有代码 + `records.service.ts` 中的 `toContractTravelRecord`

**现有 `toContractTravelRecord`（auth.service.ts 独立副本）** (lines 35-50):
```typescript
function toContractTravelRecord(record: UserTravelRecord): TravelRecord {
  return {
    id: record.id,
    placeId: record.placeId,
    boundaryId: record.boundaryId,
    placeKind: record.placeKind as TravelRecord['placeKind'],
    datasetVersion: record.datasetVersion,
    displayName: record.displayName,
    regionSystem: record.regionSystem as TravelRecord['regionSystem'],
    adminType: record.adminType as TravelRecord['adminType'],
    typeLabel: record.typeLabel ?? '',
    parentLabel: record.parentLabel ?? '',
    subtitle: record.subtitle,
    createdAt: record.createdAt.toISOString(),
  }
}
```

**Phase 27 同步修改（与 records.service.ts 保持一致）:**
```typescript
// 在 createdAt 行之前插入：
startDate: record.startDate ?? null,
endDate: record.endDate ?? null,
createdAt: record.createdAt.toISOString(),
```

**注意（Pitfall 7）:** 两处 `toContractTravelRecord` 必须同步修改。如果只改 `records.service.ts`，bootstrap 恢复的记录将没有日期字段，跨设备同步将静默丢失日期数据。

---

### `apps/web/src/stores/map-points.ts` (store, event-driven)

**Analog:** 自身现有代码（多处函数修改 + 新增 computed）

**现有 `illuminate` 签名与短路逻辑** (lines 331-363):
```typescript
// 当前签名（无日期参数）— 需扩展
async function illuminate(summary: {
  placeId: string
  boundaryId: string | null
  placeKind: TravelRecord['placeKind']
  datasetVersion: string
  displayName: string
  regionSystem: TravelRecord['regionSystem']
  adminType: TravelRecord['adminType']
  typeLabel: TravelRecord['typeLabel']
  parentLabel: TravelRecord['parentLabel']
  subtitle: string | null
}) {

// 当前短路（lines 359-363）— 需移除（Pitfall 1）：
if (travelRecords.value.some((r) => r.placeId === placeId)) {
  selectedPointId.value = placeId
  summaryMode.value = 'view'
  return   // ← 此 return 必须移除，改为允许多次 illuminate 同一地点
}
```

**Phase 27 `illuminate` 签名扩展模式:**
```typescript
// 追加 startDate / endDate 到 summary 参数对象末尾：
async function illuminate(summary: {
  // ... 现有字段 ...
  subtitle: string | null
  startDate: string | null   // 新增：YYYY-MM-DD 或 null（日期未知）
  endDate: string | null     // 新增：YYYY-MM-DD 或 null
}) {
```

**乐观记录构造模式（参考 lines 365-378，追加日期字段）:**
```typescript
// 当前乐观记录（lines 365-378）：
const optimisticRecord: TravelRecord = {
  id: `pending-${placeId}`,   // Phase 27 改为 `pending-${placeId}-${Date.now()}` 防止多次 pending 冲突
  placeId,
  // ... 其他字段 ...
  createdAt: new Date().toISOString(),
}

// Phase 27 在 createdAt 之前追加：
startDate: summary.startDate,
endDate: summary.endDate,
```

**现有 `applyAuthoritativeTravelRecords`（按 placeId 合并，需重构）** (lines 178-201):
```typescript
// 当前：按 placeId 作 Map key（多条记录后会覆盖，Pitfall 3）
const snapshotByPlaceId = new Map(records.map((record) => [record.placeId, record]))
const currentByPlaceId = new Map(travelRecords.value.map((record) => [record.placeId, record]))
// ...
travelRecords.value = Array.from(snapshotByPlaceId.values())
```

**Phase 27 改为按 `record.id` 合并:**
```typescript
// pending 记录用 id.startsWith('pending-') 判断
// authoritative 快照按 record.id 作 Map key
function applyAuthoritativeTravelRecords(records: TravelRecord[]) {
  if (pendingPlaceIds.value.size === 0) {
    travelRecords.value = [...records]
    hasBootstrapped.value = true
    return
  }

  const snapshotById = new Map(records.map((r) => [r.id, r]))
  // 保留 pending 中仍在 pendingPlaceIds 范围内的记录
  const pendingRecords = travelRecords.value.filter(
    (r) => r.id.startsWith('pending-') && pendingPlaceIds.value.has(r.placeId),
  )
  travelRecords.value = [...snapshotById.values(), ...pendingRecords]
  hasBootstrapped.value = true
}
```

**现有 `displayPoints`（1:1 mapping，多条记录后需去重）** (lines 101-109):
```typescript
// 当前（直接 map，多条记录后地图上会叠加 marker，Pitfall 4）：
const displayPoints = computed<MapPointDisplay[]>(() => {
  const points: MapPointDisplay[] = travelRecords.value.map(recordToDisplayPoint)
  if (draftPoint.value) points.push(draftPoint.value)
  return points
})
```

**Phase 27 改为 placeId 去重（取 createdAt 最新记录）:**
```typescript
const displayPoints = computed<MapPointDisplay[]>(() => {
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

**新增 `tripsByPlaceId` computed（供 UI 读取次数摘要）:**
```typescript
// 参考 savedBoundaryIds computed 的 Set 聚合模式（lines 93-99），改为 Map 聚合：
const tripsByPlaceId = computed(() => {
  const map = new Map<string, TravelRecord[]>()
  for (const record of travelRecords.value) {
    const existing = map.get(record.placeId) ?? []
    map.set(record.placeId, [...existing, record])
  }
  return map
})
```

---

### `apps/web/src/services/api/records.ts` (service/client, request-response)

**Analog:** 自身现有代码

**现有 `createTravelRecord` 函数** (lines 9-17):
```typescript
export async function createTravelRecord(
  request: CreateTravelRecordRequest,
): Promise<TravelRecord> {
  return apiFetchJson<TravelRecord>('/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}
```

**Phase 27 修改：** 函数签名不变（`CreateTravelRecordRequest` 已在 contracts 层新增日期字段），`JSON.stringify(request)` 自动携带 `startDate`/`endDate`。无需修改此文件代码逻辑，但需在 `illuminate` 调用处传入日期字段。

---

### `apps/web/src/services/legacy-point-storage.ts` (utility, transform)

**Analog:** 自身现有代码

**现有 `normalizeLegacyTravelRecord` 返回值** (lines 96-145):
```typescript
function normalizeLegacyTravelRecord(value: unknown): CreateTravelRecordRequest | null {
  // ... 字段提取与校验 ...

  return {
    placeId,
    boundaryId,
    placeKind,
    datasetVersion,
    displayName,
    regionSystem,
    adminType,
    typeLabel,
    parentLabel,
    subtitle,
    // ← Phase 27 在此追加：
    // startDate: null,  // 旧记录日期未知，D-08 明确要求不得用 createdAt 伪装
    // endDate: null,
  }
}
```

**Phase 27 修改模式（在 return 语句末尾追加，不修改任何现有字段）:**
```typescript
return {
  placeId,
  boundaryId,
  placeKind,
  datasetVersion,
  displayName,
  regionSystem,
  adminType,
  typeLabel,
  parentLabel,
  subtitle,
  startDate: null,   // 旧记录统一标记为日期未知（D-08、D-09）
  endDate: null,
}
```

---

### `apps/web/src/components/map-popup/PointSummaryCard.vue` (component, event-driven)

**Analog:** 自身现有代码

**现有 props 与 emit 定义** (lines 19-42):
```typescript
const props = withDefaults(
  defineProps<{
    surface: SummarySurfaceState
    findSavedPointByCityId?: (cityId: string) => MapPointDisplay | null
    titleClass?: string
    isSaved?: boolean
    isPending?: boolean
    isIlluminatable?: boolean
  }>(),
  { /* defaults */ },
)

const emit = defineEmits<{
  confirmCandidate: [candidate: GeoCityCandidate]
  continueWithFallback: []
  illuminate: []     // ← Phase 27: 改为携带日期数据
  unilluminate: []
}>()
```

**Phase 27 修改：`illuminate` emit 改为携带日期，新增 props:**
```typescript
// props 新增（供摘要显示）：
tripCount?: number          // 该地点已记录次数（来自 tripsByPlaceId）
latestTripDate?: string | null  // 最近一次旅行日期摘要

// emit 修改：
illuminate: [{ startDate: string | null; endDate: string | null }]
```

**现有按钮 `handleIlluminateToggle` 模式** (lines 183-190):
```typescript
function handleIlluminateToggle() {
  if (props.isPending || !props.isIlluminatable) return
  if (props.isSaved) {
    emit('unilluminate')
  } else {
    emit('illuminate')   // ← Phase 27: 不再直接 emit，而是展开内联日期表单
  }
}
```

**Phase 27 `isSaved` 分支处理变化：**
- `isSaved = false`（未点亮）：点击"点亮"按钮展开 `TripDateForm`，由表单 submit 触发 `emit('illuminate', { startDate, endDate })`
- `isSaved = true`（已点亮）：显示轻量摘要（次数 + 最近日期），提供"再记一次"CTA；点击展开 `TripDateForm`，submit 触发 `emit('illuminate', { startDate, endDate })`

**Kawaii 视觉风格复用模式（关键 CSS 变量）:**
```css
/* 从同文件 scoped style 复用（lines 332-490）: */
--color-ink-strong
--color-ink-muted
--color-accent-strong
--color-accent
--color-secondary-strong
var(--font-label-size)
var(--font-label-line-height)
var(--font-weight-label)
/* 圆角：rounded-full / rounded-3xl / rounded-2xl */
/* 阴影：shadow-[0_14px_28px_rgba(...)] */
/* hover 动效：transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 */
```

---

### `apps/web/src/components/map-popup/TripDateForm.vue` (component, event-driven) — 新建文件

**Analog:** `apps/web/src/components/map-popup/PointSummaryCard.vue`

**Component 结构模式（完全复制 PointSummaryCard 的 `<script setup lang="ts">` 模式）:**
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  isSubmitting?: boolean
}
const props = withDefaults(defineProps<Props>(), { isSubmitting: false })

const emit = defineEmits<{
  submit: [{ startDate: string | null; endDate: string | null }]
  cancel: []
}>()

const startDate = ref<string>('')   // input[type=date] 绑定值，格式 YYYY-MM-DD
const endDate = ref<string>('')

// 校验：endDate 不为空时必须 >= startDate（字符串字典序，YYYY-MM-DD 保证单调性）
const isValid = computed(() =>
  startDate.value !== '' &&
  (endDate.value === '' || endDate.value >= startDate.value),
)

function handleSubmit() {
  if (!isValid.value) return
  emit('submit', {
    startDate: startDate.value || null,
    endDate: endDate.value || null,
  })
}

function handleCancel() {
  emit('cancel')
}
</script>
```

**日期输入控件模式（HTML 原生，无第三方库）:**
```html
<template>
  <!-- 参考 PointSummaryCard noticeClass 的圆角/背景风格 -->
  <form @submit.prevent="handleSubmit">
    <label>
      开始日期
      <input
        v-model="startDate"
        type="date"
        required
        :max="endDate || undefined"
      />
    </label>
    <label>
      结束日期（可选，留空表示单日旅行）
      <input
        v-model="endDate"
        type="date"
        :min="startDate || undefined"
      />
    </label>
    <button type="submit" :disabled="!isValid || isSubmitting">保存</button>
    <button type="button" @click="handleCancel">取消</button>
  </form>
</template>
```

**Scoped style 模式:** 复制 `PointSummaryCard.vue` 的 CSS 变量用法和 `@media (prefers-reduced-motion: reduce)` block。

---

## Shared Patterns

### 不可变模式（全局规范）
**Source:** `apps/web/src/stores/map-points.ts`，贯穿所有 shallowRef 赋值
**Apply to:** 所有 store 修改
```typescript
// 正确：创建新数组，不 mutate
travelRecords.value = [...travelRecords.value, optimisticRecord]
travelRecords.value = travelRecords.value.filter((r) => r.placeId !== placeId)
pendingPlaceIds.value = new Set([...pendingPlaceIds.value, placeId])

// 错误：直接 push 或 delete
travelRecords.value.push(record)   // NEVER
```

### 乐观写入 + 回滚模式
**Source:** `apps/web/src/stores/map-points.ts` lines 380-438（illuminate）、441-491（unilluminate）
**Apply to:** `illuminate` 修改后
```typescript
// 模式：
// 1. 乐观更新 state
// 2. 记录 pendingPlaceIds
// 3. await API
// 4. 成功：replace 乐观记录 with authoritative
// 5. 失败：filter 出乐观记录，回滚 state
// 6. finally：清理 pendingPlaceIds（session boundary 检查后）
```

### session boundary 检查模式
**Source:** `apps/web/src/stores/map-points.ts` lines 398-401（illuminate try block）
**Apply to:** `illuminate` 修改后的所有 API 回调
```typescript
if (hasSessionBoundaryChanged(boundaryVersionAtStart)) {
  return   // 跨 session boundary 的 stale 结果直接丢弃
}
```

### NestJS DTO 装饰器模式
**Source:** `apps/server/src/modules/records/dto/create-travel-record.dto.ts` lines 1-62
**Apply to:** 日期字段
```typescript
// 必填字段：@ApiProperty() + @IsString() + @IsNotEmpty()
// 可选字段：@ApiProperty({ nullable: true }) + @IsOptional() + @Matches(regexp)
// 不要自定义 Pipe，用 class-validator 装饰器
```

### Prisma → Contract 映射函数模式
**Source:** `apps/server/src/modules/records/records.service.ts` lines 39-54 + `auth.service.ts` lines 35-50
**Apply to:** 两处 `toContractTravelRecord` 函数（必须同步）
```typescript
// 模式：纯函数，无副作用，字段逐一映射，nullable 用 ?? null 或 ?? ''
// DateTime → string：.toISOString()
// Prisma String? → contract string | null：?? null
```

### Vue Composition API + Pinia store 模式
**Source:** `apps/web/src/stores/map-points.ts` lines 84-536
**Apply to:** `TripDateForm.vue`、`PointSummaryCard.vue` 修改
```typescript
// 所有 state 用 shallowRef（非深层对象）
// computed 返回派生数据（不修改 state）
// defineStore 内部函数暴露为 return 对象
// 组件用 <script setup lang="ts">，不用 Options API
```

### 测试 makeRecord 工厂函数模式
**Source:** `apps/web/src/stores/map-points.spec.ts` lines 37-56
**Apply to:** 所有新增 .spec.ts 中的测试数据构造
```typescript
function makeRecord(
  place = PHASE12_RESOLVED_BEIJING,
  overrides: Partial<TravelRecord> = {},
): TravelRecord {
  return {
    id: `server-rec-${place.placeId}`,
    // ... 从 place fixture 取所有字段 ...
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}
// Phase 27 版本需追加 startDate / endDate 到工厂函数默认值
```

### 服务端单元测试 repository mock 模式
**Source:** `apps/server/src/modules/auth/auth.service.spec.ts` lines 31-42
**Apply to:** `records.repository.spec.ts`、`records.service.spec.ts`
```typescript
function createRepositoryMock() {
  return {
    methodName: vi.fn(),
    // ... 列出所有 public method ...
  }
}
// 在 test 内：
const service = new RecordsService(repositoryMock as never)
repositoryMock.someMethod.mockResolvedValueOnce(expectedValue)
```

---

## No Analog Found

所有文件均有可参照的代码模式。`TripDateForm.vue` 为新建文件，但其组件结构、emit 模式、Kawaii 视觉系统均可从 `PointSummaryCard.vue` 直接复制。

| File | Role | Reason |
|------|------|--------|
| — | — | 无 |

---

## Key Anti-Patterns to Avoid

| Anti-Pattern | Location | Correct Pattern |
|---|---|---|
| `illuminate` 中 `if (some(r => r.placeId)) return` 短路 | `map-points.ts` line 359 | 移除该 return，但 `openSavedPointForPlaceOrStartDraft` 需进入 `summaryMode = 'view'` 不触发 illuminate |
| `applyAuthoritativeTravelRecords` 以 placeId 为 Map key | `map-points.ts` line 185 | 改为 `record.id` 为 Map key |
| `displayPoints` 直接 `travelRecords.map(...)` 不去重 | `map-points.ts` line 102 | 先按 placeId 取最新记录，再 map |
| `toContractTravelRecord` 只改 `records.service.ts` | `auth.service.ts` line 35 | 两处同步修改（或抽取共享函数） |
| `createTravelRecord` 仍用 upsert | `records.repository.ts` line 64 | 改为 `prisma.userTravelRecord.create` |
| `normalizeLegacyTravelRecord` 用 `createdAt` 填充 `startDate` | `legacy-point-storage.ts` | `startDate: null, endDate: null`（D-08） |
| Schema 改完不运行 `prisma generate` | — | Wave 0 第一步：migrate + generate |

---

## Metadata

**Analog search scope:** `packages/contracts/src/`, `apps/server/src/modules/records/`, `apps/server/src/modules/auth/`, `apps/server/prisma/`, `apps/web/src/stores/`, `apps/web/src/services/`, `apps/web/src/components/map-popup/`
**Files scanned:** 11 source files + 3 spec files
**Pattern extraction date:** 2026-04-20
