# Feature Landscape: 旅行世界地图 v2.0

**Scope:** 仅覆盖本 milestone 新增能力：城市优先选择、真实城市边界高亮、浮动 popup 详情、原创二次元可爱视觉改版
**Researched:** 2026-03-25
**Overall confidence:** MEDIUM

## Scope Guardrails

- 复用 `v1` 已有世界地图、点位 CRUD、本地持久化、响应式 drawer。
- 本文件不覆盖富内容、同步、分享、账号、社交、统计系统。
- 目标是把“城市级选择体验”做成主交互，而不是把产品扩成通用地图平台。

## Table Stakes

| Theme | Feature | User-facing behavior | Complexity | Prerequisites | Notes |
|-------|---------|----------------------|------------|---------------|-------|
| 城市优先选择 | 城市候选优先入口 | 用户可以从城市候选或搜索结果开始选点，也可以点地图后优先获得城市级候选，而不是被迫精准点击极小区域 | MEDIUM | 城市数据索引、名称标准化 | 同类旅行记录产品普遍支持按城市检索或直接标记城市 |
| 城市优先选择 | 明确的城市失败回退 | 当系统无法可靠命中城市时，必须明确提示并回退到国家/地区级，而不是静默创建错误城市 | HIGH | 城市命中置信度、回退规则 | 这是从 `v1` 国家级识别升级到城市优先时的可信度底线 |
| 城市优先选择 | 同名城市消歧 | 同名城市或边界附近点击时，用户可以看到带国家/州信息的候选列表并确认最终城市 | HIGH | 稳定 `cityId`、所属上级区域元数据 | 没有消歧，城市优先会快速失去可信度 |
| 城市优先选择 | 已有城市复用 | 用户再次选中已记录城市时，系统优先回到现有点位或进入编辑，而不是盲目创建重复记录 | MEDIUM | 城市 identity 映射、已有点位索引 | 这是城市级产品比国家级更容易暴露的重复问题 |
| 边界高亮 | 真实城市面域高亮 | 选中城市后，地图高亮真实城市边界的填充和描边，而不是只亮一个 pin | HIGH | 城市边界 polygon 数据、选中态渲染层 | 这是本 milestone 最关键的“看得见的升级” |
| 边界高亮 | 稳定的选中态切换 | hover、selected、关闭 popup、切换城市后，高亮状态切换一致且不会残留错误面域 | MEDIUM | 单一选中态源、边界 layer 状态管理 | 需要避免多处状态分别控制导致闪烁或残影 |
| Popup 详情 | 轻量浮动摘要卡 | 选中城市后出现浮动 popup，展示城市名、国家/地区、访问状态、简介摘要等最小必要信息 | MEDIUM | 选中城市状态、popup 锚点策略 | popup 应该是“确认与预览”，不是完整编辑器 |
| Popup 详情 | popup 到 drawer 的接力 | popup 内提供查看详情、编辑、切换状态等快捷动作，复杂编辑继续复用现有 drawer | MEDIUM | 与现有 drawer 的状态联动 | 这样能新增轻量反馈，又不复制一套表单 |
| Popup 详情 | 小屏安全展示 | 在移动端，popup 必须自动避开边缘或退化为底部 peek 卡片，不能遮挡主要地图内容或跑出屏幕 | MEDIUM | 响应式定位、边界碰撞处理 | 地图产品的 popup 在移动端最容易出现遮挡问题 |
| 可爱视觉改版 | 统一的视觉语言 | marker、边界高亮、popup、drawer、按钮、空状态要使用同一套颜色、圆角、插画和字体语气 | MEDIUM | 设计 token、组件样式收口 | 不统一就会像“旧 UI 上贴新皮肤” |
| 可爱视觉改版 | 可爱但不牺牲可读性 | 新风格必须保留足够对比度、可点击热区、状态区分和地图可读性 | MEDIUM | 颜色与尺寸规范、可访问性检查 | 视觉改版不能压过地图交互本身 |

## Differentiators

| Theme | Feature | User-facing behavior | Complexity | Prerequisites | Notes |
|-------|---------|----------------------|------------|---------------|-------|
| 城市优先选择 | 视口/最近使用快捷城市 | 用户在当前地图区域或最近使用列表中快速选择城市，而不是每次都重新搜 | MEDIUM | 城市索引、最近选择记录 | 这是“城市优先”从能用到顺手的关键增强 |
| 城市优先选择 | 宽容命中区 | 对小城市、狭长城市或边界附近点击，系统通过最近边界/候选规则给出更宽容的命中体验 | HIGH | 城市边界数据、距离或面积启发式 | 可明显改善“点不中城市”的主观感受 |
| 边界高亮 | 城市状态视觉语法 | 未记录、已记录、当前选中、待确认等状态在边界和 marker 上有统一且一眼可懂的视觉差异 | MEDIUM | 状态模型、设计 token | 比单纯换颜色更有产品完成度 |
| Popup 详情 | 低摩擦快捷动作 | popup 内直接提供“标记去过/取消点亮/查看详情”等 1-2 个高频动作 | MEDIUM | 点位状态更新链路 | 能减少每次都打开 drawer 的操作成本 |
| Popup 详情 | 智能定位与避让 | popup 根据边界中心、点击点或 marker 自动选择锚点，尽量不挡住当前城市 | HIGH | popup offset、边缘碰撞处理 | 这是地图 popup 看起来“专业”的细节 |
| 可爱视觉改版 | 角色化空状态与成功反馈 | 空地图、首次添加、保存成功等时刻有统一的原创可爱插画或轻动画反馈 | MEDIUM | 插画资产、动效规范 | 适合强化“二次元可爱”记忆点，但应控制在少量关键时刻 |
| 可爱视觉改版 | 地图友好的装饰性动效 | 选中城市或保存成功时提供短促、克制的 halo/sparkle 动效，而不是持续占据注意力 | MEDIUM | 动效 token、性能预算 | 差异化强，但必须受性能和干扰度约束 |

## Anti-Features

| Anti-Feature | Why Avoid Now | What to Do Instead |
|--------------|---------------|--------------------|
| 全量全球地点搜索到乡镇/POI/景点级 | 数据清洗、别名、排序和性能成本会快速失控，远超“城市优先”范围 | 先只支持受控的城市级数据集和明确的覆盖范围 |
| 在线 geocoding / autocomplete API | 与项目“本地离线识别”方向冲突，并引入网络依赖、成本与隐私问题 | 继续坚持本地城市索引和本地边界数据 |
| 全面改造成 slippy map（连续缩放、拖拽、倾斜、瓦片体系） | 这是地图引擎级重构，不是本 milestone 的核心问题 | 在现有固定世界地图上先把城市识别、边界高亮和 popup 做稳 |
| 让 popup 承担完整编辑表单 | 会复制 drawer 能力，导致两套编辑入口长期分裂 | popup 只做摘要和高频快捷动作，完整编辑继续进入 drawer |
| 用户手动画城市边界或修正 polygon | 会把产品拖向 GIS 工具，复杂度和错误处理都显著上升 | 对无法稳定命中的情况提供候选确认或国家级回退 |
| 统计面板、排行榜、成就系统 | 很容易膨胀成另一条产品线，且不直接解决本 milestone 核心体验 | 先把选城市、看边界、看详情这条主链路完成 |
| bucket list、路线规划、行程时间线 | 虽然和城市选择相邻，但会把模型从“旅行足迹”扩展到“旅行规划” | 本期最多保留简单状态切换，不做规划系统 |
| 每个城市一套独立插画、Live2D mascot、重动效主题皮肤 | 资产生产成本过高，极易拖慢交付并影响性能 | 做一套统一的原创可爱视觉规范和少量复用插画 |
| 全站所有界面同步重设计 | 范围过大，且风险会扩散到与 milestone 无关的区域 | 只重做与地图主链路直接相关的界面表面：地图、marker、popup、drawer、按钮、空状态 |

## Feature Dependencies

```text
城市数据标准化
  -> 城市搜索/候选入口
  -> 同名城市消歧
  -> 稳定 cityId

稳定 cityId
  -> 已有城市复用
  -> 城市边界 lookup
  -> popup 内容绑定

城市边界 polygon 数据
  -> 真实边界高亮
  -> 宽容命中区
  -> popup 智能定位

popup 摘要卡
  -> 高频快捷动作
  -> 打开现有 drawer 做完整编辑

视觉 token / 插画规范
  -> marker 改版
  -> 边界高亮风格
  -> popup / drawer 改版
  -> 可选的轻动效反馈
```

## MVP Recommendation

优先顺序建议：

1. 城市候选解析、同名消歧、失败回退先做稳。
2. 真实城市边界高亮与状态切换紧接着落地。
3. 浮动 popup 只做摘要与快捷动作，并与现有 drawer 打通。
4. 在交互链路稳定后，再统一 marker、popup、边界与 drawer 的可爱视觉语言。
5. 最后再加最近使用城市、智能避让、轻动效、角色化反馈等差异化增强。

明确延后：

- 富内容 popup
- 统计/成就/排行榜
- bucket list 与路线规划
- 导入导出、分享、同步
- 全量地图引擎重构

## Sources

- [`.planning/PROJECT.md`](/Users/huangjingping/i/trip-map/.planning/PROJECT.md) — 项目边界与既有能力基线
- [`.planning/milestones/v1.0-REQUIREMENTS.md`](/Users/huangjingping/i/trip-map/.planning/milestones/v1.0-REQUIREMENTS.md) — 既有 requirement 基线，确认哪些能力应复用而非重做
- `Been` 产品页（MEDIUM）: https://been.travel/ — 当前同类产品把“countries / cities / regions”并列为用户可标记层级
- `Visited Cities` 产品页（MEDIUM）: https://www.visitedcities.com/ — 强调“pin the exact cities, towns, and villages”与城市级追踪是卖点
- `Visited Cities` Google Play（MEDIUM）: https://play.google.com/store/apps/details?hl=en_US&id=com.bolsos.visited — 当前同类产品默认用户期望城市级追踪、wishlist、stats
- `Visited App` App Store / 官网（MEDIUM）: https://apps.apple.com/us/app/visited-travel-tracker-map/id846983349 , https://visitedapp.com/ — 说明旅行地图产品常见扩展方向，但这些不应自动进入本 milestone
- `Countries Been`（MEDIUM）: https://www.countriesbeen.com/ — 展示城市数量级和浏览器本地保存/跨设备扩展是相邻方向，但非本期核心
- `Polarsteps` 计划目的地帮助文档（MEDIUM）: https://support.polarsteps.com/hc/en-us/articles/24265886208914-How-do-I-plan-my-trip — 体现“输入搜索或地图选点”是常见 destination 选择模式
- `MapLibre GL JS` popup 与 polygon 示例（HIGH）: https://maplibre.org/maplibre-gl-js/docs/examples/display-a-popup-on-click/ , https://maplibre.org/maplibre-gl-js/docs/examples/show-polygon-information-on-click/ , https://maplibre.org/maplibre-gl-js/docs/API/classes/Popup/ — 支持 popup、polygon click、offset/padding 等交互模式
- `MapLibre Style Spec` feature-state（HIGH）: https://maplibre.org/maplibre-style-spec/expressions/ — 支持 hover/selected 等边界状态渲染
- `Google Maps` marker accessibility（HIGH）: https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers — 支持可点击、可聚焦、增大热区、键盘触发等交互可达性原则
- `Microsoft Azure Maps` accessibility（MEDIUM）: https://learn.microsoft.com/en-us/azure/azure-maps/map-accessibility — 支持 popup 键盘可达、颜色对比、避免仅依赖 hover 的地图 UX 原则

## Confidence Notes

- `城市优先选择 / popup / 边界高亮`: MEDIUM-HIGH。竞品模式与地图 SDK 文档较一致。
- `可爱视觉改版`: MEDIUM。外部资料更适合提供可读性和可访问性约束，具体“原创二次元可爱”风格仍应由产品方向主导。
