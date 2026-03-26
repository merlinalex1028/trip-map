# Requirements: 旅行世界地图

**Defined:** 2026-03-25
**Milestone:** v2.0 城市主视角与可爱风格重构
**Core Value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## v2.0 Requirements

### Destination Selection

- [ ] **DEST-01**: 用户点击地图后，系统在置信度足够时优先返回城市级选择结果，而不是默认停留在国家或地区级结果
- [ ] **DEST-02**: 用户可以通过城市候选或搜索入口选择目标城市，而不必依赖极小的地图点击命中区
- [ ] **DEST-03**: 当系统无法可靠确认城市时，用户可以看到明确的失败提示，并回退到国家或地区级结果继续记录
- [ ] **DEST-04**: 当存在同名城市或边界附近的歧义时，用户可以看到带国家或上级区域信息的候选列表来确认最终城市
- [ ] **DEST-05**: 用户再次选择已记录过的城市时，系统优先定位到现有城市记录或对应点位，而不是盲目创建重复记录

### Boundary Highlighting

- [ ] **BND-01**: 用户选中城市后，地图会以真实城市边界范围高亮该城市，而不是仅显示单个点状 marker 作为主表达
- [ ] **BND-02**: 用户在 popup、详情面板和保存结果中看到的城市身份，与地图上被高亮的城市边界保持一致
- [ ] **BND-03**: 用户在 hover、选中、关闭 popup、切换城市或返回已有点位时，城市边界高亮状态切换稳定且不会残留错误面域

### Popup Interaction

- [ ] **POP-01**: 用户选中城市或已有点位后，可以看到锚定在地图上下文中的悬浮 popup 摘要卡
- [x] **POP-02**: 用户可以在 popup 中完成高频快捷操作，并通过显式入口进入完整详情或编辑视图
- [ ] **POP-03**: 用户在移动端使用时，popup 会自动避开视口边缘，必要时回退为安全的底部 peek 或等效轻量展示

### Data & Compatibility

- [ ] **DAT-05**: 用户升级到 v2.0 后，现有 v1 本地点位仍然可用，不会被强制错误迁移成具体城市记录
- [ ] **DAT-06**: 用户保存 v2.0 点位后，系统会持久化稳定的城市身份引用，使同一城市在后续重开时能够恢复一致的高亮与详情语义

### Visual Redesign

- [ ] **VIS-01**: 用户在地图、城市边界、marker、popup、详情面板和主要按钮中看到统一的原创二次元美少女可爱风格
- [ ] **VIS-02**: 用户在桌面端和移动端都能清晰区分未记录、已记录、当前选中和低置信度回退等关键状态，不会因新风格降低可读性
- [ ] **VIS-03**: 用户进行地图点击、marker 点击和 popup 操作时，装饰图层和反馈动效不会遮挡命中区域或破坏交互

## Future Requirements

### Rich Content

- **CONT-01**: 用户可以为城市地点添加图片
- **CONT-02**: 用户可以为城市地点添加标签、游记或时间线内容

### Sync & Sharing

- **SYNC-01**: 用户可以导入或导出自己的旅行地图数据
- **SYNC-02**: 用户可以分享自己的旅行地图，或在多设备之间同步数据

### Extended Exploration

- **GEOX-02**: 用户可以使用缩放、拖拽等更精细的地图交互方式
- **PLN-01**: 用户可以维护想去城市、路线规划或旅行愿望清单
- **STAT-01**: 用户可以查看旅行统计、成就或进度面板

## Out of Scope

| Feature | Reason |
|---------|--------|
| 在线逆地理编码、在线搜索或第三方地点 API | 与本项目离线识别方向冲突，也会把核心识别质量交给外部服务 |
| 地图引擎整体替换为 `MapLibre`、`Leaflet` 或其他 slippy map 方案 | 这是架构级重做，不是本 milestone 的增量目标 |
| popup 承担完整编辑表单 | 会与现有 drawer 职责重叠，增加两套详情入口长期分裂风险 |
| 全量全球 POI、乡镇、景点级搜索 | 数据清洗、别名和排序复杂度过高，超出“城市主视角”范围 |
| 账号系统、后端服务、多端同步 | 本 milestone 仍以单用户本地体验为主 |
| 社交、排行榜、社区内容流 | 偏离个人旅行地图主线 |
| 与地图主链路无关的全站统一重设计 | 当前视觉重构范围仅限地图、popup、drawer、marker、边界和主要操作控件 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEST-01 | Phase 7 | Pending |
| DEST-02 | Phase 7 | Pending |
| DEST-03 | Phase 7 | Pending |
| DEST-04 | Phase 7 | Pending |
| DEST-05 | Phase 7 | Pending |
| BND-01 | Phase 8 | Pending |
| BND-02 | Phase 8 | Pending |
| BND-03 | Phase 8 | Pending |
| POP-01 | Phase 9 | Pending |
| POP-02 | Phase 9 | Complete |
| POP-03 | Phase 9 | Pending |
| DAT-05 | Phase 7 | Pending |
| DAT-06 | Phase 8 | Pending |
| VIS-01 | Phase 10 | Pending |
| VIS-02 | Phase 10 | Pending |
| VIS-03 | Phase 10 | Pending |

**Coverage:**
- v2.0 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after v2.0 roadmap traceability mapping*
