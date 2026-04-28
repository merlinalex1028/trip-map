# Technology Stack — v7.0 旅行记录编辑与删除

**研究日期:** 2026-04-28
**研究范围:** v7.0 新增功能所需的技术栈变更/补充

## 执行摘要

v7.0 里程碑聚焦三个功能：编辑旅行日期、添加备注/标签、单条记录删除。经过代码库分析，**现有技术栈已完全覆盖所需能力，无需引入新依赖**。核心工作在于 Prisma schema 扩展、API 端点新增和前端组件开发。

## 现有技术栈（无需变更）

| 层 | 技术 | 版本 | 状态 |
|---|------|------|------|
| 后端框架 | NestJS + Fastify | 11.x + 5.x | ✓ 稳定 |
| ORM | Prisma | 6.x | ✓ 稳定 |
| 数据库 | PostgreSQL | - | ✓ 稳定 |
| 前端框架 | Vue 3 (Composition API) | 3.5.x | ✓ 稳定 |
| 状态管理 | Pinia | 3.x | ✓ 稳定 |
| 构建工具 | Vite | 8.x | ✓ 稳定 |
| 样式 | Tailwind CSS | 4.x | ✓ 稳定 |
| 验证 | class-validator + class-transformer | 0.15.x + 0.5.x | ✓ 稳定 |
| 测试 | Vitest | 4.x | ✓ 稳定 |

## Schema 变更需求

### 当前 UserTravelRecord 结构

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

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, placeId, startDate, endDate])
  @@index([userId, placeId])
  @@index([userId])
}
```

### 需要新增的字段

| 字段 | 类型 | 用途 | 备注 |
|------|------|------|------|
| `note` | `String?` | 旅行备注 | 可选，最大 1000 字符 |
| `tags` | `String[]` | 标签列表 | 使用 PostgreSQL 数组类型，默认空数组 |

### Schema 变更示例

```prisma
model UserTravelRecord {
  // ... 现有字段 ...
  startDate      String?
  endDate        String?
  note           String?    // 新增：旅行备注
  tags           String[]   @default([])  // 新增：标签列表
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  // ...
}
```

### 唯一约束分析

当前约束 `@@unique([userId, placeId, startDate, endDate])` 已支持同一地点多次记录。v7.0 单条删除需要通过 `id` 定位，**无需修改约束**。

## API 端点设计

### 新增端点

| 方法 | 路径 | 用途 | 请求体 |
|------|------|------|--------|
| `PATCH` | `/records/:id` | 更新单条记录 | `{ startDate?, endDate?, note?, tags? }` |
| `DELETE` | `/records/:id` | 删除单条记录 | - |

### 现有端点复用

| 方法 | 路径 | 现状 | v7.0 变更 |
|------|------|------|-----------|
| `DELETE` | `/records/:placeId` | 删除地点所有记录 | 保留，用于地点级清除 |
| `GET` | `/records` | 获取所有记录 | 响应需包含 `note`、`tags` |

### 响应类型扩展

`TravelRecord` 接口需新增：

```typescript
interface TravelRecord {
  // ... 现有字段 ...
  note: string | null    // 新增
  tags: string[]         // 新增
}
```

## 前端组件需求

### 新增组件

| 组件 | 职责 | 位置 |
|------|------|------|
| `EditRecordForm.vue` | 编辑日期/备注/标签表单 | `apps/web/src/components/record-edit/` |
| `ConfirmDialog.vue` | 通用确认弹窗 | `apps/web/src/components/common/` |
| `TagInput.vue` | 标签输入组件 | `apps/web/src/components/common/` |

### 需修改组件

| 组件 | 变更内容 |
|------|----------|
| `TimelineVisitCard.vue` | 添加编辑/删除操作按钮 |
| `PointSummaryCard.vue` | 添加编辑入口（可选） |

### Pinia Store 扩展

`map-points.ts` 需新增：

```typescript
// 新增方法
async function updateTravelRecord(id: string, data: UpdateTravelRecordRequest): Promise<void>
async function deleteTravelRecordById(id: string): Promise<void>
```

## 关键决策记录

| 决策 | 理由 | 状态 |
|------|------|------|
| 不引入新依赖 | 现有栈完全覆盖需求 | ✓ 决策 |
| 使用 PostgreSQL 数组存储标签 | 简单场景无需独立 Tag 表 | ✓ 决策 |
| PATCH 语义而非 PUT | 部分更新场景更灵活 | ✓ 决策 |
| 确认弹窗自行实现 | 避免引入 UI 库，保持轻量 | ✓ 决策 |

## 实现复杂度评估

| 功能 | 复杂度 | 主要工作 |
|------|--------|----------|
| 编辑旅行日期 | 低 | Schema 扩展 + PATCH 端点 + 表单组件 |
| 添加备注 | 低 | Schema 扩展 + 表单字段 |
| 添加标签 | 中 | Schema 扩展 + TagInput 组件 + 数组验证 |
| 单条删除 | 低 | DELETE 端点 + 确认弹窗 |
| 确认弹窗 | 低 | 通用 ConfirmDialog 组件 |

## 风险与注意事项

1. **数据迁移**：新增字段需 Prisma migration，`tags` 默认空数组不影响现有数据
2. **唯一约束**：当前约束允许同一地点 + 不同日期的多条记录，编辑日期时需检查冲突
3. **标签验证**：需限制单标签长度（如 20 字符）和总数（如 10 个）
4. **备注长度**：建议限制 1000 字符，防止滥用

## What NOT to Add in v7.0

| 不要添加 | 理由 |
|----------|------|
| 富文本编辑器 | 备注只需纯文本，避免引入 TipTap/Quill 等重量级库 |
| 独立 Tag 模型/表 | 标签场景简单，PostgreSQL 数组足够，避免多表关联查询 |
| 编辑历史/撤销栈 | PROJECT.md 已决策不做 undo，仅确认弹窗 |
| UI 组件库（Headless UI 等） | 确认弹窗自行实现，保持项目轻量 |
| 表单库（VeeValidate 等） | 现有 TripDateForm 已证明原生表单足够 |

## 结论

**无需新增任何依赖**。v7.0 所有功能均可通过现有技术栈实现，核心工作量在：
1. Prisma schema 扩展（2 个字段）
2. 2 个新 API 端点（PATCH + DELETE）
3. 3 个新前端组件（表单 + 弹窗 + 标签输入）
4. 现有组件适配（时间轴卡片添加操作按钮）

---

*研究完成于 2026-04-28*
