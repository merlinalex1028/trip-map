# Phase 3: 点位闭环与本地持久化 - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只负责把 Phase 2 的“国家/地区识别成功”结果接入完整点位闭环：用户可以基于识别结果创建旅行点位、在详情抽屉中查看与编辑基础内容、删除自建点位，并通过本地持久化在刷新后恢复数据。Phase 3 不扩展城市级增强、异常降级完善、长文本极限布局或更强的可访问性打磨；这些继续留在后续阶段。

</domain>

<decisions>
## Implementation Decisions

### 新建点位的保存时机
- 识别成功后不自动落盘，而是进入“新建草稿”状态
- 地图上会立即显示一个明显的临时点位，用来表达“这个位置已识别但尚未保存”
- 新建草稿关闭抽屉时，视为取消创建，临时点位直接消失，不保留未保存草稿
- 如果已有未保存草稿时再次点击新的有效地点，新点击会覆盖当前草稿，并先给出“旧草稿将被丢弃”的提示

### 抽屉模式与字段范围
- 新识别出的草稿点位，抽屉默认先展示识别结果，不直接进入编辑态
- 用户已保存的点位，再次打开时默认进入查看态，需要用户主动点击“编辑”
- 预置 `seed` 点位允许编辑，且只开放 `名称`、`简介`、`点亮状态` 三个字段
- Phase 3 不加入图片、标签、游记或时间线等富内容字段
- 预置 `seed` 点位的编辑结果保存到本地覆盖层，而不是复制成新的用户点位

### 取消、关闭与删除语义
- 编辑已保存点位时，如果存在未保存修改，关闭抽屉前需要二次确认；没有改动则直接关闭
- 已保存点位在编辑态点击“取消”后，回到查看态，并恢复到上一次保存的内容
- 删除用户自建点位时需要二次确认，确认后立即删除
- 预置 `seed` 点位允许被用户隐藏，不仅仅是恢复默认覆盖

### 本地存储合并与持久化结构
- 编辑预置 `seed` 点位时，本地层保存同 `id` 的覆盖记录，运行时覆盖原始 `seed`
- 隐藏预置 `seed` 点位时，合并结果中直接移除该点位，不保留弱化占位态
- 本地持久化结构拆分为三个集合：`userPoints`、`seedOverrides`、`deletedSeedIds`
- 当本地存储损坏、字段非法或版本不兼容时，Phase 3 采用显式告知策略：提示用户本地存档异常，并要求用户手动清空后继续，而不是静默自动回退

### Claude's Discretion
- 草稿点位、正式点位和选中点位之间的具体视觉差异实现
- “旧草稿将被丢弃”与“存在未保存修改”的具体提示文案和展现位置
- 查看态与编辑态在同一个抽屉中的排版方式
- 本地存储异常提示中的按钮样式、文案细节和清空流程入口

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `PRD.md` — 产品目标、真实点位判断要求、点位编辑与本地持久化的总体方向
- `.planning/PROJECT.md` — 项目核心价值、双坐标保存约束与 `seed + localStorage overlay` 总体架构
- `.planning/REQUIREMENTS.md` — Phase 3 直接对应的 `MAP-03`、`PNT-01`、`PNT-02`、`PNT-03`、`PNT-05`、`DRW-03`、`DAT-02`、`DAT-03`
- `.planning/ROADMAP.md` — Phase 3 的目标、成功标准与 03-01 / 03-02 / 03-03 计划边界

### Prior Decisions
- `.planning/phases/01-地图基础与应用骨架/01-CONTEXT.md` — 继承的海报风地图主视觉、地图优先布局与抽屉默认关闭契约
- `.planning/phases/02-国家级真实地点识别/02-CONTEXT.md` — 继承的识别成功后打开抽屉、地区名优先展示与无效点击处理方式

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/WorldMapStage.vue`：当前已经负责点击地图、完成识别并创建 `source: 'detected'` 的临时结果，是接入 Phase 3 草稿创建流程的主入口
- `src/components/PointPreviewDrawer.vue`：现有抽屉已有查看态结构和关闭逻辑，可以升级为“识别结果查看 / 已保存查看 / 编辑”三种模式
- `src/components/SeedMarkerLayer.vue`：现有点位层已支持基础选中态，可继续承接已保存点位、草稿点位和预置点位的可视化
- `src/data/preview-points.ts`：已经有 `localStorage` 读取和 `seed + saved` 合并雏形，但需要升级为三集合持久化结构
- `src/data/seed-points.ts`：预置点位已是标准 `MapPointDisplay` 数据来源，可作为 `seedOverrides` 的覆盖基底
- `src/stores/map-ui.ts`：已维护 `selectedPoint`、识别中状态和提示状态，适合扩展为草稿编辑、脏状态与抽屉模式控制

### Established Patterns
- 当前项目使用 Vue 3 Composition API + `<script setup>` + Pinia setup store
- 现有地图点击成功后会直接 `selectPoint(detectedPoint)` 并复用抽屉预览流，这意味着 Phase 3 更适合在现有流上增加草稿与保存状态，而不是重做交互入口
- 当前 `MapPointDisplay` 仍偏展示模型，Phase 3 需要补齐持久化所需的可编辑字段、来源区分和删除/隐藏语义
- `preview-points` 目前只有单一 `STORAGE_KEY` 和数组校验逻辑，后续需引入版本化或结构化持久化格式

### Integration Points
- 新建草稿、覆盖旧草稿与保存点位的状态流优先接到 `src/components/WorldMapStage.vue` 与 `src/stores/map-ui.ts`
- 抽屉查看态/编辑态切换、取消恢复与删除确认应集中在 `src/components/PointPreviewDrawer.vue` 或其后续拆分组件中
- 本地持久化读写、`seedOverrides` 合并与 `deletedSeedIds` 过滤应从 `src/data/preview-points.ts` 演进为 Phase 3 的数据入口
- 保存后的点位仍需兼容 `src/components/SeedMarkerLayer.vue` 的渲染输入，避免破坏已完成的地图展示契约

</code_context>

<specifics>
## Specific Ideas

- 新建点位的体验应像“先确认识别到了哪里，再决定要不要留下这次足迹”，而不是点一下就立刻写入存档
- 已保存点位默认先看后改，让地图保持更像旅行地图而不是后台表单
- 预置点位对用户来说也应该是可整理的资产，既能改文案，也能直接隐藏
- 本地存储异常在这一阶段优先做显式暴露，不要偷偷吞掉问题

</specifics>

<deferred>
## Deferred Ideas

- 更平滑的本地存储损坏自动回退与部分字段抢救策略 — Phase 4 `DAT-04`
- 草稿点、正式点、选中点之间更强的视觉分层与焦点表现 — Phase 4 `PNT-04` / `UX-01`
- 长文本简介的极限布局和抽屉内容韧性 — Phase 4 `UX-02`
- 城市级识别成功后的字段扩展与结果创建策略 — Phase 4 `GEO-04`

</deferred>

---
*Phase: 03-点位闭环与本地持久化*
*Context gathered: 2026-03-24*
