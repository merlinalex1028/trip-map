# Phase 36: 数据层扩展 - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Prisma schema 扩展 notes/tags 字段、contracts 更新 TravelRecord 接口、新增 PATCH/DELETE 后端端点、日期冲突校验。纯后端基础设施层，前端不在此阶段修改。

</domain>

<decisions>
## Implementation Decisions

### 删除端点设计
- **D-01:** 移除现有 `DELETE /records/:placeId` 端点（删除该地点所有记录）
- **D-02:** 新增 `DELETE /records/record/:id` 端点，按单条记录 ID 删除
- **D-03:** 移除独立的「取消亮点」功能概念——删除该地点最后一条记录即等同于取消亮点
- **D-04:** 地图 popup 不再需要「取消亮点」按钮，改为逐条删除

### 错误响应格式
- **D-05:** 继续使用标准 NestJS 默认错误格式 `{ statusCode, message, error }`
- **D-06:** 日期冲突返回 409，message 包含冲突日期范围，如 `"与已有记录冲突: 2024-01-01 ~ 2024-01-05"`
- **D-07:** 字段验证错误返回 400，使用 class-validator 默认 message

### 合约扩展
- **D-08:** TravelRecord 接口新增 `updatedAt: string` 字段（Prisma 模型已有此字段）
- **D-09:** PATCH 响应返回完整更新后的 TravelRecord（含 updatedAt），支持前端乐观更新

### 标签处理
- **D-10:** 后端自动清洗标签数组：trim 每个标签、去重、忽略空字符串
- **D-11:** 返回的标签数组为去重清洗后的结果

### 备注内容
- **D-12:** 备注允许换行符，前端使用 `white-space: pre-line` 展示
- **D-13:** 备注最大 1000 字符（含换行符）

### Claude's Discretion
- PATCH 请求体允许部分更新（只传 startDate 不传 endDate 时，endDate 保持不变）
- 删除成功返回 204 No Content
- PATCH 时如果只改了备注/标签但没改日期，不触发唯一约束校验（约束只在日期变更时检查）
- 标签返回时不做排序（保持去重后的原始顺序）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 数据模型
- `apps/server/prisma/schema.prisma` — UserTravelRecord 模型，`@@unique([userId, placeId, startDate, endDate])` 约束
- `packages/contracts/src/records.ts` — TravelRecord 接口定义（需新增 updatedAt、notes、tags）

### 现有端点
- `apps/server/src/modules/records/records.controller.ts` — 现有端点模式、装饰器、验证管道
- `apps/server/src/modules/records/records.service.ts` — 双层验证模式（DTO + service 断言）
- `apps/server/src/modules/records/records.repository.ts` — 数据访问层，当前 deleteTravelRecordByPlaceId 实现

### 研究文档
- `.planning/research/SUMMARY.md` — v7.0 研究综合，技术栈决策与风险点
- `.planning/research/PITFALLS.md` — 删除语义断裂、唯一约束冲突等关键陷阱

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `assertValidDateRange()` — records.service.ts 中已有的日期校验逻辑，可复用于 PATCH
- `ValidationPipe` — 现有 DTO 验证管道模式，新端点直接复用
- `SessionAuthGuard` — 现有认证守卫，新端点直接复用
- `@CurrentUser()` — 现有用户注入装饰器

### Established Patterns
- Controller: `@Controller('records')` + `@ApiTags('records')` + Swagger 装饰器
- DTO: class-validator 装饰器（`@IsString`, `@IsOptional`, `@Matches` 等）
- Error: `BadRequestException(message)` / `NotFoundException(message)` 标准 NestJS 异常
- Auth: `@UseGuards(SessionAuthGuard)` + `@CurrentUser()` 组合

### Integration Points
- Prisma schema → migration → contracts → controller → service → repository
- 新增字段需同步更新 contracts 的 TravelRecord 接口和前端 API 类型

</code_context>

<specifics>
## Specific Ideas

- 取消亮点功能完全移除，简化产品模型——只有「删除记录」一个概念
- 标签使用 PostgreSQL 原生数组（`String[]`），不做独立 Tag 表
- 备注使用 `String?`（nullable），允许换行符

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 36-数据层扩展*
*Context gathered: 2026-04-28*
