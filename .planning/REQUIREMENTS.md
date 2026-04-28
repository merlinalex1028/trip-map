# Requirements: 旅行世界地图

**Defined:** 2026-04-17
**Milestone:** v6.0 旅行统计、时间轴与海外覆盖增强版
**Core Value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## v6.0 Requirements

### Trip History & Timeline（旅行记录与时间轴）

- [x] **TRIP-01**: 用户点亮地点时可以选择这次旅行发生的日期
- [x] **TRIP-02**: 用户可以为同一地点保存多次旅行记录，而不是被覆盖成单次去访
- [x] **TRIP-03**: 已保存的旅行日期与同地点多次去访记录在刷新、重开应用和跨设备后仍能稳定恢复
- [x] **TRIP-04
**: 已登录用户可以从点击用户名后展开的面板进入独立的旅行时间轴页面
- [x] **TRIP-05
**: 用户可以在时间轴页面按时间顺序查看自己的旅行记录

### Statistics & Progress（统计与完成度）

- [x] **STAT-01
**: 用户可以查看基础旅行统计，包括总旅行次数、已去过地点数和已去过国家/地区数
- [x] **STAT-02
**: 用户可以查看国家/地区完成度
- [x] **STAT-03**: 当同一地点存在多次旅行记录时，统计会正确区分“总旅行次数”和“唯一地点 / 完成度”

### Overseas Expansion（海外覆盖扩展）

- [x] **GEOX-01**: 用户可以在更广的优先海外国家/地区上稳定识别并记录旅行
- [x] **GEOX-02**: 扩展后的海外记录在地图、时间轴和统计视图中保持一致的标题、类型与归类

## Future Requirements

### Account & Sync

- **AUTH-06**: 用户可以使用 Apple / Google 等第三方账号登录
- **SYNC-06**: 用户可以看到最近同步时间、同步状态与更完整的同步历史

### Sharing & Collaboration

- **SHARE-01**: 用户可以分享自己的旅行地图或与他人协作

### Coverage Depth

- **GEOX-03**: 海外覆盖从 admin1 继续扩展到更细粒度层级

## Out of Scope

| Feature | Reason |
|---------|--------|
| 第三方 OAuth 登录 | 本轮重点是旅行记录表达与统计，不扩展登录体系 |
| 同步历史 / 最近同步时间 | 本轮不处理同步可观察性增强 |
| 分享、公开主页与协作 | 会引入权限、隐私与分享模型，超出当前单用户范围 |
| 旅行照片、游记正文、标签收藏 | 当前只承载旅行日期、统计和时间轴，不做内容化扩展 |
| 单条旅行记录编辑 / 局部删除 | v6.0 先闭环新增与展示，地点级取消点亮语义暂不细化到单条记录 |
| 自动轨迹、GPS 采集或第三方行程导入 | 偏离“用户主动点亮并记录”的主线，复杂度过高 |
| 全球城市级统一覆盖 | 范围过大，v6.0 先扩展优先海外国家/地区 admin1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TRIP-01 | Phase 27 | Complete |
| TRIP-02 | Phase 27 | Complete |
| TRIP-03 | Phase 27 | Complete |
| TRIP-04 | Phase 32 | Pending |
| TRIP-05 | Phase 32 | Pending |
| STAT-01 | Phase 32 | Pending |
| STAT-02 | Phase 32 | Pending |
| STAT-03 | Phase 31 | Complete |
| GEOX-01 | Phase 28 | Complete |
| GEOX-02 | Phase 28 | Complete |

**Coverage:**
- v6.0 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-24 — gap closure phases 31-32 added after milestone audit*
