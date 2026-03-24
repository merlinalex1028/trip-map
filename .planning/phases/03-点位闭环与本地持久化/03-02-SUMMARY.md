---
requirements-completed: [PNT-02, PNT-03, DRW-03]
---

# 03-02 Summary

## Outcome

详情抽屉已经从 Phase 1 的预览卡升级成 Phase 3 的多模式交互面板：支持识别预览、查看详情、编辑字段，以及用户点位删除与 seed 点位隐藏的确认闭环。

## Completed Work

- 重写 `src/components/PointPreviewDrawer.vue`，显式支持 `detected-preview / view / edit` 三种模式
- 在抽屉中补上 `名称`、`简介`、`点亮状态` 三个编辑字段，并保持 seed / saved / draft 三类点位各自不同的操作按钮
- 增加未保存关闭确认、编辑取消恢复、用户点位删除确认、seed 点位隐藏确认
- 新增 `src/components/PointPreviewDrawer.spec.ts`，覆盖识别预览、查看态、编辑态、关闭确认、取消恢复、删除和隐藏逻辑
- 保持 `src/App.spec.ts` 在新的抽屉模式切换下仍能正常挂载

## Verification

- `pnpm test -- src/components/PointPreviewDrawer.spec.ts src/App.spec.ts`
- `rg '保存为地点|编辑|删除|隐藏' src/components/PointPreviewDrawer.vue`
- `rg '你有未保存的更改，确定关闭吗？|确定删除这个地点吗？|确定隐藏这个预置地点吗？' src/components/PointPreviewDrawer.vue`

## Notes

- 这一步先用原生 `window.confirm` 建立确认闭环，避免为了 Phase 3 额外引入新模态系统
- 抽屉默认仍维持地图优先的节奏：识别结果先看再编辑，已保存点位先看后改

## Self-Check: PASSED
