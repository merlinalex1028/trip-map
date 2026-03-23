# Architecture Research

**Domain:** 固定投影世界地图 + 离线真实地点识别的前端应用
**Researched:** 2026-03-23
**Confidence:** HIGH

## Recommended Architecture

### Major Components

| Component | Responsibility | Notes |
|-----------|----------------|-------|
| `AppShell` | 页面主布局、地图容器与抽屉宿主 | 负责桌面/移动布局切换 |
| `WorldMapView` | 底图渲染、点击捕获、选中态驱动 | 不直接负责地理识别 |
| `MapMarkerLayer` | 已有点位与选中态叠加渲染 | 只消费状态，不做业务判断 |
| `DetailDrawer` | 点位详情展示、编辑、删除、关闭 | 桌面右侧、移动端底部 |
| `useMapPoints` / Pinia Store | 点位状态、创建、更新、删除、持久化 | 单一事实来源 |
| `ProjectionService` | `x/y` 与 `lng/lat` 双向换算 | 必须纯函数、易测试 |
| `GeoLookupService` | 国家边界命中与城市匹配 | 负责真实地点判断 |
| `StorageRepository` | `seed + localStorage` 合并读取与写回 | 负责版本与容错 |

### Data Flow

```text
用户点击地图
    -> WorldMapView 计算相对点击坐标
    -> ProjectionService 将屏幕坐标转换为 lng/lat
    -> GeoLookupService 用边界数据判断国家/地区
    -> 可选城市数据做最近城市匹配
    -> useMapPoints 创建 MapPoint
    -> StorageRepository 持久化
    -> DetailDrawer 打开并展示当前点位
```

### Build Order

1. 应用骨架与响应式地图布局
2. 固定投影底图与点击坐标采集
3. 点位渲染与基础状态管理
4. `seed + localStorage` 数据层
5. `ProjectionService`
6. `GeoLookupService` 的国家级命中
7. 详情抽屉编辑闭环
8. 可选城市匹配增强

## Component Boundaries

### UI Layer

- 组件只负责交互与表现，不直接处理地理算法
- 地图组件输出点击事件与当前选中状态
- 抽屉组件只处理当前点位的查看与编辑

### Domain Layer

- 点位 store 是地图与抽屉共享状态的唯一来源
- 点位创建必须走统一服务，不能在组件中直接拼装数据

### Geo Layer

- 投影换算与边界命中分为两个独立服务
- 地理数据在初始化后以只读形式供服务消费
- 城市级匹配必须建立在国家级识别之后

### Persistence Layer

- 本地存储只保存业务数据，不保存地理边界原始数据
- 种子数据只读，本地用户数据具有更高优先级

## Suggested Build Modules

### UI Modules

- `src/components/WorldMapView.vue`
- `src/components/MapMarkerLayer.vue`
- `src/components/DetailDrawer.vue`

### Domain Modules

- `src/stores/mapPoints.ts`
- `src/types/map-point.ts`

### Geo Modules

- `src/services/projection.ts`
- `src/services/geo-lookup.ts`
- `src/data/geo/countries.*`
- `src/data/geo/cities.json`

### Persistence Modules

- `src/services/storage-repository.ts`
- `src/data/seed-points.json`

## Architecture Risks

| Risk | Why It Matters | Prevention |
|------|----------------|------------|
| 投影规则与底图不一致 | 会导致点击地点判断整体偏移 | 尽早锁定地图底图与投影契约，并做参考点测试 |
| 地理边界数据过重 | 会拖慢首屏与点击命中速度 | 做简化、bbox 索引与按需加载 |
| 抽屉编辑状态和地图选择态分裂 | 容易造成错误保存或脏数据丢失 | 使用单一 store 管理选中点位与编辑流程 |

## Sources

- [PRD.md](/Users/huangjingping/i/trip-map/PRD.md) — 产品目标与模块边界约束
- 子研究摘要：Architecture 维度 — GSD 并行研究结果

---
*Architecture research for: 旅行世界地图*
*Researched: 2026-03-23*
