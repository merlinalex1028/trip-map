# Pitfalls — v8.0 Yume Kawaii 视觉重构与登录地图体验

**研究日期:** 2026-05-09  
**范围:** 第三方 UI/图表依赖、登录门禁、地图保存能力、独立日期弹窗、手账/回忆视觉升级。

## Blocking Pitfalls

### 1. 引入 UI 库后默认样式吞掉项目风格

**风险:** Element Plus/Naive UI 默认组件视觉和当前高保图不一致，可能出现“后台系统控件贴在少女风页面上”的割裂。

**预防:**
- 只用 UI 库承接交互行为，不直接接受默认视觉。
- 建立 `KawaiiUiProvider` / theme overrides，把颜色、圆角、阴影、字体映射到项目 token。
- 对 Modal/DatePicker/Button/Menu 做最小视觉封装组件，不在页面中散落原始库组件。

### 2. UI 库全量导入导致 bundle 和 CSS 面失控

**风险:** 全量导入大型 UI 库可能显著增加首屏资源；全局 CSS 也可能覆盖现有 Tailwind token。

**预防:**
- 优先 Naive UI 或按需导入策略。
- 如果选 Element Plus，采用按需导入或只在局部组件手动导入所需组件/样式。
- 路线图中单独设“依赖接入验证”任务，跑 `pnpm --filter @trip-map/web build` 并检查页面基线。

### 3. `/` 从地图改成落地页会破坏现有测试和用户路径

**风险:** 现有测试和交互默认 `/` 是地图。v8.0 改为 landing 后，如果没有清晰迁移，会导致 authenticated 用户登录后仍留在落地页，或 anonymous 用户短暂看到地图。

**预防:**
- 新增 `/map` 作为地图页。
- `/` 根据 auth 状态分流：anonymous/restoring 显示 landing/restore，authenticated redirect `/map`。
- 更新 router spec 和 App spec，显式锁定新语义。

### 4. 地图“识别即可用”被 UI 强行放开导致后端拒绝

**风险:** 前端把 `isIlluminatable` 放宽后，用户可以点击“留下足迹”，但后端 `assertAuthoritativeOverseasRecord` 仍拒绝 unsupported overseas payload。

**预防:**
- 不在 UI 层绕过 authoritative guard。
- 先识别不可用原因：缺 canonical identity、缺 boundaryId、缺 geometry manifest、metadata 不匹配。
- 对每类原因分别补 catalog/geometry/metadata，或者明确仍展示解释性不可用状态。

### 5. 独立日期弹窗和地图 active point 状态不同步

**风险:** 用户打开日期弹窗后又点击地图其他地点，提交时可能保存到旧地点或错地点。

**预防:**
- 日期弹窗打开时 snapshot 当前 canonical place payload。
- 弹窗提交使用 snapshot，而不是实时读取 `summarySurfaceState`。
- 地图重新点击时关闭旧日期弹窗或明确替换 snapshot。

### 6. 旅途回忆图表显示假数据

**风险:** 高保图里有丰富图表，如果用静态示例数据，会误导用户。

**预防:**
- 图表必须从当前账号真实 `travelRecords` 或 `/records/stats` 派生。
- 没有数据时展示空状态，不展示假趋势。
- 设计图里的“用户好评/10万+旅行者”等 landing 数字如果无法证明，应作为营销静态文案谨慎处理或改为非承诺表达。

### 7. 收藏 UI 残留

**风险:** 设计图中手账卡片、侧边栏有收藏入口；如果保留但不实现，会产生坏入口。

**预防:**
- 移除“我的收藏”菜单项。
- 移除卡片爱心/星标收藏按钮，或替换成非交互装饰并加 `aria-hidden`。
- 测试里断言不出现收藏入口文案。

## Moderate Pitfalls

### 8. 日期库输出格式不符合后端契约

**风险:** UI DatePicker 默认可能输出 `Date` 对象或 timestamp，而后端需要 `YYYY-MM-DD | null`。

**预防:**
- 使用 `value-format="YYYY-MM-DD"`（Element Plus）或 wrapper normalize（Naive UI / VueDatePicker）。
- 在 `FootprintDateDialog` 内部统一输出 `{ startDate: string | null; endDate: string | null }`。

### 9. 图表容器无高度导致空白

**风险:** ECharts/vue-echarts 常见问题是容器无明确尺寸，图表渲染为空。

**预防:**
- 每个 chart card 定义 `min-height` / `height`。
- `VChart` 使用 `autoresize`。
- Playwright 或组件测试检查 chart root 非空、canvas/svg 存在。

### 10. 动效过多影响地图和低端设备

**风险:** 大量漂浮元素、blur、drop-shadow、图表动画和 Leaflet 同时运行，可能卡顿。

**预防:**
- 动画只用 transform/opacity。
- 背景装饰固定在少量伪元素或少量绝对元素，避免滚动容器重复 repaint。
- 支持 `prefers-reduced-motion: reduce`。
- 地图区域不叠加重 blur 滤镜。

### 11. 移动端侧边栏侵占地图

**风险:** 高保图桌面左侧栏在移动端不可直接照搬，可能导致地图可视区域过小。

**预防:**
- 桌面固定 sidebar；移动端改 bottom/tab bar 或 collapsible drawer。
- 地图 stage 使用 stable min-height 和 viewport-safe sizing。

### 12. UI 库 Teleport 与现有 z-index 冲突

**风险:** DatePicker/Modal 默认 teleport 到 body，可能盖住 AuthDialog 或被 Leaflet popup 遮挡。

**预防:**
- 统一 overlay z-index token。
- 为 UI provider 配置 z-index 或在 wrapper class 中控制。
- 不再手写任意 `z-[999]`。

### 13. 旅途手账图片缩略图暗示上传能力

**风险:** 设计图中每条记录有图片，如果用户误以为可以上传照片，会与 out-of-scope 冲突。

**预防:**
- 使用地点风格插画/渐变缩略图，不展示上传按钮。
- 文案避免“照片上传”“相册管理”。
- Requirements 中写明“视觉缩略图/插画位，不支持用户上传”。

## Current-code Warning Signs

- `apps/web/src/router/index.ts`: `/` 当前是地图，必须迁移到 landing/map 分流。
- `apps/web/src/App.vue`: 当前 topbar 承接所有导航，v8.0 需要应用壳拆分。
- `apps/web/src/components/map-popup/PointSummaryCard.vue`: 当前内嵌 `TripDateForm`，与“独立日期弹窗”冲突。
- `apps/web/src/components/LeafletMapStage.vue`: `isActivePointIlluminatable` 强依赖 `boundaryId`，是覆盖扩展的核心瓶颈。
- `packages/contracts/src/stats.ts`: 当前 stats contract 过薄，不能支撑设计图所有图表。
- `apps/server/src/modules/records/records.repository.ts`: 当前 `getTravelStats` 只聚合总数、唯一地点、国家数。
- `apps/web/src/views/StatisticsPageView.vue`: 当前只有三张 StatCard，需要重构为 dashboard。

## Dependency Decision Checklist

执行 phase 前必须回答：

1. UI 库最终选 Naive UI 还是 Element Plus？
2. DatePicker 是否使用 UI 库内置，还是单独用 `@vuepic/vue-datepicker`？
3. Iconify 是否使用运行时 API，还是本地注册固定图标？
4. 旅途回忆图表数据是前端派生还是扩展后端 stats？
5. 落地页插画是否直接使用 `8.0/落地页.png` 风格切图，还是先用 CSS/本地占位资产重建？
