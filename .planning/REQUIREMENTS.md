# Requirements: 旅行世界地图

**Defined:** 2026-04-10
**Milestone:** v5.0 账号体系与云同步基础版
**Core Value:** 用户点击地图后，系统必须能以本地静态地理数据稳定判断真实地点，并把旅行点位可靠保存下来。

## v5.0 Requirements

### Authentication（账号身份）

- [x] **AUTH-01**: 用户可以使用邮箱和密码注册新账号
- [x] **AUTH-02**: 用户可以使用邮箱和密码登录，并能主动退出当前账号
- [x] **AUTH-03**: 用户刷新页面或重新打开应用后，会话仍能恢复到同一账号
- [x] **AUTH-04**: 未登录用户仍可浏览地图，只在保存或同步旅行记录时被引导登录
- [x] **AUTH-05**: 已登录用户可以明确看到当前账号身份，并能从界面进入退出操作

### Sync & Ownership（记录归属与云同步）

- [x] **SYNC-01**: 登录后用户只能读取当前账号自己的旅行记录
- [x] **SYNC-02**: 登录后用户点亮地点时，旅行记录会绑定到当前账号并保存到云端
- [x] **SYNC-03**: 登录后用户取消点亮地点时，云端对应记录会同步删除或标记为取消
- [x] **SYNC-04**: 同一账号在另一台设备登录后，可以看到与原设备一致的旅行记录
- [x] **SYNC-05**: 点亮、取消点亮与拉取记录失败时，用户能得到明确的同步成功、失败或需要重新登录提示

### Session & Migration（会话边界与首次迁移）

- [x] **MIGR-01**: 本地已有旅行记录的用户首次登录时，可以选择将本地记录合并到账号
- [x] **MIGR-02**: 本地已有旅行记录的用户首次登录时，也可以选择以当前账号云端记录为准而不导入本地记录
- [x] **MIGR-03**: 本地记录导入账号时，会按 canonical place 去重，避免同一地点重复出现
- [x] **MIGR-04**: 用户退出登录或切换账号后，界面会清空上一账号的记录并重新加载当前会话的数据

### Overseas Coverage（海外覆盖扩展）

- [ ] **OVRS-01**: 用户可以在一组优先海外国家/地区的一级行政区上稳定识别并点亮地点
- [ ] **OVRS-02**: 已保存的海外旅行记录在刷新、重开和跨设备后，仍能稳定显示标题、类型标签和副标题
- [ ] **OVRS-03**: 点击暂未支持的海外区域时，用户会看到明确的“暂不支持点亮该地区”说明，而不是静默失败

## Future Requirements

### v6.0+

- **AUTH-06**: 用户可以使用 Apple / Google 等第三方账号登录
- **SYNC-06**: 用户可以看到最近同步时间与更完整的同步历史
- **STAT-01**: 用户可以查看国家/地区完成度和基础旅行统计
- **GEOX-01**: 海外覆盖从 admin1 继续扩展到更广泛国家或更细粒度层级
- **SHARE-01**: 用户可以分享自己的旅行地图或与他人协作

## Out of Scope

| Feature | Reason |
|---------|--------|
| 强制首屏登录墙 | 当前优先目标是先让用户看到地图价值，再在保存/同步时升级登录 |
| 第三方 OAuth 登录 | 会增加集成与审计复杂度，v5.0 先做邮箱密码闭环 |
| 实时位置追踪 / 自动旅行轨迹 | 偏离当前“用户主动点亮”产品主线，隐私与复杂度过高 |
| 多人协作地图 / 社交关系 | 会引入权限与共享模型，超出单用户账号化范围 |
| 全球城市级统一覆盖 | 规模过大，v5.0 只承诺优先海外 admin1 扩展 |
| 非阻塞型技术债全面清理 | 本轮技术债只处理会直接阻塞账号化、同步或海外覆盖的部分 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 23 | Complete |
| AUTH-02 | Phase 23 | Complete |
| AUTH-03 | Phase 23 | Complete |
| AUTH-04 | Phase 24 | Complete |
| AUTH-05 | Phase 23 | Complete |
| SYNC-01 | Phase 23 | Complete |
| SYNC-02 | Phase 23 | Complete |
| SYNC-03 | Phase 25 | Complete |
| SYNC-04 | Phase 25 | Complete |
| SYNC-05 | Phase 25 | Complete |
| MIGR-01 | Phase 24 | Complete |
| MIGR-02 | Phase 24 | Complete |
| MIGR-03 | Phase 24 | Complete |
| MIGR-04 | Phase 24 | Complete |
| OVRS-01 | Phase 26 | Pending |
| OVRS-02 | Phase 26 | Pending |
| OVRS-03 | Phase 26 | Pending |

**Coverage:**
- v5.0 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-15 — Phase 25 completed after sync semantics verification*
