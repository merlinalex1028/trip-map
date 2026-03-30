# Requirements: 旅行世界地图

**Defined:** 2026-03-27
**Milestone:** v3.0 全栈化与行政区地图重构
**Core Value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## v3.0 Requirements

### Architecture & Monorepo

- [x] **ARC-01**: 项目代码库拆分为 `apps/web`、`apps/server` 和最小共享契约层，使前后端可以独立运行与构建
- [x] **ARC-02**: `server` 从 `v3.0` 开始成为 canonical area resolve 的权威来源，前端不再长期保留另一套主判定逻辑
- [ ] **ARC-03**: 系统以 PostgreSQL 兼容数据库作为正式持久化基础，并允许采用 `Supabase` 这类托管 PostgreSQL 方案而不把业务模型绑定到平台私有能力
- [x] **ARC-04**: 前后端通过共享契约明确 `placeId`、`boundaryId`、`placeKind`、`datasetVersion` 等关键字段，避免多端语义漂移

### Canonical Place Model

- [x] **PLC-01**: 中国境内地点以市级行政区作为正式记录语义，海外地点以一级行政区作为正式记录语义
- [x] **PLC-02**: 系统为每个可记录地点生成稳定的 canonical `placeId`，而不是依赖展示名称或临时拼接字符串作为主键
- [x] **PLC-03**: 系统会持久化 `placeKind`、`boundaryId`、`datasetVersion` 和原始点击坐标，以支持后续重开和版本兼容
- [x] **PLC-04**: 当地点无法可靠命中到中国市级或海外一级行政区时，系统会给出明确 fallback，而不是静默创建错误地点
- [ ] **PLC-05**: 用户在 popup、drawer、已保存记录和地图高亮中看到的是同一个 canonical 地点身份，不会出现名称、边界和保存结果不一致

### Geo Data & Delivery

- [ ] **GEOX-03**: 中国行政区边界数据使用阿里云 `DataV.GeoAtlas` 的合规市级 GeoJSON 作为正式来源
- [ ] **GEOX-04**: 海外行政区边界数据使用去除中国区域后的 `Natural Earth admin-1` GeoJSON 作为正式来源
- [ ] **GEOX-05**: 系统不在底层预合并中国与海外 GeoJSON，而是在前端 `Leaflet` 中直接加载两个独立图层
- [ ] **GEOX-06**: 系统会对中国与海外数据建立统一的字段、ID 与版本清单，但保持两套来源与图层边界可追踪
- [ ] **GEOX-07**: 系统会验证并固定中国与海外数据在 `Leaflet` 渲染中的坐标适配规则，避免中国边界与点击位置发生错位

### Map Experience

- [ ] **MAP-04**: 前端地图主引擎切换为 `Leaflet`，并保持现有主链路所需的点击、选中、高亮和弹层交互能力
- [ ] **MAP-05**: 地图会同时渲染海外一级行政区图层与中国市级图层，并在视觉与交互上保持统一体验
- [ ] **MAP-06**: 用户选中地点后，地图会以该行政区完整 GeoJSON 边界进行高亮，而不是退回单点 marker 作为主表达
- [ ] **MAP-07**: 用户点亮或取消点亮地点后，地图边界样式会立即与当前记录状态同步
- [ ] **MAP-08**: 地图切换选中对象、关闭 popup、重开已有记录时，不会残留错误高亮或出现双重选中状态

### Records & API

- [ ] **API-01**: 用户的旅行记录读取、创建、更新、删除，以及点亮 / 取消点亮动作，都通过 `server` API 持久化
- [ ] **API-02**: 点亮 / 取消点亮动作以 canonical `placeId` 为目标，而不是依赖前端临时点位或展示名
- [ ] **API-03**: 系统会提供地点摘要、边界引用或几何资源入口，使前端可以按需加载并缓存行政区边界
- [ ] **API-04**: 首发版本默认不要求引入 `PostGIS`、`Redis`、`BullMQ` 或对象存储，只有在实际规模证明需要时再升级基础设施
- [ ] **API-05**: `v3.0` 启动后系统不再读取、迁移或兼容旧 `localStorage` 旅行数据，统一以新的服务端数据模型为准

### Popup, Drawer & Inline Illuminate

- [ ] **UIX-01**: 用户选中地点后，仍然通过现有 popup + drawer 的双层表面完成摘要查看与深度编辑，不因全栈化或换图引擎而退化
- [ ] **UIX-02**: 地点面板标题右侧提供明确的“点亮 / 取消点亮”按钮，不使用 checkbox 作为主要交互形式
- [ ] **UIX-03**: 用户点击点亮 / 取消点亮后，可以立即看到按钮文案、状态色和地图边界高亮同步变化
- [x] **UIX-04**: 用户可以清楚区分“中国市级”和“海外一级行政区”这两类地点语义，不会被统一伪装成“城市”
- [ ] **UIX-05**: popup、drawer、地图高亮和 API 返回状态在成功、失败、加载中三种情况下都保持一致反馈

## Future Requirements

### Sync & Accounts

- **SYNC-01**: 用户可以在多设备之间同步旅行数据
- **SYNC-02**: 用户可以导出、导入或分享自己的旅行地图
- **AUTH-01**: 用户可以登录并在不同设备访问自己的记录

### Geo Expansion

- **GEOX-08**: 海外地点支持细化到城市级或更细行政层级
- **OPS-01**: 几何数据升级为 `R2/S3` 或更复杂的服务端几何交付链路

## Out of Scope

| Feature | Reason |
|---------|--------|
| `v3.0` 首发就引入 `PostGIS`、`Redis`、`BullMQ`、微服务或复杂消息系统 | 当前 milestone 重点是稳住全栈边界、行政区语义与主链路，而不是过早扩张基础设施 |
| 把所有 GeoJSON 几何直接存入数据库并以实时 polygon 查询作为主链路 | 当前更适合用版本化静态资产承载几何数据，避免 day 1 就把几何服务化 |
| 在本 milestone 同时完成账号体系、多人同步、社交或分享平台化 | 会显著扩大范围，稀释全栈化与行政区语义重构主线 |
| 海外城市级、POI 级或自定义地图编辑能力 | 当前明确收口为“中国市级 / 海外一级行政区” |
| popup 承担完整编辑表单，打破现有 popup / drawer 分工 | 会让当前稳定的摘要 / 深度表面契约重新分裂 |
| 旧 `localStorage` 旅行数据迁移、兼容或回放 | 你已明确不再保留旧本地数据链路 |
| 历史预设 seed 点位继续保留、合并或转译到新模型 | 你已明确旧预设点位不再使用 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARC-01 | Phase 11 | Complete |
| ARC-02 | Phase 12 | Complete |
| ARC-03 | Phase 11 | Complete |
| ARC-04 | Phase 11 | Complete |
| PLC-01 | Phase 12 | Complete |
| PLC-02 | Phase 12 | Complete |
| PLC-03 | Phase 12 | Complete |
| PLC-04 | Phase 12 | Complete |
| PLC-05 | Phase 12 | Blocked |
| GEOX-03 | Phase 13 | Pending |
| GEOX-04 | Phase 13 | Pending |
| GEOX-05 | Phase 13 | Pending |
| GEOX-06 | Phase 13 | Pending |
| GEOX-07 | Phase 13 | Pending |
| MAP-04 | Phase 14 | Pending |
| MAP-05 | Phase 14 | Pending |
| MAP-06 | Phase 14 | Pending |
| MAP-07 | Phase 15 | Pending |
| MAP-08 | Phase 14 | Pending |
| API-01 | Phase 15 | Pending |
| API-02 | Phase 15 | Pending |
| API-03 | Phase 13 | Pending |
| API-04 | Phase 11 | Complete |
| API-05 | Phase 15 | Pending |
| UIX-01 | Phase 14 | Pending |
| UIX-02 | Phase 15 | Pending |
| UIX-03 | Phase 15 | Pending |
| UIX-04 | Phase 12 | Complete |
| UIX-05 | Phase 15 | Pending |

**Coverage:**
- v3.0 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after v3.0 requirement confirmation*
