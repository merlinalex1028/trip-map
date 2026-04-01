# Plan 15-02 执行摘要

**计划**: 15-02 — 重写前端 store 为 server API 驱动，移除 Drawer/localStorage/seed，实现乐观更新
**执行时间**: 2026-04-01
**状态**: ✅ 完成

## 变更摘要

### 1. 创建 API 客户端

- **新建** `apps/web/src/services/api/records.ts`：实现 `fetchTravelRecords`、`createTravelRecord`、`deleteTravelRecord` 三个函数，幂等处理 409/404 响应。

### 2. 重写 map-points store

**文件**: `apps/web/src/stores/map-points.ts`

- 移除：所有 `localStorage`/`seedPoints`/`point-storage`/`DrawerMode`/`EditablePointSnapshot`/`SeedPointOverride`/`PointStorageHealth` 相关代码
- 新增状态：`travelRecords`（`shallowRef<TravelRecord[]>([])`）、`pendingPlaceIds`（`shallowRef<Set<string>>(new Set())`）
- 新增方法：`bootstrapFromApi()`、`illuminate(summary)`、`unilluminate(placeId)`
- 乐观更新：`illuminate` 先写入 optimistic record（`pending-{placeId}`），`unilluminate` 先快照再删除；失败时回滚
- `savedBoundaryIds` 改为从 `travelRecords` 派生，`displayPoints` 改为从 `travelRecords` + `draftPoint` 派生
- 暴露 `isPlaceIlluminated` 和 `isPlacePending` 辅助函数
- 删除：`saveDraftAsPoint`、`updateSavedPoint`、`toggleActivePointFeatured`、`deleteUserPoint`、`hideSeedPoint`、`restoreSeedPoint`、`clearCorruptStorageState`、`openDrawerView`、`closeDrawer`、`enterEditMode`、`exitEditMode`

**文件**: `apps/web/src/stores/map-points.spec.ts`

- 重写所有测试用例，使用 `vi.hoisted` 工厂函数定义 mock（解决 TDZ 问题）
- 覆盖：`bootstrapFromApi` 从 API 加载、`illuminate` 乐观写入、`illuminate` 失败回滚、`unilluminate` 乐观删除、`unilluminate` 失败回滚、`savedBoundaryIds` 派生、`pendingPlaceIds` 状态

**文件**: `apps/web/src/types/map-point.ts`

- 移除：`DrawerMode`、`EditablePointSnapshot`、`SeedPointOverride`、`PointStorageHealth` 类型
- `MapPointSource`：`'saved' | 'detected'`，移除 `'seed'`
- `SummaryMode`：`'candidate-select' | 'detected-preview' | 'view'`

### 3. 删除废弃文件

- `apps/web/src/services/point-storage.ts` — 已删除
- `apps/web/src/services/point-storage.spec.ts` — 已删除
- `apps/web/src/data/seed-points.ts` — 已删除

### 4. 移除 PointPreviewDrawer 组件

- `apps/web/src/components/PointPreviewDrawer.vue` — 已删除
- `apps/web/src/components/PointPreviewDrawer.spec.ts` — 已删除

### 5. 更新 LeafletMapStage

**文件**: `apps/web/src/components/LeafletMapStage.vue`

- 移除：`PointPreviewDrawer` import、`drawerMode`/`isDeepPopupVisible` 状态、`@open-detail/@edit-point/@toggle-featured/@save-point` 事件
- `bootstrapPoints` → `bootstrapFromApi`，bootstrap 与 shard preload 正确等待 `hasBootstrapped`

**文件**: `apps/web/src/components/LeafletMapStage.spec.ts`

- 重写测试用例，移除对 `drawerMode`/`openDrawerView`/`saveDraftAsPoint` 的依赖
- 正确 mock `recordsApiMock` 的 `fetchTravelRecords`/`createTravelRecord`/`deleteTravelRecord`

### 6. 精简 Popup 组件

**文件**: `apps/web/src/components/map-popup/MapContextPopup.vue`

- 移除已不存在的 `openDetail`/`editPoint`/`toggleFeatured`/`savePoint` emit

**文件**: `apps/web/src/components/map-popup/PointSummaryCard.vue`

- 移除：所有 footer 按钮（`saveDraft`、`openDrawer`、`enterEdit`、`toggleFeatured`、`deletePoint` 等）及相关处理函数
- 移除 `destructiveAction` 状态和相关 computed
- 移除 `<footer class="point-summary-card__footer">` 整个区块

### 7. 更新 App 层

**文件**: `apps/web/src/App.vue`

- 移除 `useMapPointsStore` import、`mapPointsStore` 声明、`bootstrapPoints()` 调用
- 移除 storage health 警告 UI

**文件**: `apps/web/src/App.spec.ts`

- 移除 storage mock、`POINT_STORAGE_KEY` import 及相关测试用例

**文件**: `apps/web/src/data/preview-points.ts`

- 替换为 stub，标注数据已迁移至 server API

## 验收标准

| 标准 | 结果 |
|------|------|
| `fetchTravelRecords`/`createTravelRecord`/`deleteTravelRecord` 存在 | ✅ |
| `bootstrapFromApi`/`illuminate`/`unilluminate`/`pendingPlaceIds` 存在 | ✅ |
| `map-points.ts` 不含 `localStorage`/`seedPoints`/`drawerMode`/`editableSnapshot` | ✅ |
| `map-point.ts` 不含 `DrawerMode`/`EditablePointSnapshot`/`SeedPointOverride` | ✅ |
| `point-storage.ts`/`seed-points.ts`/`PointPreviewDrawer.vue` 已删除 | ✅ |
| `LeafletMapStage.vue` 不含 `drawerMode`/`isDeepPopupVisible`/`bootstrapPoints` | ✅ |
| `PointSummaryCard.vue` 不含 `openDrawer`/`enterEdit`/`toggleFeatured`/`saveDraft` | ✅ |
| `PointSummaryCard.vue` 不含 `point-summary-card__footer` | ✅ |
| `pnpm --filter @trip-map/web test` 通过 | ✅ |
| `pnpm typecheck` 通过 | ✅ |

## 下一步

Phase 15 的下一步是 **Plan 15-03**：在 Popup 标题行添加"点亮/已点亮"按钮，接线至 store 并完成视觉验收。
