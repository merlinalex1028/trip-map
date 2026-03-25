# Domain Pitfalls

**Domain:** 旅行世界地图 v2.0 增量改造（城市优先选择、真实城市边界高亮、浮动详情弹层、可爱视觉重设计）
**Researched:** 2026-03-25
**Confidence:** HIGH

## Recommended Phase Buckets

| Phase | Focus | Why this phase should absorb risk |
|-------|-------|-----------------------------------|
| Phase 1 | 数据契约与 v1 存档迁移 | 先处理 point-first 到 city-first 的模型升级，后面交互才不会建立在错误数据上 |
| Phase 2 | 城市边界数据、命中引擎与高亮契约 | 所有“看到什么 / 选中什么 / 保存什么”必须共用同一套城市实体定义 |
| Phase 3 | Popup 交互、选择态状态机与移动端回退 | 现有抽屉流已成事实标准，弹层不能直接硬套 |
| Phase 4 | 可爱视觉重设计、可访问性与回归验证 | 重设计最容易在最后阶段破坏可见性、对比度和旧功能 |

## Current Integration Constraints

- 当前状态核心仍是 point-first：`selectedPointId`、`draftPoint`、`activePoint`、`drawerMode` 都围绕“点位”运转，见 `src/stores/map-points.ts`。
- 当前地图点击入口是整个 stage surface；marker 只是单独的按钮层，见 `src/components/WorldMapStage.vue`。
- 当前详情交互假设是非模态抽屉，并内置自己的焦点循环，见 `src/components/PointPreviewDrawer.vue`。
- 当前本地持久化仍是 `trip-map:point-state:v1`，schema 只保存点位，不保存城市边界身份或数据版本，见 `src/services/point-storage.ts`。

## Critical Pitfalls

### Product Pitfalls

| Pitfall | Why this milestone is exposed | Warning Signs | Prevention | Absorb In |
|---------|-------------------------------|---------------|------------|-----------|
| 把“城市优先”理解成“一个城市只能有一个点” | v1 的核心实体是旅行点位，不是城市；如果 v2 直接按城市去重，会把多次到访、不同年份、不同主题行程压扁 | 用户原有多个同城记录被合并；“去过东京两次”只能留下一个；删除一次访问误删整座城市 | Phase 1 先定清楚实体关系：`visit` 和 `destination/city` 是否分层；至少允许“城市高亮 + 多次访问记录”并存 | Phase 1 |
| 城市优先后没有定义低置信度降级策略 | v1 允许国家/地区级回退；v2 如果只接受城市，会在离线数据不完整或边界密集区域失去可信度 | 一点击就误命中错误城市；以前能保存国家，现在反而保存失败；用户无法理解“为什么这次不行” | 保留分级精度契约：`city-confirmed`、`city-approximate`、`country-fallback`；低置信度必须显式提示并允许继续保存 | Phase 1 |
| 可爱重设计压过“真实地点识别”的产品可信度 | 这次视觉改动强，容易让装饰层、贴纸感、粉彩色系遮蔽真实地理反馈 | 用户看不出“已访问 / 当前选中 / 草稿 / 低置信度”的差异；地图像海报，不像可操作工具 | 先定义语义状态色和层级，再做风格化；装饰层不得承担核心状态表达 | Phase 4 |

### Data Pitfalls

| Pitfall | Why this milestone is exposed | Warning Signs | Prevention | Absorb In |
|---------|-------------------------------|---------------|------------|-----------|
| 沿用 v1 point schema，不引入城市身份字段 | 当前存储只有 `lat/lng/x/y/name/countryCode`，没有 `cityId`、`boundaryId`、`datasetVersion` | 刷新后高亮城市变了；同一地点在不同数据版本映射到不同城市；无法稳定回放旧数据 | 为 v2 增加非破坏式 schema：保留原始坐标，同时新增 `resolvedPlaceId`、`resolvedPlaceType`、`boundaryDatasetVersion`、`resolutionConfidence` | Phase 1 |
| 直接批量把 v1 历史点迁移成城市记录，造成数据漂移 | 旧数据里有大量国家级或“近似城市”点；`city-high/city-possible` 不是边界级真值 | 历史“Portugal”被硬改成某个城市；旧 seed 点名称、国家、边界高亮不一致；用户感觉数据被篡改 | 迁移采用懒解析和可回退策略：旧点默认保留原语义，只在高置信度时附加城市映射，不覆盖原名称 | Phase 1 |
| 城市边界数据口径不统一，导致“看到的城市”和“保存的城市”不是同一个 | v1 `geo-lookup` 只处理国家/地区边界与候选城市点；v2 需要真实城市 polygon / multipolygon / 洞区规则 | 飞地、岛屿、港澳等边界异常；高亮覆盖海域；同城不同缩放级别下名字变化 | 只选一套主数据源并在离线预处理阶段统一 `placeId`、命名、bbox、简化规则；不要运行时拼接多套来源 | Phase 2 |
| 预置 seed 点继续按旧点位逻辑存在，和城市实体脱节 | 当前 seed 合并逻辑只会覆盖名称/描述/featured，不理解“城市实体” | seed 点显示在 A 城，点击后高亮 B 城；隐藏 seed 后城市仍被算作访问；演示数据比真实用户数据更乱 | 让 seed 数据也落到同一 city-first 契约里，至少具备稳定 `resolvedPlaceId`，并在迁移中统一 | Phase 1 |

### UX Pitfalls

| Pitfall | Why this milestone is exposed | Warning Signs | Prevention | Absorb In |
|---------|-------------------------------|---------------|------------|-----------|
| 把命中区从“宽松城市候选半径”退回“必须精准点中城市边界” | v1 为城市识别做了宽容半径；v2 如果改成纯 polygon 命中，移动端会明显退化 | 同样位置现在经常点不中；用户必须反复点边界内部；小城市在手机上几乎不可选 | 保留宽容命中策略：视觉上高亮真实边界，交互上允许 snapping / nearest-city confirm，而不是只靠像素级点中 | Phase 2 |
| 交互式 popup 被当成 tooltip 实现 | 浮动详情包含按钮、编辑入口、关闭动作，这不是 tooltip 语义 | 键盘焦点跳到背景层；读屏不宣布上下文；Esc、外部点击、再次点击地图行为不一致 | 把弹层定义为非模态 dialog / popover card；可编辑内容不要用 tooltip 语义；移动端保留 sheet/drawer 回退 | Phase 3 |
| popup 锚点与可视区域处理不完整 | 当前地图 surface 是 `overflow: hidden`，移动端还有软键盘和 visual viewport 变化 | 弹层被地图容器裁切；靠边城市弹层出框；输入时软键盘遮挡表单；缩放后箭头指错位置 | 弹层用 `Teleport` 脱离地图容器；位置基于 anchor rect + viewport 约束；监听 resize、scroll、visual viewport 变化重算 | Phase 3 |
| 可爱重设计牺牲对比度、字号和触控尺寸 | 这次不是小修色板，而是原创新风格；最容易把“可爱”做成“难用” | 粉色边界叠在旧地图上看不见；按钮不足 44px；选中态只靠微弱阴影和闪光粒子 | 先建立可读性底线：状态对比、最小点击区、动效预算、文字层级，再叠风格语言 | Phase 4 |

### Implementation Pitfalls

| Pitfall | Why this milestone is exposed | Warning Signs | Prevention | Absorb In |
|---------|-------------------------------|---------------|------------|-----------|
| 视觉高亮和逻辑命中使用两套城市定义 | 最常见做法是“高亮 polygon，保存时还是按最近候选点”，但这会破坏可信度 | 用户点中高亮城市却保存成别的城市；同一城市高亮与详情标题不一致 | 高亮、命中、保存、popup 标题都必须由同一个 `resolvedPlace` 结果驱动，不能各算各的 | Phase 2 |
| 继续沿用 `selectedPointId + drawerMode` 驱动 popup | 当前状态机把“选中了谁”和“如何展示”绑在一起；换成弹层后会引入 anchor、dismiss reason、presentation mode | 点击地图后状态残留；编辑态关闭后又回到错误实体；切换城市时旧 draft 被意外清掉 | Phase 3 先拆状态：`selection`、`draft/edit`、`overlayPresentation` 分层；抽屉与 popup 共享实体，不共享展示状态 | Phase 3 |
| marker 层、边界层、popup 锚点同时可点，事件互相抢占 | 当前 map click 入口在 surface，marker 另有按钮层；新增 polygon 后更容易出现 pointer-events 混乱 | 点击 marker 实际触发底图；点击边界后又冒泡触发 map click；一个点击打开两次 | 统一事件策略：定义单一主命中层；明确哪些层 `pointer-events: none/auto`；写回归用例覆盖 marker、boundary、empty-state 三类点击 | Phase 3 |
| 大型城市 GeoJSON 被放进响应式 store 或每次点击全量遍历 | v1 只处理国家边界 + 少量点；城市边界数量和复杂度会高很多 | 首屏 bundle 明显增大；点击延迟；切换城市时主线程卡顿；移动端掉帧 | 几何数据保持不可变和可索引：预构建 bbox/spatial index、按区域懒加载、store 只存 id 和样式状态，不存整块 geometry | Phase 2 |
| 仍然沿用 `localStorage` 同步写入大对象 | 当前 `localStorage.setItem` 是同步调用；如果未来把更多派生城市信息一并写入，交互会卡顿 | 保存地点时明显卡一下；写入失败后整份存档损坏；私密模式或额度限制下出现异常 | 存储层只写最小业务事实，不写可再生成的几何和高亮缓存；增加版本迁移、写入保护和失败回退 | Phase 1 |
| 测试仍围绕“marker + drawer”老契约，导致迁移后无保护网 | 当前黑盒断言大量针对 marker `aria-label` 和抽屉流程；v2 会改动主交互骨架 | UI 看起来能用，但城市边界、popup 焦点、旧存档迁移频繁回归；上线后才发现 | 在 Phase 4 前补齐新回归矩阵：旧存档迁移、边界命中、低置信度降级、popup 键盘流、移动端回退 | Phase 4 |

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| 数据迁移 kickoff | 一开始就把全部旧点强转成城市 | 先做可选字段和惰性解析，不覆盖旧名称与旧精度 |
| 城市边界引入 | 先做 UI 高亮，后补命中逻辑 | 先锁定 `resolvedPlace` 契约，再画边界 |
| Popup 首版 | 直接把抽屉 DOM 改成漂浮定位 | 保留抽屉 fallback，先拆状态机，再替换表现层 |
| 可爱视觉重设计 | 先上新配色和装饰，再补状态层级 | 先通过状态对比和命中可见性基线，再加风格化元素 |
| 验收阶段 | 只测新 UI，不测旧存档和边缘边界 | 验收用例必须覆盖 v1 存档、密集城市、边界附近和移动端 |

## Sources

- Internal code context:
  - `src/stores/map-points.ts`
  - `src/components/WorldMapStage.vue`
  - `src/components/PointPreviewDrawer.vue`
  - `src/services/point-storage.ts`
- Project planning context:
  - `.planning/PROJECT.md`
  - `.planning/STATE.md`
  - `.planning/milestones/v1.0-REQUIREMENTS.md`
- Official references:
  - RFC 7946 GeoJSON specification: https://datatracker.ietf.org/doc/html/rfc7946
  - D3 `geoContains` API: https://d3js.org/d3-geo
  - WAI-ARIA APG dialog guidance: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
  - Vue Teleport guide: https://vuejs.org/guide/built-ins/teleport
  - MDN Web Storage API / quotas: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
  - MDN Visual Viewport API: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API

---
*Pitfalls research for milestone focus: city-first destination selection + boundary highlighting + popup interactions + cute redesign on top of an existing offline travel map*
