# Project Research Summary

**Project:** 旅行世界地图
**Domain:** 离线真实地点识别的旅行地图产品
**Researched:** 2026-03-23
**Confidence:** MEDIUM

## Executive Summary

这个项目本质上不是一个“随便在地图上打点”的视觉化页面，而是一个以真实地点判断为核心可信度的前端地图产品。v1 最合理的实现路径是固定投影世界地图 + 本地静态国家边界数据 + 点击命中判断 + 本地持久化，而不是从在线地图引擎或在线地理编码服务切入。

从实现策略上，应该优先保证国家/地区级识别的稳定性，并把城市级识别视为增强能力。技术上最关键的前置决策是锁定地图底图与投影契约，因为后续的点击坐标换算、点位渲染和地理命中都会依赖这套规则。

## Key Findings

### Recommended Stack

推荐基于 `Vue 3 + Vite + TypeScript + Pinia` 搭建前端主干，用 `d3-geo` 负责固定投影坐标换算，用 `@turf/boolean-point-in-polygon` 负责国家边界命中。该组合兼顾可实现性、类型安全和后续演进空间。

**Core technologies:**
- Vue 3.5.x: UI 和交互主框架 — 官方主线，适合高交互单页应用
- Vite 8.x: 开发与构建工具链 — 启动快、配置轻
- TypeScript 5.9.x: 类型系统与服务接口约束 — 适合地理识别与数据建模
- Pinia 3.x: 状态管理 — 统一点位、选中态和持久化状态

### Expected Features

v1 的 table stakes 很清晰：世界地图展示、国家级真实地点识别、点位 CRUD、高亮反馈、详情抽屉，以及 `seed + localStorage` 的数据闭环。这些是产品成立的必要条件，而不是锦上添花。

**Must have (table stakes):**
- 世界地图可交互展示
- 国家/地区级离线地点识别
- 点位创建、编辑、删除与高亮
- 详情抽屉与基础信息维护
- 本地持久化与种子数据加载

**Should have (competitive):**
- 更顺滑的点击到反馈链路
- 清晰的数据模型与迁移能力
- 城市级识别预留设计

**Defer (v2+):**
- 富媒体旅行内容
- 导入导出与云同步
- 分享与社交能力

### Architecture Approach

建议按 `UI -> Domain -> Geo -> Persistence` 四层划分。地图组件负责点击与展示，投影服务负责 `x/y <-> lng/lat`，地理服务负责国家与可选城市命中，状态层负责点位数据与本地持久化。这样最容易把高风险的地理逻辑与 UI 逻辑分开测试和演进。

**Major components:**
1. `WorldMapView` / `MapMarkerLayer` — 地图与点位渲染
2. `ProjectionService` / `GeoLookupService` — 投影换算与真实地点识别
3. `useMapPoints` / `StorageRepository` — 点位状态与本地持久化

### Critical Pitfalls

1. **投影规则与底图不匹配** — 先锁定地图资产与投影契约
2. **国家边界命中过于天真** — 使用成熟点面判断并处理 multipolygon
3. **地理数据过大导致点击卡顿** — 先做数据简化与 bbox 预过滤
4. **seed 与本地数据合并规则不清晰** — 明确稳定 ID 和用户优先策略
5. **地图与抽屉状态双源管理** — 使用单一 store 控制选中与编辑流程

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: 地图基础与投影契约
**Rationale:** 地图资产、布局与坐标采集是所有后续能力的前提
**Delivers:** 可交互的世界地图底图、响应式框架、基础点位渲染骨架
**Addresses:** 地图主视图与交互容器
**Avoids:** 因底图/投影不一致导致后续全部返工

### Phase 2: 国家级真实地点识别
**Rationale:** 产品核心价值必须尽早验证
**Delivers:** 点击地图后完成 `x/y -> lng/lat -> country` 识别链路
**Uses:** `d3-geo`、静态国家边界数据、point-in-polygon
**Implements:** Geo 识别核心能力

### Phase 3: 点位闭环与本地持久化
**Rationale:** 点位的创建、编辑与刷新后保留是产品可用性的底线
**Delivers:** 点位 CRUD、详情抽屉、`seed + localStorage` 合并
**Uses:** Pinia 与本地存储仓储层
**Implements:** Domain 与 Persistence 主干

### Phase 4: 打磨、降级与增强
**Rationale:** 在核心链路可用后再补足异常处理、移动端体验和城市级增强入口
**Delivers:** 更稳的可用性、提示反馈、可选城市匹配

### Phase Ordering Rationale

- 先锁定地图与投影，再做地点命中，避免算法建立在错误坐标系上
- 把国家级识别与点位 CRUD 分开，可降低调试复杂度
- 城市级匹配放到最后，可避免其复杂度吞掉 MVP 节奏

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** 地理数据来源、投影一致性、边界命中性能
- **Phase 4:** 城市数据规模、城市匹配阈值与 UX 提示策略

Phases with standard patterns (skip research-phase):
- **Phase 1:** 项目脚手架、响应式地图壳层
- **Phase 3:** 本地存储、抽屉编辑与基础状态管理

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | 主框架方案稳定，但部分支持库版本会随时间推进 |
| Features | HIGH | PRD 范围清晰，v1 与 v2 边界稳定 |
| Architecture | HIGH | 组件和服务边界较明确 |
| Pitfalls | HIGH | 风险集中在地图/投影/数据链路，已明确识别 |

**Overall confidence:** MEDIUM

### Gaps to Address

- 精确使用哪种世界底图与投影，需要在 Phase 1 规划时彻底定死
- 城市级识别的数据来源、精度与包体成本需要在后续增强阶段重新评估

## Sources

### Primary (HIGH confidence)
- [PRD.md](/Users/huangjingping/i/trip-map/PRD.md) — 已确认产品范围
- [.planning/research/STACK.md](/Users/huangjingping/i/trip-map/.planning/research/STACK.md) — 推荐技术栈
- [.planning/research/FEATURES.md](/Users/huangjingping/i/trip-map/.planning/research/FEATURES.md) — 功能层研究
- [.planning/research/ARCHITECTURE.md](/Users/huangjingping/i/trip-map/.planning/research/ARCHITECTURE.md) — 架构层研究
- [.planning/research/PITFALLS.md](/Users/huangjingping/i/trip-map/.planning/research/PITFALLS.md) — 风险层研究

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*
