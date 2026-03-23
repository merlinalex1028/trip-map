# Pitfalls Research

**Domain:** 离线真实地点识别地图产品
**Researched:** 2026-03-23
**Confidence:** HIGH

## Critical Pitfalls

### Projection & Coordinate Errors

| Pitfall | Warning Signs | Prevention | Phase |
|---------|---------------|------------|-------|
| 底图投影与坐标换算不一致 | 同一点在不同尺寸下命中结果变化，海岸线附近误判明显 | 固定地图资产与投影契约，建立参考点测试 | Phase 1-2 |
| 忽略容器缩放、留白和 letterboxing | 桌面可用、移动端错位 | 所有点击都基于实际渲染矩形换算，不直接用原始视口 | Phase 1 |

### Geo Data & Hit Testing

| Pitfall | Warning Signs | Prevention | Phase |
|---------|---------------|------------|-------|
| 点在多边形判断对 multipolygon / holes 处理不完整 | 岛屿国家、湖泊、边界区域判断错误 | 使用成熟点面判断库并配合 bbox 预过滤 | Phase 2 |
| 反经线与边界异常处理不足 | 阿拉斯加、俄罗斯、太平洋附近国家误判 | 预先选定数据集并验证 dateline 相关样本 | Phase 2 |
| 地理数据口径与产品口径不一致 | 用户看到国家命名或归属与预期冲突 | 在数据层明确 ISO 代码、地区命名和领土策略 | Phase 2 |

### Performance & Bundle Size

| Pitfall | Warning Signs | Prevention | Phase |
|---------|---------------|------------|-------|
| 前端加载超大 GeoJSON | 首屏慢、点击卡顿、移动端掉帧 | 使用简化后的边界数据、TopoJSON 或预索引结构 | Phase 2 |
| 每次点击全量遍历所有边界 | 命中延迟明显上升 | 先做 bbox 粗过滤，再做精确 point-in-polygon | Phase 2 |

### Persistence & Merge Logic

| Pitfall | Warning Signs | Prevention | Phase |
|---------|---------------|------------|-------|
| `seed` 数据重复灌入或覆盖用户编辑 | 刷新后出现重复点位或用户改动丢失 | 定义稳定 ID、只读种子、用户数据优先合并 | Phase 3 |
| `localStorage` 无版本与迁移 | 数据结构升级后读取失败 | 为本地存储增加版本号与迁移函数 | Phase 3 |

### Drawer & Editing UX

| Pitfall | Warning Signs | Prevention | Phase |
|---------|---------------|------------|-------|
| 地图选择态与抽屉编辑态双源管理 | 保存错点位、关闭后状态残留 | 以单一 store 统一管理选中与编辑状态 | Phase 3-4 |
| 未保存新建点位无法取消清理 | 误触后地图残留空点位 | 新建流程必须支持取消并回滚临时点位 | Phase 3 |

## Top Pitfalls

1. **投影契约没有提前锁死** — 这是所有真实点位识别的前提
2. **国家边界命中逻辑过于天真** — 会在边界、岛屿、洞区上快速失去可信度
3. **把城市级识别当成 v1 基础能力** — 很容易拖慢项目并带来错误地点
4. **本地存储与 seed 合并规则不明确** — 后续会出现重复、覆盖和迁移问题
5. **地图与抽屉状态脱节** — 最终体现为“看起来能用，但总是保存错地方”

## Phase Implications

- **Phase 1** 先锁定地图资产、响应式布局和点击坐标采集方式
- **Phase 2** 把国家边界命中准确性做稳，再谈城市级增强
- **Phase 3** 先建立可靠的数据持久化和编辑闭环
- **Phase 4** 再做可用性、移动端体验和异常提示打磨

## Sources

- [PRD.md](/Users/huangjingping/i/trip-map/PRD.md) — 产品边界与风险上下文
- 子研究摘要：Pitfalls 维度 — GSD 并行研究结果

---
*Pitfalls research for: 旅行世界地图*
*Researched: 2026-03-23*
