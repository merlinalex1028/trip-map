# Phase 15: 服务端记录与点亮闭环 - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 15 负责把旅行记录与点亮动作完全迁移到 `server` API 持久化，删除 Drawer 组件，将交互简化为"Popup + 点亮按钮"的极简模型，并清除旧 `localStorage` 旅行数据链路。交付后，用户通过 Popup 直接点亮地点（创建记录）或取消点亮（删除记录），地图边界高亮与按钮状态即时同步。

本阶段不交付：账号体系、多设备同步、搜索/筛选历史记录、旧数据迁移兼容。

</domain>

<decisions>
## Implementation Decisions

### Drawer 完全删除
- **D-01:** `PointPreviewDrawer.vue` 连同所有相关代码（drawerMode、EditablePointSnapshot、toggleActivePointFeatured 等）全部删除，不保留只读版本。
- **D-02:** Popup 成为唯一交互表面：地点基本信息（displayName、typeLabel、subtitle）+ 点亮按钮。无名称输入、无备注输入、无编辑表单。
- **D-03:** 候选确认链路（canonical resolve 歧义时的候选列表）继续保留在 Popup 内——这是已有功能，不受 Drawer 删除影响。

### 点亮按钮 UI
- **D-04:** 点亮按钮位于 Popup 地点标题右侧，按钮文案：未点亮显示 **"点亮"**，已点亮显示 **"已点亮"**。
- **D-05:** 点击"已点亮"触发取消点亮（删除记录），无需确认对话框，直接执行（通过乐观更新 + 失败回滚保证安全）。
- **D-06:** 按钮状态色区分已点亮（高亮色，与地图边界高亮色系呼应）和未点亮（次要色），延续三态辨识体系。

### 点亮即记录——极简数据模型
- **D-07:** **点亮 = 创建 TravelRecord；取消点亮 = 删除 TravelRecord**。不存在"有记录但未点亮"的中间状态。
- **D-08:** `TravelRecord` 模型只包含 canonical 地点身份字段：`placeId`、`boundaryId`、`placeKind`、`datasetVersion`、`displayName`、`subtitle`（上级归属 + 类型语义）。无 `isFeatured`、无用户自定义名称、无备注字段。
- **D-09:** 记录存在于数据库 = 该地点处于点亮状态。数据库中的所有 `TravelRecord` 行在地图上都应高亮。

### 乐观更新策略
- **D-10:** 点击点亮/取消点亮后**立即**切换按钮状态 + 地图边界高亮，不等待 API 返回。
- **D-11:** API 调用在后台进行。成功时静默确认（不需要 toast）；**失败时回滚 UI 状态 + 显示 toast 错误提示**。
- **D-12:** 乐观更新期间按钮短暂禁用（防止重复点击），视觉上可以有轻微 loading 指示（具体形式由 Claude 判断）。

### 旧数据退场
- **D-13:** v3.0 启动后，`localStorage` 旅行数据和 seed 点位**全部静默删除/忽略**，不读取、不迁移、不提示用户。
- **D-14:** 地图首次加载时，如果 server 无记录则展示空白地图，无引导文案，无空状态插画——用户直接点击地图开始点亮。
- **D-15:** 与 `localStorage` 相关的 `point-storage.ts`、`seed-points.ts` 导入引用从前端代码中完全移除。

### Claude's Discretion
- `TravelRecord` API 的具体路由设计（`POST /records`、`DELETE /records/:placeId` 还是其他形态）
- Prisma schema 中 `TravelRecord` 模型的精确字段命名与索引策略
- 前端 Pinia store 的重构方式（是否保留 `map-points.ts` 结构还是拆分）
- Popup 内点亮按钮的具体尺寸、圆角、间距等视觉细节
- 取消点亮失败时 toast 的文案措辞
- API 调用的具体错误处理（网络超时、4xx/5xx 等分类处理方式）

</decisions>

<specifics>
## Specific Ideas

- "选中新地点只是查看 popup，点亮即等于创建一个走过的地点" — 交互模型的核心隐喻
- 取消点亮不需要确认弹窗，因为乐观更新失败会回滚，误操作可以再次点亮
- 空地图直接呈现，不需要任何引导——地图本身就是引导（点击即开始）
- Drawer 删除是彻底的，不是隐藏或简化，连相关类型和 store 方法都要清理

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and phase requirements
- `.planning/ROADMAP.md` — Phase 15 的目标、依赖、requirements 映射与成功标准
- `.planning/REQUIREMENTS.md` — `API-01`（records CRUD 通过 server）、`API-02`（以 placeId 为目标）、`API-05`（不再读取 localStorage）、`MAP-07`（地图边界即时同步）、`UIX-02`（点亮按钮非 checkbox）、`UIX-03`（按钮/状态色/高亮即时同步）、`UIX-05`（三态一致反馈）
- `.planning/PROJECT.md` — v3.0 全局约束，特别是"不再读取旧 localStorage 旅行数据"与"不引入复杂基础设施"的护栏

### Prior phase contracts that carry forward
- `.planning/phases/14-leaflet/14-CONTEXT.md` — Leaflet 高亮三态（已点亮/当前选中/未记录）样式体系、乐观更新后需同步的 `savedBoundaryIds` 状态
- `.planning/phases/12-canonical/12-CONTEXT.md` — canonical `placeId` 作为记录目标身份、候选确认链路、跨表面语义一致性合同
- `.planning/phases/09-popup/09-CONTEXT.md` — popup/drawer 职责边界（drawer 将被删除，popup 成为唯一表面）
- `.planning/phases/10-可爱风格与可读性收口/10-CONTEXT.md` — 可爱风视觉合同与状态辨识体系，点亮按钮状态色需与现有配色协调

### Key source files for implementation
- `apps/web/src/stores/map-points.ts` — 当前 localStorage + seed 逻辑的集中地，Phase 15 的主要重构对象
- `apps/web/src/components/map-popup/PointSummaryCard.vue` — 点亮按钮的 UI 实现入口
- `apps/web/src/components/map-popup/MapContextPopup.vue` — Popup 主容器，控制何时显示/关闭
- `apps/web/src/components/PointPreviewDrawer.vue` — 将被完全删除的 Drawer 组件
- `apps/server/src/modules/records/records.controller.ts` — 当前只有 smoke endpoint，需要演进为正式 CRUD
- `apps/server/prisma/schema.prisma` — 需要从 `SmokeRecord` 演进到正式 `TravelRecord` 模型
- `packages/contracts/src/records.ts` — 需要从 smoke 契约升级为正式 records API 契约

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/composables/useGeoJsonLayers.ts`: Phase 14 建立的三态高亮系统，`savedBoundaryIds` set 控制已点亮边界样式——Phase 15 乐观更新后直接操作此 set
- `apps/web/src/stores/map-points.ts`: `selectedPointId`、`summaryMode`、`pendingCanonicalSelection` 等状态管理逻辑可保留；localStorage/seed/toggleActivePointFeatured 相关逻辑需替换为 API 调用
- `apps/web/src/components/map-popup/PointSummaryCard.vue`: popup UI 骨架复用，需新增点亮按钮区域
- `packages/contracts/src/place.ts`: `CanonicalPlaceSummary` 类型覆盖了 TravelRecord 所需的所有地点身份字段，可作为 records 契约的直接基础

### Established Patterns
- Pinia store 集中管理地图交互状态，Vue 3 Composition API + `<script setup>`
- `@floating-ui` popup 锚定已在 Phase 14 稳定，Phase 15 不改变 popup 定位逻辑
- Phase 14 三态高亮通过 `useGeoJsonLayers.ts` 的 `styleFeature()` 函数控制，乐观更新后修改 `savedBoundaryIds` 即可驱动高亮变更
- `packages/contracts` 薄契约层：只承载 DTO/类型，不含业务逻辑

### Integration Points
- `apps/web/src/stores/map-points.ts` 的 `userPoints` state 需从 localStorage 切换为从 `GET /records` API 初始化
- `useGeoJsonLayers.ts` 消费的 `savedBoundaryIds` 需在 API 调用成功/乐观更新时同步更新
- `apps/server/prisma/schema.prisma` 需新增 `TravelRecord` 模型，`SmokeRecord` 可在 Phase 15 删除或保留（由 Claude 判断）
- `packages/contracts/src/records.ts` 需从 smoke 契约升级，定义 `TravelRecord`、`CreateTravelRecordRequest`、`DeleteTravelRecordRequest` 等生产类型

</code_context>

<deferred>
## Deferred Ideas

- 旅行记录添加自定义名称、备注、访问日期字段 — 用户明确不要这些，若未来需要可作为 v4.0 需求
- 删除前确认对话框 — 用户选择不要，乐观更新失败回滚即可
- 多设备同步、导出、分享 — Future Requirements (SYNC-01, SYNC-02)
- 账号/登录体系 — Future Requirements (AUTH-01)
- 记录列表页（查看所有已点亮地点）— 未在本 milestone 范围内

</deferred>

---

*Phase: 15-服务端记录与点亮闭环*
*Context gathered: 2026-03-31*
