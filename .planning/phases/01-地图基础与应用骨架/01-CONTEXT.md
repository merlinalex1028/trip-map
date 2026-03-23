# Phase 1: 地图基础与应用骨架 - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段只交付一个可运行的前端应用骨架，包括固定投影世界地图主视图、响应式页面框架、预置点位的基础展示，以及桌面右抽屉 / 移动端底部抽屉的结构。真实地点识别、点位完整 CRUD 和本地持久化闭环属于后续阶段，不在本阶段扩展。

</domain>

<decisions>
## Implementation Decisions

### 首页视觉方向
- 首页整体风格定为探索感海报风，不走极简工具风或杂志编排风
- 视觉氛围进一步锁定为复古旅行海报感
- 地图底图采用做旧纸质地图感，而不是干净现代的纯矢量地图

### 首页信息密度
- 地图必须是首页绝对主角，首页大部分面积优先留给地图
- 首页只保留主标题和一句引导文案，不展示副标题或大段说明
- Phase 1 不展示访问统计、点位统计或明显信息卡片模块

### 预置点位呈现
- Phase 1 需要放少量示例点位，让地图第一屏看起来已经“活着”
- 示例点位以低调发光形式展示，不做过强高亮
- 示例点位与用户未来创建的点位要做轻微区分，避免混淆
- 只给少数示例点位展示常驻标签，不为所有点位显示名称

### 抽屉默认行为
- 页面初次进入时，抽屉默认收起，不主动占据地图空间
- Phase 1 中只有点击点位才会打开抽屉，不额外设置欢迎弹层或说明入口
- 抽屉在第一版更像预览卡片，优先展示地点信息，而不是强调编辑或引导

### Claude's Discretion
- 主标题的具体文案与引导句措辞
- 复古海报风中的具体字体、纹理强度、装饰元素和动画细节
- 示例点位与用户点位的具体视觉差异实现方式
- 抽屉中的信息排版、按钮样式和空白留白节奏

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `PRD.md` — 产品目标、交互要求、真实点位判断约束和阶段性技术补充
- `.planning/PROJECT.md` — 项目核心价值、非目标和全局约束
- `.planning/REQUIREMENTS.md` — Phase 1 对应的必须交付要求：`MAP-01`、`MAP-02`、`DRW-01`、`DRW-02`、`DAT-01`
- `.planning/ROADMAP.md` — Phase 1 目标、成功标准和计划拆分边界

### Research Context
- `.planning/research/SUMMARY.md` — 研究结论、Phase 1 顺序依据和前置风险
- `.planning/research/STACK.md` — Phase 1 相关的推荐技术栈与支持库
- `.planning/research/ARCHITECTURE.md` — 地图主视图、抽屉、状态层和服务边界建议
- `.planning/research/PITFALLS.md` — Phase 1 需要提前规避的投影契约和地图资产风险

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 当前仓库还没有业务代码、组件或工具函数可以复用
- 当前唯一现成资产是 `PRD.md` 与 `.planning/` 下的项目文档

### Established Patterns
- 代码层面尚未形成既有模式，需要在 Phase 1 内建立项目骨架、组件组织和状态管理约定
- 规划层面已经固定：`Vue 3 + Vite + TypeScript`、固定投影地图、桌面右抽屉 / 移动端底抽屉

### Integration Points
- 新代码将从应用入口、地图主视图、预置点位数据文件和详情抽屉组件开始建立
- Phase 1 的实现需要为后续 `ProjectionService`、`GeoLookupService` 和 `MapPoint` 状态管理预留接入点

</code_context>

<specifics>
## Specific Ideas

- 首页应该有“复古旅行海报”的第一眼印象，而不是冷静的工具面板
- 地图本体要像做旧纸质地图，保留氛围感
- 页面打开后应尽量让用户直接沉浸在地图里，不要先被抽屉、说明或统计打断
- 示例点位要让地图显得有生命力，但不能喧宾夺主
- 抽屉第一版更像一张地点预览卡，而不是完整编辑后台

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---
*Phase: 01-地图基础与应用骨架*
*Context gathered: 2026-03-23*
