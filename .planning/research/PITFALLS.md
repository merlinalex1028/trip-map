# Domain Pitfalls

**Domain:** v7.0 旅行记录编辑与删除
**Researched:** 2026-04-28
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: 删除语义从 placeId 级到 recordId 级的断裂

**What goes wrong:** 现有 `deleteTravelRecordByPlaceId(userId, placeId)` 删除该地点下**所有**旅行记录。v7.0 要求"删除单条记录"，但前端 `unilluminate(placeId)` 语义是"取消点亮该地点"——一次删除全部记录。如果直接复用现有 API，用户只想删除某次旅行却会丢失该地点所有记录。

**Why it happens:** v6.0 设计时 placeId 是地图点亮的最小粒度，一个 placeId = 一个点亮点位。v7.0 引入了"同一地点多次旅行"后，删除粒度需要从 placeId 降级到 recordId，但现有 API、前端 store、UI 交互全部绑定在 placeId 语义上。

**Consequences:**
- 用户在时间轴页面删除某次北京旅行，结果北京所有旅行记录全没了
- 地图上北京的点亮状态被意外清除（即使还有其他旅行记录）
- 数据无法恢复（无 undo 机制）

**Prevention:**
- 后端新增 `DELETE /records/by-id/:recordId` 端点，按 `recordId` 删除单条
- 前端新增 `deleteTravelRecordById(recordId)` API 函数
- `unilluminate` 保留为"取消点亮"（删除该地点所有记录），新增 `deleteSingleRecord(recordId)` 为"删除单条"
- 删除前检查：如果该地点只剩最后一条记录，提示用户将取消点亮

**Detection:** 测试用例：同一地点有 2 条记录，删除其中 1 条后，另 1 条仍存在且地图仍亮。

**Roadmap phase:** 数据层先行（contracts + server），再接 UI

---

### Pitfall 2: 日期编辑触发 @@unique 约束冲突

**What goes wrong:** `UserTravelRecord` 的唯一约束是 `@@unique([userId, placeId, startDate, endDate])`。用户修改某条记录的 startDate/endDate 后，新日期组合可能与同地点另一条记录冲突，导致 Prisma 抛出 `P2002` 唯一约束错误。

**Why it happens:** 同一地点可以有多次旅行（如北京 2025-02 和 2025-10），如果用户把 2025-02 的 endDate 改成跟 2025-10 的 startDate/endDate 完全一致，就会撞约束。

**Consequences:**
- 编辑保存时后端返回 500 或未处理的 Prisma 错误
- 前端乐观更新已应用，但后端失败导致 UI 与实际数据不一致
- 用户看到模糊的"保存失败"提示，不知道是日期冲突

**Prevention:**
- 后端 `updateTravelRecord` 方法中 catch Prisma `P2002` 错误，转为 `409 Conflict` + 明确提示"该日期范围内已存在同地点旅行记录"
- 前端编辑表单提交前做本地去重检查：对比当前 `travelRecords` 中同 placeId 的其他记录
- 考虑放宽 unique 约束为 `@@unique([userId, placeId, startDate])` 或增加版本号字段，但需评估对 import 逻辑的影响

**Detection:** 测试用例：同一地点 2 条记录，编辑其中 1 条的日期使其与另 1 条完全相同，应返回 409。

**Roadmap phase:** 后端 validation 层 + 前端表单校验

---

### Pitfall 3: 编辑后时间轴排序错乱

**What goes wrong:** `buildTimelineEntries` 的排序逻辑依赖 `sortDate`（取 `endDate ?? startDate`）和 `hasKnownDate`。用户编辑日期后，该记录在时间轴中的位置会变化，但前端没有重新触发排序——`timelineEntries` 是 `computed`，依赖 `travelRecords` ref，如果编辑是原地修改而非替换数组，computed 不会重新计算。

**Why it happens:** Vue 的 `shallowRef` 对数组内部元素的修改不敏感。如果后端返回更新后的记录，前端用 `travelRecords.value = travelRecords.value.map(r => r.id === updated.id ? updated : r)` 替换，computed 会正确触发。但如果只修改了某个元素的属性而不替换引用，排序不会更新。

**Consequences:**
- 用户编辑了日期，但时间轴中该记录仍停留在原位置
- `visitOrdinal` 和 `visitCount` 可能变得不一致
- 用户刷新后才看到正确排序，造成困惑

**Prevention:**
- 编辑成功后，用更新后的记录替换 `travelRecords` 数组中的对应元素（保持 immutable 模式）
- 确保 `travelRecords.value = [...travelRecords.value]` 或 `travelRecords.value.map(...)` 触发 shallowRef 更新
- 测试：编辑日期后立即检查 `timelineEntries` 的排序是否反映新日期

**Roadmap phase:** 前端 store 层

---

### Pitfall 4: 编辑/删除后统计缓存未刷新

**What goes wrong:** `useStatsStore` 通过 `fetchStatsData()` 从服务端拉取统计，但编辑或删除记录后不会自动触发刷新。用户删除一条记录后，统计页面仍显示旧的 totalTrips / uniquePlaces / visitedCountries 数字。

**Why it happens:** 现有流程中，`illuminate` 和 `unilluminate` 完成后只更新 `travelRecords` 和显示 notice，没有调用 `statsStore.fetchStatsData()`。v6.0 中统计刷新依赖 `boundaryVersion` 变化触发的 bootstrap 重拉，但编辑/删除不会改变 `boundaryVersion`。

**Consequences:**
- 统计数字与实际记录数不一致
- 用户可能看到"去过 5 个地方"但实际只剩 4 条记录
- 只有手动刷新页面才能看到正确统计

**Prevention:**
- 每次 edit/delete mutation 成功后，调用 `useStatsStore().fetchStatsData()` 刷新统计
- 考虑在 `map-points` store 的 edit/delete 成功回调中统一触发
- 或者让统计 store 监听 `travelRecords` 变化自动刷新（但需防抖避免频繁请求）

**Roadmap phase:** 前端 store 联动层

---

### Pitfall 5: 备注/标签字段缺失导致 schema 迁移风险

**What goes wrong:** 当前 `UserTravelRecord` 没有 `note` 和 `tags` 字段。添加这些字段需要 Prisma schema migration。如果 `note` 设为非空默认值，现有记录会被填充空字符串；如果 `tags` 用 JSON 类型，需要考虑 PostgreSQL 的 JSONB 索引。

**Why it happens:** v6.0 的数据模型只关注旅行日期和地点元数据，没有预留内容扩展字段。

**Consequences:**
- Migration 失败或数据丢失（如果操作不当）
- 现有记录的 note/tags 为空，UI 需要处理 null/空值
- 如果 tags 用 String[] 类型，Prisma 的数组字段在不同数据库 provider 行为不同

**Prevention:**
- `note` 字段用 `String?`（可选），默认 null
- `tags` 字段用 `String[]`（Prisma 原生数组），默认空数组 `[]`
- Migration 文件添加后运行 `prisma migrate dev` 验证
- contracts 中 `TravelRecord` 接口同步添加 `note?: string` 和 `tags?: string[]`
- 前端表单提交时，空 note 传 null 而非空字符串

**Roadmap phase:** 最先执行（Phase 1: data model migration）

---

## Moderate Pitfalls

### Pitfall 6: 乐观更新回滚时 UI 状态不一致

**What goes wrong:** 现有 `illuminate` 和 `unilluminate` 都使用乐观更新模式（先更新 UI，失败后回滚）。编辑操作如果也用乐观更新，回滚时需要恢复原记录的所有字段（包括日期、note、tags），但如果用户在回滚前又做了其他操作，回滚会覆盖新操作。

**Prevention:**
- 编辑操作的乐观更新只替换目标记录，不影响其他记录
- 回滚时用 `previousRecords` 快照恢复，与现有 `unilluminate` 模式一致
- 编辑期间对目标记录设置 `pendingRecordIds`（类似 `pendingPlaceIds`），禁止对同一记录重复编辑
- 测试：编辑失败后检查原记录是否完整恢复

**Roadmap phase:** 前端 store 层

---

### Pitfall 7: 多设备编辑竞态（last-write-wins）

**What goes wrong:** 用户在设备 A 编辑了北京旅行的日期为 2025-03，同时在设备 B 编辑同一条记录的日期为 2025-05。设备 B 的写入覆盖了 A 的，用户无感知。

**Why it happens:** 当前系统没有版本号或 ETag 机制，`refreshAuthenticatedSnapshot` 只是全量替换，不做冲突检测。

**Consequences:**
- 静默数据丢失
- 用户不知道自己的编辑被覆盖

**Prevention:**
- v7.0 已决定"无撤销历史"，所以接受 last-write-wins
- 但在 `updatedAt` 字段上做文章：编辑请求携带 `expectedUpdatedAt`，后端检查是否一致，不一致返回 `409 Conflict`
- 前端收到 409 后提示"记录已被其他设备修改，将刷新为最新版本"
- 如果不引入冲突检测，至少在 foreground refresh 时用 `applyAuthoritativeTravelRecords` 覆盖本地（现有机制已支持）

**Roadmap phase:** 可选增强，如果不做则依赖 foreground refresh 最终一致

---

### Pitfall 8: 删除确认弹窗与 pending 状态重叠

**What goes wrong:** 用户点击删除，确认弹窗弹出，但在弹窗显示期间该记录的前一次操作（如编辑）还在 pending 中。用户确认删除后，删除请求发出，但编辑请求也返回了，导致 UI 状态混乱。

**Prevention:**
- 确认弹窗打开前检查目标记录是否在 `pendingRecordIds` 中，如果是则禁用删除按钮
- 删除操作使用 recordId 而非 placeId，避免误删
- 弹窗关闭时清除相关状态

**Roadmap phase:** UI 交互层

---

### Pitfall 9: 编辑日期后 `displayPoints` 的 `createdAt` 语义漂移

**What goes wrong:** `displayPoints` 用 `createdAt` 做同 placeId 去重（取最新 createdAt 的记录作为地图显示）。但 `createdAt` 是记录创建时间，不是旅行时间。如果用户编辑了 `startDate`/`endDate`，`createdAt` 不变，地图显示的"代表记录"可能不是用户期望的那次旅行。

**Prevention:**
- 地图去重逻辑改为：同 placeId 下优先取有日期的记录，再按 `startDate` 降序
- 或者保持现状（createdAt 降序），但在 UI 上明确标注"显示最新添加的记录"
- 编辑不改变 createdAt，这是正确行为——createdAt 代表"何时记录"而非"何时旅行"

**Roadmap phase:** 前端 display 逻辑层

---

### Pitfall 10: PATCH 响应未包含 updatedAt，前端无法检测并发冲突

**What goes wrong:** 如果后端 PATCH 端点只返回更新后的记录但不包含 `updatedAt` 字段，前端无法知道这次写入是否覆盖了其他设备的修改。当前 `TravelRecord` contract 中没有 `updatedAt` 字段。

**Prevention:**
- 在 contracts 的 `TravelRecord` 接口中添加 `updatedAt: string`
- PATCH/PUT 响应返回完整记录（含 updatedAt）
- 前端编辑请求携带 `expectedUpdatedAt`，后端对比后决定是否接受

**Roadmap phase:** contracts + server

---

## Minor Pitfalls

### Pitfall 11: tags 输入的边界情况

**What goes wrong:** 用户输入重复标签、空标签、超长标签、含特殊字符的标签。

**Prevention:**
- 前端：去重、trim、限制单个标签长度（如 20 字符）、限制标签数量（如 10 个）
- 后端：`class-validator` 验证 tags 数组的每个元素
- 特殊字符处理：tags 作为纯文本存储，不做特殊转义

**Roadmap phase:** 前端表单 + 后端 validation

---

### Pitfall 12: note 字段的 XSS 风险

**What goes wrong:** 如果 note 内容在 UI 中用 `v-html` 渲染，可能注入恶意脚本。

**Prevention:**
- 始终用 `{{ note }}`（文本插值）渲染，不用 `v-html`
- 后端存储时不做 HTML 转义（这是纯文本字段）
- 如果未来支持 Markdown 渲染，使用 sanitize 库

**Roadmap phase:** 前端渲染层

---

### Pitfall 13: 编辑表单的日期格式一致性

**What goes wrong:** 前端日期选择器输出格式（如 ISO 8601 `2025-03-15`）与后端存储格式不一致，或与时区相关。

**Prevention:**
- 日期统一用 `YYYY-MM-DD` 字符串格式（无时区）
- 前端 date picker 输出 ISO date string
- 后端 Prisma 中 `startDate` 和 `endDate` 是 `String?` 类型，不做 Date 转换
- contracts 中明确 `startDate: string | null`（已有）

**Roadmap phase:** 全链路一致性

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Schema Migration | Migration 与现有数据不兼容 | 用可选字段（`String?`、`String[]` default `[]`），先 migrate 再写业务逻辑 |
| 编辑 API (PATCH) | 返回值不包含 updatedAt，前端无法做乐观更新冲突检测 | PATCH 响应返回完整 TravelRecord（含 updatedAt） |
| 删除 API (by recordId) | 前端仍用 placeId 调删除，误删全部记录 | 新增独立端点 `DELETE /records/:recordId`，保留旧端点兼容 |
| 前端 store 编辑方法 | 直接修改 shallowRef 内部元素，computed 不触发 | immutable 替换：`travelRecords.value.map(r => r.id === id ? updated : r)` |
| 统计刷新 | 编辑/删除后统计不更新 | mutation 成功后显式调用 `statsStore.fetchStatsData()` |
| 确认弹窗 | 弹窗关闭后状态残留 | 弹窗组件 unmount 时清除所有临时状态 |
| 时间轴重排序 | 编辑日期后时间轴位置不变 | 确保 travelRecords 引用更新触发 computed 重算 |
| contracts 同步 | 新增字段未在 contracts 中定义，前后端类型不一致 | 先改 contracts，build 后再改 server 和 web |

## Current-Code Warning Signs

- `apps/server/prisma/schema.prisma`: `UserTravelRecord` 的 `@@unique([userId, placeId, startDate, endDate])` 在日期编辑时可能冲突
- `apps/server/src/modules/records/records.repository.ts`: `deleteTravelRecordByPlaceId` 删除整个 placeId 的所有记录，不是单条
- `apps/server/src/modules/records/records.controller.ts`: 删除端点是 `DELETE :placeId`，不是 `DELETE :recordId`
- `packages/contracts/src/records.ts`: `TravelRecord` 接口缺少 `updatedAt`、`note`、`tags` 字段
- `apps/web/src/stores/map-points.ts`: `unilluminate(placeId)` 删除整个 placeId，无单条删除能力
- `apps/web/src/services/timeline.ts`: `buildTimelineEntries` 的 computed 依赖 `travelRecords` 引用变化，原地修改不触发重算
- `apps/web/src/stores/stats.ts`: `fetchStatsData` 不会在 edit/delete 后自动调用

## Sources

- Prisma schema: `apps/server/prisma/schema.prisma` — `UserTravelRecord` 唯一约束分析
- 前端 store: `apps/web/src/stores/map-points.ts` — 乐观更新与 pending 状态机制
- 时间轴排序: `apps/web/src/services/timeline.ts` — `buildTimelineEntries` 排序逻辑
- 统计 store: `apps/web/src/stores/stats.ts` — 统计刷新机制
- 现有删除 API: `apps/server/src/modules/records/records.repository.ts` — `deleteTravelRecordByPlaceId` 语义
- PROJECT.md: v7.0 scope 与 Key Decisions
- Prisma composite unique constraints: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-composite-ids-and-constraints
