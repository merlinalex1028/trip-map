# Phase 36: 数据层扩展 - Pattern Map

**Mapped:** 2026-04-28
**Files analyzed:** 7 (1 create, 6 modify)
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/server/prisma/schema.prisma` | model (modify) | N/A | 自身现有模型 | exact |
| `packages/contracts/src/records.ts` | contract (modify) | N/A | 自身现有接口 | exact |
| `apps/server/src/modules/records/dto/update-travel-record.dto.ts` | dto (create) | N/A | `create-travel-record.dto.ts` | exact |
| `apps/server/src/modules/records/records.repository.ts` | repository (modify) | CRUD | 自身现有方法 | exact |
| `apps/server/src/modules/records/records.service.ts` | service (modify) | CRUD | 自身现有方法 | exact |
| `apps/server/src/modules/records/records.controller.ts` | controller (modify) | request-response | 自身现有端点 | exact |
| `packages/contracts/src/index.ts` | barrel (modify) | N/A | 自身现有导出 | exact |

## Pattern Assignments

### `apps/server/prisma/schema.prisma` (model, modify)

**Analog:** 自身 `UserTravelRecord` 模型（lines 67-90）

**现有字段模式** (lines 67-83):
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
  startDate      String?
  endDate        String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  // ... relations, constraints
}
```

**新增字段模式**（参考 `SmokeRecord` 的 `note` 字段，line 23）:
```prisma
  note           String?   // nullable，可选字段
```

**变更要点:**
- 在 `endDate` 和 `createdAt` 之间添加 `notes String?` 和 `tags String[]` 两个字段
- `notes` 用 `String?`（nullable），与 SmokeRecord 的 `note` 模式一致
- `tags` 用 `String[]`（PostgreSQL 原生数组），默认 `@default([])`

---

### `packages/contracts/src/records.ts` (contract, modify)

**Analog:** 自身现有 `TravelRecord` 接口（lines 13-28）和 `CreateTravelRecordRequest`（lines 30-33）

**现有 TravelRecord 接口** (lines 13-28):
```typescript
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
  startDate: string | null
  endDate: string | null
  createdAt: string
}
```

**新增字段** (D-08, D-12, D-13):
```typescript
  updatedAt: string        // D-08: 支持乐观更新冲突检测
  notes: string | null     // D-12: 允许换行符，nullable
  tags: string[]           // 标签数组，PostgreSQL 原生数组
```

**新增接口** — `UpdateTravelRecordRequest`:
```typescript
export interface UpdateTravelRecordRequest {
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
  tags?: string[]
}
```

**变更要点:**
- `TravelRecord` 添加 `updatedAt`、`notes`、`tags` 三个字段
- 新增 `UpdateTravelRecordRequest` 接口，所有字段可选（PATCH 语义）
- 不修改 `CreateTravelRecordRequest`（创建时不传 notes/tags，或可选）

---

### `apps/server/src/modules/records/dto/update-travel-record.dto.ts` (dto, create)

**Analog:** `create-travel-record.dto.ts`（完整文件，lines 1-72）

**DTO 模式** (lines 1-8, 62-72):
```typescript
import { IsOptional, IsString, Matches, MaxLength, ArrayMaxSize } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type { UpdateTravelRecordRequest } from '@trip-map/contracts'

export class UpdateTravelRecordDto implements UpdateTravelRecordRequest {
  @ApiProperty({ nullable: true, example: '2025-10-01', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate?: string | null

  @ApiProperty({ nullable: true, example: '2025-10-07', required: false })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
  endDate?: string | null

  @ApiProperty({ nullable: true, example: '这是一条备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[]
}
```

**验证规则:**
- `startDate`/`endDate`: `@IsOptional()` + `@Matches(/^\d{4}-\d{2}-\d{2}$/)` — 与 CreateTravelRecordDto 一致
- `notes`: `@IsOptional()` + `@IsString()` + `@MaxLength(1000)` — D-13 最大 1000 字符
- `tags`: `@IsOptional()` + `@IsString({ each: true })` + `@ArrayMaxSize(10)` — 最多 10 个标签

---

### `apps/server/src/modules/records/records.repository.ts` (repository, modify)

**Analog:** 自身现有方法

**现有 create 模式** (lines 77-81):
```typescript
async createTravelRecord(userId: string, input: CreateTravelRecordDto): Promise<UserTravelRecord> {
  return this.prisma.userTravelRecord.create({
    data: toTravelRecordData(userId, input),
  })
}
```

**现有 delete 模式** (lines 141-148):
```typescript
async deleteTravelRecordByPlaceId(userId: string, placeId: string): Promise<void> {
  await this.prisma.userTravelRecord.deleteMany({
    where: {
      userId,
      placeId,
    },
  })
}
```

**新增 findTravelRecordById 方法**（service 层 PATCH 部分更新时需要先查现有记录）:
```typescript
async findTravelRecordById(userId: string, id: string): Promise<UserTravelRecord | null> {
  return this.prisma.userTravelRecord.findFirst({
    where: { id, userId },
  })
}
```

**新增 updateTravelRecord 方法:**
```typescript
async updateTravelRecord(userId: string, id: string, data: {
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
  tags?: string[]
}): Promise<UserTravelRecord> {
  return this.prisma.userTravelRecord.update({
    where: { id, userId },
    data,
  })
}
```

**新增 deleteTravelRecordById 方法:**
```typescript
async deleteTravelRecordById(userId: string, id: string): Promise<void> {
  await this.prisma.userTravelRecord.delete({
    where: { id, userId },
  })
}
```

**变更要点:**
- `findTravelRecordById` 使用 `findFirst`（带 userId 权限过滤），返回 `null` 表示不存在
- `updateTravelRecord` 使用 `prisma.update()`，`where` 包含 `id` 和 `userId`（行级权限）
- `deleteTravelRecordById` 使用 `prisma.delete()`（单条），与现有 `deleteMany`（多条）区分
- Prisma `update`/`delete` 在记录不存在时抛 `P2025`（RecordNotFoundError），service 层需 catch

---

### `apps/server/src/modules/records/records.service.ts` (service, modify)

**Analog:** 自身现有方法

**现有 create 模式** (lines 76-81):
```typescript
async createTravel(userId: string, input: CreateTravelRecordDto): Promise<ContractTravelRecord> {
  this.assertAuthoritativeOverseasRecord(input)
  this.assertValidDateRange(input)
  const record = await this.recordsRepository.createTravelRecord(userId, input)
  return toContractTravelRecord(record)
}
```

**现有 delete 模式** (lines 98-100):
```typescript
async deleteTravel(userId: string, placeId: string): Promise<void> {
  await this.recordsRepository.deleteTravelRecordByPlaceId(userId, placeId)
}
```

**现有 assertValidDateRange** (lines 106-112):
```typescript
private assertValidDateRange(
  input: Pick<CreateTravelRecordDto, 'startDate' | 'endDate'>,
): void {
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    throw new BadRequestException('endDate must be >= startDate')
  }
}
```

**新增 updateTravelRecord 方法:**
```typescript
async updateTravelRecord(userId: string, id: string, input: UpdateTravelRecordDto): Promise<ContractTravelRecord> {
  if (input.startDate !== undefined || input.endDate !== undefined) {
    // 需要获取当前记录来补全日期做范围校验
    const existing = await this.recordsRepository.findTravelRecordById(userId, id)
    if (!existing) {
      throw new NotFoundException(`Record ${id} not found`)
    }
    const effectiveStart = input.startDate ?? existing.startDate
    const effectiveEnd = input.endDate ?? existing.endDate
    this.assertValidDateRange({ startDate: effectiveStart, endDate: effectiveEnd })
  }

  // 标签清洗 (D-10)
  const cleanData = { ...input }
  if (cleanData.tags) {
    cleanData.tags = [...new Set(cleanData.tags.map(t => t.trim()).filter(t => t.length > 0))]
  }

  try {
    const record = await this.recordsRepository.updateTravelRecord(userId, id, cleanData)
    return toContractTravelRecord(record)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('与已有记录冲突: 相同日期范围内已存在同地点旅行记录')
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException(`Record ${id} not found`)
    }
    throw error
  }
}
```

**新增 deleteTravelRecord 方法:**
```typescript
async deleteTravelRecord(userId: string, id: string): Promise<void> {
  try {
    await this.recordsRepository.deleteTravelRecordById(userId, id)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException(`Record ${id} not found`)
    }
    throw error
  }
}
```

**变更要点:**
- `updateTravelRecord` 复用 `assertValidDateRange`，但需先获取现有记录补全未传日期
- 标签清洗逻辑 (D-10): trim + 去重 + 过滤空字符串
- Prisma P2002 转为 `ConflictException` (409) — Pitfall 2 防护
- Prisma P2025 转为 `NotFoundException` (404) — 记录不存在
- 需在 service 顶部 import `Prisma` 和 `ConflictException`、`NotFoundException`

**toContractTravelRecord 需更新** (lines 40-57):
```typescript
function toContractTravelRecord(record: UserTravelRecord): ContractTravelRecord {
  return {
    // ... existing fields ...
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),  // 新增
    notes: record.notes ?? null,                 // 新增
    tags: record.tags,                           // 新增
  }
}
```

---

### `apps/server/src/modules/records/records.controller.ts` (controller, modify)

**Analog:** 自身现有端点模式

**现有 POST 端点模式** (lines 73-89):
```typescript
@Post()
@HttpCode(201)
@ApiOperation({ summary: '创建旅行记录' })
@ApiCreatedResponse()
@UseGuards(SessionAuthGuard)
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  expectedType: CreateTravelRecordDto,
}))
async createTravel(
  @CurrentUser() user: AuthUser,
  @Body() body: CreateTravelRecordDto,
): Promise<ContractTravelRecord> {
  return this.recordsService.createTravel(user.id, body)
}
```

**现有 DELETE 端点模式** (lines 109-119):
```typescript
@Delete(':placeId')
@HttpCode(204)
@ApiOperation({ summary: '删除旅行记录' })
@ApiNoContentResponse()
@UseGuards(SessionAuthGuard)
async deleteTravel(
  @CurrentUser() user: AuthUser,
  @Param('placeId') placeId: string,
): Promise<void> {
  return this.recordsService.deleteTravel(user.id, placeId)
}
```

**新增 PATCH 端点:**
```typescript
@Patch(':id')
@ApiOperation({ summary: '更新旅行记录' })
@ApiOkResponse()
@UseGuards(SessionAuthGuard)
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  expectedType: UpdateTravelRecordDto,
}))
async updateTravel(
  @CurrentUser() user: AuthUser,
  @Param('id') id: string,
  @Body() body: UpdateTravelRecordDto,
): Promise<ContractTravelRecord> {
  return this.recordsService.updateTravelRecord(user.id, id, body)
}
```

**新增 DELETE by recordId 端点:**
```typescript
@Delete('record/:id')
@HttpCode(204)
@ApiOperation({ summary: '按记录 ID 删除单条旅行记录' })
@ApiNoContentResponse()
@UseGuards(SessionAuthGuard)
async deleteTravelById(
  @CurrentUser() user: AuthUser,
  @Param('id') id: string,
): Promise<void> {
  return this.recordsService.deleteTravelRecord(user.id, id)
}
```

**变更要点:**
- PATCH 端点返回 200 + 完整 TravelRecord（D-09），使用 `@ApiOkResponse()`
- DELETE by recordId 路径为 `record/:id`（D-02），避免与现有 `:placeId` 路由冲突
- 需在 import 中添加 `Patch` 和 `UpdateTravelRecordDto`
- 现有 `DELETE :placeId` 保留不变（D-01 只是移除前端调用，后端兼容）

---

### `packages/contracts/src/index.ts` (barrel, modify)

**Analog:** 自身现有导出模式（lines 1-11）

**现有模式:**
```typescript
export * from './records'
export type { ImportTravelRecordsRequest, ImportTravelRecordsResponse } from './records'
```

**变更要点:**
- 新增 `UpdateTravelRecordRequest` 的 type-only 导出（如果 `export *` 已覆盖则无需额外添加）
- 由于 `records.ts` 已经 `export interface UpdateTravelRecordRequest`，`export * from './records'` 自动覆盖，无需修改 index.ts

---

## Shared Patterns

### Validation Pipe
**Source:** `apps/server/src/modules/records/records.controller.ts` lines 41-46, 78-83
**Apply to:** PATCH 端点
```typescript
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  expectedType: UpdateTravelRecordDto,
}))
```

### Auth Guard + CurrentUser
**Source:** `apps/server/src/modules/records/records.controller.ts` lines 56-58, 77
**Apply to:** 所有新端点
```typescript
@UseGuards(SessionAuthGuard)
async handler(@CurrentUser() user: AuthUser, ...) {}
```

### Error Response Format (D-05, D-06, D-07)
**Source:** NestJS 默认异常格式 `{ statusCode, message, error }`
**Apply to:** 所有新端点
- 400: `BadRequestException` — class-validator 自动触发
- 404: `NotFoundException` — 记录不存在
- 409: `ConflictException` — 日期冲突 (D-06: message 包含冲突日期范围)

### Prisma to Contract Mapping
**Source:** `apps/server/src/modules/records/records.service.ts` lines 40-57
**Apply to:** `toContractTravelRecord` 函数需扩展 3 个新字段
```typescript
updatedAt: record.updatedAt.toISOString(),
notes: record.notes ?? null,
tags: record.tags,
```

### Tag Cleaning (D-10, D-11)
**Apply to:** service 层 `updateTravelRecord` 方法
```typescript
// D-10: trim + 去重 + 过滤空字符串
// D-11: 返回清洗后的结果，不排序
if (cleanData.tags) {
  cleanData.tags = [...new Set(cleanData.tags.map(t => t.trim()).filter(t => t.length > 0))]
}
```

## No Analog Found

所有文件均有精确的现有代码作为模式参考，无需外部模式。

## Metadata

**Analog search scope:** `apps/server/src/modules/records/`, `packages/contracts/src/`, `apps/server/prisma/`
**Files scanned:** 8 (schema.prisma, records.ts, index.ts, controller, service, repository, 3 DTOs)
**Pattern extraction date:** 2026-04-28
