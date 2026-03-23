# Requirements: 旅行世界地图

**Defined:** 2026-03-23
**Core Value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## v1 Requirements

### Map Experience

- [ ] **MAP-01**: 用户可以在桌面端和移动端看到一张可交互的世界地图主视图
- [ ] **MAP-02**: 用户可以看到预置示例点位和已保存点位在地图上的高亮展示
- [ ] **MAP-03**: 用户点击已有点位时可以重新选中该点位并打开对应详情面板

### Geo Detection

- [ ] **GEO-01**: 用户点击地图后，系统可以将点击位置转换为对应的真实地理坐标
- [ ] **GEO-02**: 用户点击有效陆地区域后，系统可以离线识别对应的国家或地区信息
- [ ] **GEO-03**: 用户点击海洋、无效区域或无法识别的位置时，系统不会创建错误点位并会给出明确提示
- [ ] **GEO-04**: 系统在无法可靠识别城市时，仍可以以国家或地区级结果创建有效点位

### Point Management

- [ ] **PNT-01**: 用户点击已识别的真实地点后，可以创建一个包含地理信息的旅行点位
- [ ] **PNT-02**: 用户可以编辑点位的名称、简介和点亮状态
- [ ] **PNT-03**: 用户可以删除自己创建的点位
- [ ] **PNT-04**: 用户可以明显区分普通高亮点位与当前选中点位
- [ ] **PNT-05**: 用户取消新建点位时，地图上不会残留未保存的空点位

### Detail Drawer

- [ ] **DRW-01**: 用户在桌面端通过右侧抽屉查看和编辑当前点位
- [ ] **DRW-02**: 用户在移动端通过底部抽屉查看和编辑当前点位
- [ ] **DRW-03**: 用户可以在详情面板中看到地点名称、所属国家或地区、地理坐标、简介和点亮状态
- [ ] **DRW-04**: 用户可以通过关闭按钮或 `Esc` 键关闭详情面板

### Data & Persistence

- [ ] **DAT-01**: 系统首次加载时可以读取项目内置的示例点位数据
- [ ] **DAT-02**: 用户创建、编辑或删除点位后，刷新页面数据仍然保留
- [ ] **DAT-03**: 系统会以用户本地数据优先的规则合并示例点位与本地点位
- [ ] **DAT-04**: 当本地存储为空、损坏或版本不兼容时，系统可以安全回退到默认状态

### Usability & Quality

- [ ] **UX-01**: 所有地图点位和抽屉交互都具备清晰的焦点态与可点击反馈
- [ ] **UX-02**: 长文本简介不会破坏详情面板布局
- [ ] **UX-03**: 地图边界与国家边界附近的点击结果不会渲染出容器外点位

## v2 Requirements

### Rich Content

- **CONT-01**: 用户可以为地点添加图片
- **CONT-02**: 用户可以为地点添加标签、游记或时间线内容

### Enhanced Geo

- **GEOX-01**: 用户点击地图后可以获得更可靠的城市级地点识别结果
- **GEOX-02**: 用户可以使用缩放、拖拽等更精细的地图交互方式

### Sync & Sharing

- **SYNC-01**: 用户可以在多设备之间同步旅行数据
- **SYNC-02**: 用户可以导出、导入或分享自己的旅行地图

## Out of Scope

| Feature | Reason |
|---------|--------|
| 后端服务与账号系统 | v1 聚焦单用户本地体验，先验证核心地图交互 |
| 在线逆地理编码 | 与本地离线识别方向冲突，并引入外部依赖 |
| 社交、排行榜、社区内容 | 偏离个人旅行地图核心价值 |
| 富媒体旅行内容 | 会显著扩大第一版范围 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAP-01 | Phase 1 | Pending |
| MAP-02 | Phase 1 | Pending |
| MAP-03 | Phase 3 | Pending |
| GEO-01 | Phase 2 | Pending |
| GEO-02 | Phase 2 | Pending |
| GEO-03 | Phase 2 | Pending |
| GEO-04 | Phase 4 | Pending |
| PNT-01 | Phase 3 | Pending |
| PNT-02 | Phase 3 | Pending |
| PNT-03 | Phase 3 | Pending |
| PNT-04 | Phase 4 | Pending |
| PNT-05 | Phase 3 | Pending |
| DRW-01 | Phase 1 | Pending |
| DRW-02 | Phase 1 | Pending |
| DRW-03 | Phase 3 | Pending |
| DRW-04 | Phase 4 | Pending |
| DAT-01 | Phase 1 | Pending |
| DAT-02 | Phase 3 | Pending |
| DAT-03 | Phase 3 | Pending |
| DAT-04 | Phase 4 | Pending |
| UX-01 | Phase 4 | Pending |
| UX-02 | Phase 4 | Pending |
| UX-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after initial definition*
