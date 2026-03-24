---
requirements-completed: [PNT-01]
---

# 03-01 Summary

## Outcome

把 Phase 2 的识别结果接成了真正的点位域状态流：地图点击成功后现在会生成草稿点位、允许再次点击时替换旧草稿，并通过统一的 `map-points` store 驱动地图与抽屉选择态。

## Completed Work

- 扩展 `src/types/map-point.ts`，加入 `DraftMapPoint`、`PersistedMapPoint`、`SeedPointOverride`、`DrawerMode` 与 `PointStorageHealth`
- 新增 `src/stores/map-points.ts`，统一维护 `draft / saved / seed override / deletedSeedIds / activePoint / drawerMode`
- 新增 `src/stores/map-points.spec.ts`，覆盖草稿创建、草稿替换、草稿转已保存点与 seed 隐藏
- 精简 `src/stores/map-ui.ts`，让它只负责识别中的反馈和 notice，不再承担点位事实来源
- 更新 `src/components/WorldMapStage.vue`，把识别成功后的结果改成 `startDraftFromDetection / replaceDraftFromDetection` 流程
- 更新 `src/components/SeedMarkerLayer.vue`，改为按点位 id 选中，并为草稿点位增加单独视觉状态
- 更新 `src/components/PointPreviewDrawer.vue` 与 `src/App.vue`，切到新的 `activePoint` 选择源
- 更新 `src/components/WorldMapStage.spec.ts`，补上草稿点位创建与替换旧草稿的回归覆盖

## Verification

- `pnpm test -- src/stores/map-points.spec.ts src/components/WorldMapStage.spec.ts`
- `rg 'startDraftFromDetection|replaceDraftFromDetection|saveDraftAsPoint|hideSeedPoint' src/stores/map-points.ts`
- `rg '当前未保存地点将被丢弃，并切换到新位置' src/components/WorldMapStage.vue`

## Notes

- 这一步最大的结构变化是把点位事实来源从 `map-ui.selectedPoint` 挪到了 `map-points.activePoint`
- 草稿点位现在已经是正式状态机的一部分，而不是单纯的“识别成功预览对象”

## Self-Check: PASSED
