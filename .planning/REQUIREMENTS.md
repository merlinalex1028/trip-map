# Requirements: 旅行世界地图 v8.0

**Defined:** 2026-05-09  
**Core Value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。  
**Milestone:** v8.0 Yume Kawaii 视觉重构与登录地图体验

## v8 Requirements

### Design System & Dependencies

- [ ] **DS-01**: 开发者可以在 `apps/web` 中使用 shadcn-vue 生成的本地 UI primitives，并通过 `@/` alias 稳定导入。
- [ ] **DS-02**: 应用可以使用已安装的 shadcn-vue primitives 承接 Button、Card、Dialog、Popover、Calendar、Tabs、Sidebar、Dropdown Menu、Skeleton、Scroll Area 等基础交互。
- [ ] **DS-03**: 应用可以使用 ECharts/vue-echarts 渲染旅途回忆图表，并保持图表主题与 Yume Kawaii token 一致。
- [ ] **DS-04**: 应用可以使用统一图标方案渲染地图、手账、回忆、日历、相机、奖章、星星等图标，且不依赖运行时公网拉取图标。
- [ ] **DS-05**: shadcn-vue 默认中性视觉被主题化为 Soft Pastel Glassmorphism 风格，不出现默认黑白灰组件割裂。

### Landing & Authentication Gate

- [ ] **AUTH-01**: 未登录用户访问 `/` 时看到 `8.0/落地页.png` 所表达的落地页，而不是直接进入地图。
- [ ] **AUTH-02**: 已登录用户访问 `/` 时自动进入地图应用页 `/map`。
- [ ] **AUTH-03**: 地图、旅途手账、旅途回忆等应用页面均要求登录，匿名访问时回到落地页并可触发登录。
- [ ] **AUTH-04**: 落地页的“开始记录旅途 / 免费注册”打开注册模式，“立即登录”打开登录模式。
- [ ] **AUTH-05**: 用户登录或注册成功后进入 `/map`，并看到同一账号的云端旅行记录。

### App Shell & Navigation

- [ ] **SHELL-01**: 已登录应用使用左侧 Yume Kawaii 导航壳，提供世界足迹、旅途手账、旅途回忆入口。
- [ ] **SHELL-02**: 左侧导航显示当前用户卡片、旅行记录摘要和设计图风格插画/装饰，但不显示“我的收藏”入口。
- [ ] **SHELL-03**: 移动端应用壳不会让侧边栏挤压地图主区域，导航可通过底部栏或可收起抽屉访问。
- [ ] **SHELL-04**: 全局文案完成替换：`点亮` -> `留下足迹`，`旅行统计` -> `旅途回忆`，`时间轴` -> `旅途手账`。

### World Footprints Map

- [x] **MAP-01**: 地图页保留现有 Leaflet 地图识别主链路，并升级为 `8.0/世界足迹.png` 所表达的柔粉紫地图舞台。
- [x] **MAP-02**: 地图中的已保存/识别中地点使用星形或发光足迹标记，并在 hover/active 时有轻量动效。
- [ ] **MAP-03**: 用户点击地图后，弹窗始终展示真实地点信息、类型标签、地区信息和“留下足迹”入口。
- [x] **MAP-04**: 地图弹窗不再内嵌日期表单；点击“留下足迹”后打开独立日期选择弹窗。
- [ ] **MAP-05**: 已保存地点弹窗不展示该地点过往旅行记录，也不使用“再留一次足迹”分支文案；弹窗始终保持同一套真实地点信息 UI 和“留下足迹”入口。
- [x] **MAP-06**: 网络失败、未登录、不可用地点和保存中的状态都有清晰反馈，不出现静默失败。

### Footprint Date Dialog

- [ ] **DATE-01**: “留下足迹”弹窗使用 shadcn-vue Dialog/Calendar 或等价成熟组件实现独立日期选择界面。
- [ ] **DATE-02**: 日期弹窗显示当前地点名称、类型标签、地区信息和 Yume Kawaii 插画/提示区。
- [ ] **DATE-03**: 日期弹窗支持今天、明天、本周末、选择其他日期等快捷选择。
- [ ] **DATE-04**: 日期弹窗提交值统一为 `{ startDate: string | null; endDate: string | null }`，并符合后端 `YYYY-MM-DD` 契约。
- [x] **DATE-05**: 日期弹窗打开时 snapshot 当前地点 payload，用户切换地图地点不会把记录保存到错误地点。
- [x] **DATE-06**: 取消、关闭、提交中、提交失败、提交成功状态均可访问且不会丢失焦点。

### Coverage Expansion

- [x] **COV-01**: 开发者可以识别当前“server 已识别但前端不可留下足迹”的地点类别和原因。
- [x] **COV-02**: 当前 canonical resolve 能返回完整 canonical identity 的地点应尽量拥有可保存所需的 boundaryId / geometry / metadata。
- [x] **COV-03**: 对仍不具备 authoritative 保存条件的地点，界面解释原因并避免展示可提交的“留下足迹”假入口。
- [x] **COV-04**: 扩展后的可用地点在地图高亮、旅途手账、旅途回忆统计中的标题和归类保持一致。

### Travel Journal

- [x] **JOURNAL-01**: `/timeline` 页面重命名并视觉升级为“旅途手账”。
- [x] **JOURNAL-02**: 旅途手账以发光渐变竖线、星形节点和卡片流展示每条旅行记录。
- [x] **JOURNAL-03**: 每张手账卡片展示日期、地点、地区、备注/标签摘要和视觉缩略图/插画位。
- [x] **JOURNAL-04**: 旅途手账不提供“添加新旅行”入口，新增旅行仍必须从地图真实地点进入。
- [x] **JOURNAL-05**: 旅途手账不展示收藏按钮、收藏状态或“我的收藏”相关入口。
- [x] **JOURNAL-06**: 空状态、登录恢复状态和错误状态均符合 Yume Kawaii 视觉语言。

### Travel Memories Dashboard

- [x] **MEM-01**: `/statistics` 页面重命名并视觉升级为“旅途回忆”。
- [x] **MEM-02**: 旅途回忆展示四个概览卡：总旅行次数、去过地点、去过城市或行政区、去过国家/地区。
- [x] **MEM-03**: 旅途回忆展示月度趋势折线图、国家/地区分布环图、年度趋势柱状图和旅行风格雷达图。
- [x] **MEM-04**: 旅途回忆展示热门足迹排行，不使用传统表格布局。
- [x] **MEM-05**: 旅途回忆展示回忆图片横滑/视觉缩略图区，但不提供用户上传照片能力。
- [x] **MEM-06**: 所有图表使用当前账号真实旅行记录或 server-authoritative stats 派生，不能展示静态假数据。
- [x] **MEM-07**: 无旅行记录时展示空状态，不渲染误导性的示例图表。

### Visual QA & Accessibility

- [ ] **QA-01**: 桌面和移动端截图验证落地页、地图、旅途手账、旅途回忆、留下足迹弹窗无明显重叠、截断或不可读文本。
- [x] **QA-02**: 地图和图表在本地运行时非空渲染，Leaflet 地图、星形标记、ECharts 图表均可见。
- [ ] **QA-03**: Dialog、Calendar、导航和登录入口支持键盘操作、焦点管理和可读 aria 标签。
- [x] **QA-04**: `prefers-reduced-motion` 下漂浮、呼吸、hover 动效降级，不影响核心操作。
- [ ] **QA-05**: 新增依赖不会破坏现有 auth、records、timeline、statistics 回归测试。

## Future Requirements

### Collections

- **COLL-01**: 用户可以收藏地点或旅行记录。
- **COLL-02**: 用户可以从“我的收藏”入口查看收藏内容。

### Media

- **MEDIA-01**: 用户可以为旅行记录上传照片。
- **MEDIA-02**: 用户可以管理旅行照片墙。

### Achievements

- **ACH-01**: 用户可以解锁旅行成就与徽章。
- **ACH-02**: 用户可以查看成就进度。

## Out of Scope

| Feature | Reason |
|---------|--------|
| 收藏功能 | 用户明确排除，包括我的收藏、爱心/星标收藏按钮和收藏状态 |
| 旅途手账“添加新旅行”入口 | 用户明确排除；旅行创建必须从地图真实地点进入 |
| 用户上传旅行照片 | 会引入文件存储、安全、上传 UI 和内容管理，本轮仅做视觉缩略图/插画位 |
| 真实成就/徽章系统 | 设计图可展示氛围，但不做成就数据模型和解锁规则 |
| 第三方 OAuth 登录 | 当前账号体系已满足登录门禁，本轮不扩展登录方式 |
| 社交分享/公开主页 | 会引入隐私和权限模型，超出个人旅行地图主线 |
| 前端绕过 authoritative guard 强行保存地点 | 会破坏当前 canonical 数据一致性与地图高亮契约 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DS-01 | Phase 42 | Pending |
| DS-02 | Phase 42 | Pending |
| DS-03 | Phase 42 | Pending |
| DS-04 | Phase 42 | Pending |
| DS-05 | Phase 42 | Pending |
| AUTH-01 | Phase 43 | Pending |
| AUTH-02 | Phase 43 | Pending |
| AUTH-03 | Phase 43 | Pending |
| AUTH-04 | Phase 43 | Pending |
| AUTH-05 | Phase 43 | Pending |
| SHELL-01 | Phase 43 | Pending |
| SHELL-02 | Phase 43 | Pending |
| SHELL-03 | Phase 43 | Pending |
| SHELL-04 | Phase 43 | Pending |
| MAP-01 | Phase 44 | Complete |
| MAP-02 | Phase 44 | Complete |
| MAP-03 | Phase 44 | Pending |
| MAP-04 | Phase 44 | Complete |
| MAP-05 | Phase 44 | Pending |
| MAP-06 | Phase 44 | Complete |
| DATE-01 | Phase 44 | Pending |
| DATE-02 | Phase 44 | Pending |
| DATE-03 | Phase 44 | Pending |
| DATE-04 | Phase 44 | Pending |
| DATE-05 | Phase 44 | Complete |
| DATE-06 | Phase 44 | Complete |
| COV-01 | Phase 45 | Complete |
| COV-02 | Phase 45 | Complete |
| COV-03 | Phase 45 | Complete |
| COV-04 | Phase 45 | Complete |
| JOURNAL-01 | Phase 46 | Complete |
| JOURNAL-02 | Phase 46 | Complete |
| JOURNAL-03 | Phase 46 | Complete |
| JOURNAL-04 | Phase 46 | Complete |
| JOURNAL-05 | Phase 46 | Complete |
| JOURNAL-06 | Phase 46 | Complete |
| MEM-01 | Phase 47 | Complete |
| MEM-02 | Phase 47 | Complete |
| MEM-03 | Phase 47 | Complete |
| MEM-04 | Phase 47 | Complete |
| MEM-05 | Phase 47 | Complete |
| MEM-06 | Phase 47 | Complete |
| MEM-07 | Phase 47 | Complete |
| QA-01 | Phase 48 | Partial |
| QA-02 | Phase 48 | Complete |
| QA-03 | Phase 48 | Gaps Found |
| QA-04 | Phase 48 | Complete |
| QA-05 | Phase 48 | Gaps Found |

**Coverage:**
- v8 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0

---
*Requirements defined: 2026-05-09*
*Last updated: 2026-05-09 after v8.0 roadmap*
